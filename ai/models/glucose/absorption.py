import torch
from typing import List, Dict, Any
from ai.models.user.parameters import UserParams
from ai.models.glucose.absorptions_util import getK_abs_i, getK_abs_i_batch
params = UserParams()
def carbs_absorption(
    carbs: float,
    meals: list[dict[str,any]],
    t_meal: float,
    t: float,
    fiber_ratio: float,
    is_liquid: bool,
    fatprotein_i: float,
    params: UserParams
) -> float:
    
    k_abs_i = getK_abs_i(
        params.k_base,
        params.su,
        params.alpha,
        fiber_ratio,
        params.eta_liq,
        is_liquid,
        params.eta_fp_u,
        fatprotein_i
    )

    dt = max(0.0, t - meals["t_meal"])

    # correct continuous absorption form
    absorption = carbs * (1.0 - torch.exp(torch.tensor(-dt * k_abs_i)))

    return float(torch.clamp(absorption, min=0.0))

def total_carb_effect(
    t: float,
    meals: List[Dict[str, Any]],
    params: UserParams
) -> float:
    return sum(
        carbs_absorption(
            carbs=c["carbs"],
            t_meal=c["t_meal"],
            t=t,
            k_base=params.k_base,
            su=params.su,
            alpha=c.get("alpha", 0.3),
            fiber_ratio=c.get("fiber_ratio", 0.0),
            eta_liq=params.eta_liq,
            is_liquid=c.get("is_liquid", False),
            eta_fp_u=params.eta_fp_u,
            fatprotein_i=c.get("fatprotein", 0.0)
        )
        for c in meals
    )



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

    absorption_per_meal = carbs.unsqueeze(0) * (
        1.0 - torch.exp(-dt * k_abs_i.unsqueeze(0))
    )

    return torch.clamp(absorption_per_meal.sum(dim=1), min=0.0)
