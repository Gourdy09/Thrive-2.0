"""
Runs simulation over time hoirzona nd aggregates 
the raw step wise G values into windowed predictions 

μ_t = (1/W) * Σ_{k=1}^{W} G̃_{t+k}

The window W is fixed at 60 min for the first 7 days, then selected
from {30, 45, 60, 75} min via the hit-metric optimiser in confidence.py.
"""
from __future__ import annotations
import math 
from typing import Any, Dict, List, Optional
import torch 
from ai.models.user.parameters import UserParams
from ai.simulation._run_glucose_simulation import run_glucose_simulation

CANDIDATE_WINDOWS_MIN: List[int] = [30,45,60,75]
DEFAULT_WINDOW_MIN: int = 60 
FIXED_WINDOW_DAYS: int = 7 

def select_window(
    days_since_start: int,
    optimized_window: Optional[int] = None 
) -> int: 
    if days_since_start < FIXED_WINDOW_DAYS:
        return DEFAULT_WINDOW_MIN
    return optimized_window if optimized_window is not None else DEFAULT_WINDOW_MIN

def _time_points_from_sequences(
    sequences: List[Dict[str, Any]],
) -> List[float]:
    times: List[float] = []
    for s in sequences:
        ts = s.get("timestamp","")
        try:
            if isinstance(ts,str):
                dt_obj = datetime.fromisoformat(ts.replace("Z","+00:00"))
            else:
                dt_obj = ts
            times.append(dt_obj.hour + dt_obj.minute / 60.0)
        except Exception:
            times.append(0.0)
    return times 

def _window_mean(
    trajectory: torch.Tensor,
    step_idx: int,
    steps_per_win: int,
) -> float:
    start= step_idx +1
    end = min(start + steps_per_win, len(trajectory))
    if start >= len(trajectory):
        return trajectory[-1].item()
    return float(trajectory[start:end].mean())

def _steps_per_window(
    time_points: List[float],
    window_minutes: int,
) -> int:
     """
     Convert window_minutes into a step count based on the actual median
     inter-step gap in the sequence timestamps.
     """
     if len(time_points) < 2:
        return 1
        gaps_hours = [
            abs(time_points[i+1] -  time_points[i])
            for i in range(len(time_points)-1)
        ]
        gaps_hours.sort()
        median_gap_hrs = gaps_hours[len(gaps_hours) // 2]
        median_gap_min = median_gap_hrs * 60.0
        if median_gap_min <= 0:
            return 1
        return max(1, round(window_minutes / median_gap_min))

def forecast (
    sequences: List[Dict[str, Any]],
    sensor_window: List[Dict[str, Any]],
    params: UserParams,
    window_minutes: int = DEFAULT_WINDOW_MIN,
) -> Dict[str,Any]:
    if not sequences:
        return {
            "time_points":    [],
            "trajectory":     [],
            "mu":             [],
            "window_minutes": window_minutes,
        }
    with torch.no_grad():
        traj_tensor: torch.Tensor = run_glucose_simulation(
            sequences=sequences,
            sensor_window=sensor_window,
            params=params,
        )
    trajectory: List[float] = traj_tensor.tolist()
    time_points: List[float] = _time_points_from_sequences(sequences)
    if len(trajectory) != len(time_points):
        n = min(len(trajectory), len(time_points))
        trajectory = trajectory[:n]
        time_points = time_points[:n]
        
    steps_per_win = _steps_per_window(time_points, window_minutes)

    traj_t = torch.tensor(trajectory, dtype=torch.float32)
    mu: List[float]= [
        _window_mean(traj_t,i, steps_per_win)
        for i in range (len(trajectory))
    ]
    return {
        "time_points":    time_points,
        "trajectory":     trajectory,
        "mu":             mu,
        "window_minutes": window_minutes,
    }
