import torch
from typing import List, Dict, Any
from ai.models.user.parameters import UserParams
from ai.models.glucose.absorptions_util import getK_abs_i, getK_abs_i_batch


def carbs_absorption(
    carbs: float,
    t_meal: float,
    t: float,
    fiber_ratio: float,
    is_liquid: bool,
    fatprotein_i: float,
    params: UserParams
) -> torch.Tensor:
    
    k_abs_i = getK_abs_i(
        params.k_base,
        params.su,
        params.alpha,
        fiber_ratio,
        params.eta_liq_u,
        is_liquid,
        params.eta_fp_u,
        fatprotein_i
    )

    dt = max(0.0, t - t_meal)
    
    dt_tensor = torch.tensor(dt, dtype=torch.float32)
    carbs_tensor = torch.tensor(carbs, dtype=torch.float32)
    
    absorption = carbs_tensor * (1.0 - torch.exp(-dt_tensor * k_abs_i))
    
    return torch.clamp(absorption, min=0.0)


def total_carb_effect(
    t: float,
    meals: List[Dict[str, Any]],
    params: UserParams
) -> torch.Tensor:
    
    if not meals:
        return torch.tensor(0.0, dtype=torch.float32)
    
    total = torch.tensor(0.0, dtype=torch.float32)
    for m in meals:
        absorption = carbs_absorption(
            carbs=m["carbs"],
            t_meal=m["t_meal"],
            t=t,
            fiber_ratio=m.get("fiber_ratio", 0.0),
            is_liquid=m.get("is_liquid", False),
            fatprotein_i=m.get("fatprotein", 0.0),
            params=params
        )
        total = total + absorption
    
    return total


def carbs_absorption_batch(
    carbs: torch.Tensor,
    t_meal: torch.Tensor,
    t: torch.Tensor,
    k_base: float,
    su: float,
    alpha: torch.Tensor,
    fiber_ratio: torch.Tensor,
    eta_liq: float,
    is_liquid: torch.Tensor,
    eta_fp_u: float,
    fatprotein: torch.Tensor
) -> torch.Tensor:
    
    k_abs_i = getK_abs_i_batch(
        k_base,
        su,
        alpha,
        fiber_ratio,
        eta_liq,
        is_liquid,
        eta_fp_u,
        fatprotein
    )

    dt = torch.clamp(t.unsqueeze(1) - t_meal.unsqueeze(0), min=0.0)
    absorption_per_meal = carbs.unsqueeze(0) * (1.0 - torch.exp(-dt * k_abs_i.unsqueeze(0)))
    
    return torch.clamp(absorption_per_meal.sum(dim=1), min=0.0)