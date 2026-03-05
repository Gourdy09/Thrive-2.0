"""
Computes prediction uncertainty and confidence bands from a forecast:

    σ_t  = Var( G̃_{t : t+W} )^0.5
    band = [ μ_t - Δ,  μ_t + Δ ]
    Δ    = clip( k_sigma * σ_t,  Δ_min,  Δ_max )

Also houses the per-user window optimiser:

    W* = argmax_{W ∈ {30,45,60,75}} Hit(W)
    Hit(W) = fraction of fingerstick anchors where
             G_finger ∈ [μ_t(W) - Δ,  μ_t(W) + Δ]

    Target: ≥80 % coverage within ±15 mg/dL
            ≥90 % coverage within ±20 mg/dL   (spec §7.2)
"""
from __future__ import annotations
import math 
from typing import Any, Dict, List, Optional, Tuple
import torch 
from ai.prediction.forecast import CANDIDATE_WINDOWS_MIN, DEFAULT_WINDOW_MIN, forecast
from ai.models.user.parameters import UserParams

# band constants 
K_SIGMA: float = 1.5 # σ multiplier  →  Δ = k * σ
DELTA_MIN: float = 10.0 # floor 
DELTA_MAX: float = 30.0 # ceiling 
# hit metric targets (spec 7.2.3)
TARGET_80_MG: float = 15.0
TARGET_90_MG: float = 20.0 

def _window_variance(
    trajectory: torch.Tensor,
    step_idx: int,
    steps_per_win: int,
) -> float:
    # Bessel-corrected variance 
    start = step_idx
    end = min(start + steps_per_win, len(trajectory))
    if end - start < 2:
        return 0.0
    window_slice = trajectory[start:end].float()
    return float(window_slice.var(unbiased=True))

def _delta(sigma: float) -> float:
    return float(max(DELTA_MIN, min(DELTA_MAX, K_SIGMA * sigma)))

def compute_confidence_bands(
    trajectory: List[float],
    mu: List[float],
    dt_minutes: float = 15.0,
    window_minutes:  int = DEFAULT_WINDOW_MIN,
) -> Dict[str, List[float]]:
    """
     Returns
    -------
    {
        "sigma"  : List[float]   – σ_t at each step
        "delta"  : List[float]   – Δ_t at each step
        "lower"  : List[float]   – μ_t - Δ_t
        "upper"  : List[float]   – μ_t + Δ_t
    }
    """
    traj_tensor = torch.tensor(trajectory, dtype=torch.float32)
    steps_per_win = max(1, round(window_mintes / dt_minutes))
    T = len(trajectory )

    sigmas: List[float] = []
    deltas: List[float] = []
    lower: List[float] = []
    upper: List[float] = []

    for i in range(T):
        var_i = _window_variance(traj_tensor,i, steps_per_win)
        sigma_i = math.sqrt(var_i)
        delta_i = _delta(sigma_i)
        mu_i = mu[i]

        sigmas.append(round(sigma_i, 4))
        deltas.append(round(delta_i, 4))
        lower.append(round(mu_i - delta_i, 2))
        upper.append(round(mu_i + delta_i, 2))
    return {
        "sigma": sigmas,
        "delta": deltas,
        "lower": lower,
        "upper": upper,
    }

def hit_rate(
    mu_at_fingerstick: List[float],
    fingerstick_values: List[float],
) -> Tuple[float, float]:

    """
    Compute hit rates for ±15 and ±20 mg/dL targets.
    Returns: (hit_rate_15, hit_rate_20)
        hit_rate_15 : fraction of sticks within ±15 mg/dL  (target ≥ 0.80)
        hit_rate_20 : fraction of sticks within ±20 mg/dL  (target ≥ 0.90)

    """

    if not fingerstick_values:
        return 0.0,0.0
    n= len(fingerstick_values)
    h15 = sum(
        1 for mu,d,g in zip(mu_at_fingerstick,fingerstick_values)
        if abs(g-mu) <= TARGET_80_MG
    )
    h20 = sum(
        1 for mu, d, g in zip(mu_at_fingerstick, fingerstick_values)
        if abs(g - mu) <= TARGET_90_MG
    )
    return h15 / n, h20 / n 

def optimized_window(
    fingerstick_times: List[float],
    fingerstick_values: List[float],
    sequences: List[Dict[str, Any]],
    sensor_window: List[Dict[str, Any]],
    params: UserParams,
    dt_minutes: float = 15.0,
) -> int:

    """
    W* = argmax Hit(W)  over W ∈ {30, 45, 60, 75}

    Falls back to DEFAULT_WINDOW_MIN if no fingerstick data is available
    or no candidate meets the coverage targets.
    """

    if not fingerstick_values:
        return DEFAULT_WINDOW_MIN
    best_window = DEFAULT_WINDOW_MIN
    best_h15 = -1.0

    for w in CANDIDATE_WINDOWS_MIN:
        result = forecast(
            sequences=sequences,
            sensor_window=sensor_window,
            params=params,
            window_minutes=w,
        )

        time_points = result["time_points"]
        mu = result["mu"]
        trajectory = result["trajectory"]
        bands = compute_confidence_bands(trajectory, mu, dt_minutes,w)

        my_at_fs: List[float] = [
            mu[min(range(len(time_points)), key=lambda i: abs(time_points[i]- fs_t))]
            for fs_t in fingerstick_times
        ]

        h15,h20 = hit_rate(mu_at_fs, fingerstick_values)
        meets_targets = h15 > 0.80 and h20 >= 0.90

        if meets_targets and h15 > best_h15:
            best_h15    = h15
            best_window = w

        elif best_h15 < 0 and h15 > best_h15:
            best_h15    = h15
            best_window = w

    return best_window

def build_forecast_response(
    forecast_result: Dict[str,Any],
    dt_minutes: float = 15.0
) -> Dict[str, Any]: 
    """
    Convenience wrapper: takes the dict from forecast() and appends
    confidence bands.  Returns everything the API / GlucoseChart needs.
    """
    trajectory = forecast_result["trajectory"]
    mu = forecast_result["mu"]
    window_minutes = forecast_result["window_minutes"]

    bands = compute_confidence_bands(trajectory, m, dt_minutes, window_minutes)

    return {
        "timePoints":    forecast_result["time_points"],
        "trajectory":    trajectory,
        "mu":            mu,
        "lower":         bands["lower"],
        "upper":         bands["upper"],
        "sigma":         bands["sigma"],
        "windowMinutes": window_minutes,
    }

