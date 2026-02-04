import torch
from typing import List, Dict, Any
from ai.models.user.parameters import UserParams


def carbs_absorption(
    carbs: float,
    t_meal: float,
    t: float,
    k_base: float,        # baseline glucose absorption rate
    su: float,            # user-specific absorption speed multiplier
    alpha: float,         # learned sensitivity to fiber
    fiber_ratio: float,   # fiber / carb ratio for this meal
    eta_liq: float,       # liquid multiplier
    is_liquid: bool,      # True if meal is liquid, else False
    eta_fp_u: float,      # user-specific fat/protein effect
    fatprotein_i: float   # normalized fat+protein content of meal (0-1)
) -> float:
    """
    Compute the absorbed carbs at time t from a single meal.
    
    Args:
        carbs: grams of carbohydrates
        t_meal: meal time
        t: current time
        k_base: baseline absorption rate
        su: user-specific absorption multiplier
        alpha: fiber sensitivity coefficient
        fiber_ratio: fiber content ratio
        eta_liq: liquid adjustment factor
        is_liquid: whether meal is liquid
        eta_fp_u: fat/protein user sensitivity
        fatprotein_i: normalized fat+protein content
        
    Returns:
        Absorbed carbohydrate amount at time t
    """
    liquid_multiplier = (1.0 + eta_liq) if is_liquid else 1.0
    fiber_multiplier = 1.0 / (1.0 + alpha * fiber_ratio)
    fatprotein_multiplier = 1.0 / (1.0 + eta_fp_u * fatprotein_i)

    k_abs_i = k_base * su * fiber_multiplier * liquid_multiplier * fatprotein_multiplier

    dt = max(0.0, t - t_meal)
    absorption = carbs * k_abs_i * (1.0 - torch.exp(torch.tensor(-dt * k_abs_i)))
    absorption = max(0.0, absorption.item() if isinstance(absorption, torch.Tensor) else absorption)
    
    return absorption


def total_carb_effect(t: float, meals: List[Dict[str, Any]], params: UserParams) -> float:
    """
    Sum absorption from all meals at time t.
    
    Args:
        t: current timestamp (float or tensor)
        meals: list of dicts, each with meal info
        params: UserParams object with absorption parameters
        
    Returns:
        Total carb absorption from all meals at time t
    """
    return sum(
        carbs_absorption(
            c["carbs"],
            c["t_meal"],
            t,
            params.k_base,
            params.su,
            c.get("alpha", 0.3),
            c.get("fiber_ratio", 0.0),
            params.eta_liq,
            c.get("is_liquid", False),
            params.eta_fp_u,
            c.get("fatprotein", 0.0)
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
    """
    Compute total carb absorption over time t for a batch of meals.
    
    Args:
        carbs: torch.Tensor, shape (num_meals,)
        t_meal: torch.Tensor, shape (num_meals,)
        t: torch.Tensor, shape (num_timesteps,)
        k_base: baseline absorption rate
        su: user absorption multiplier
        alpha: torch.Tensor, shape (num_meals,)
        fiber_ratio: torch.Tensor, shape (num_meals,)
        eta_liq: liquid adjustment factor
        is_liquid: torch.Tensor, shape (num_meals,), boolean
        eta_fp_u: fat/protein user sensitivity
        fatprotein: torch.Tensor, shape (num_meals,)
    
    Returns:
        absorption: torch.Tensor, shape (num_timesteps,)
    """
    is_liquid_float = is_liquid.float()
    liquid_multiplier = 1.0 + eta_liq * is_liquid_float
    
    fiber_multiplier = 1.0 / (1.0 + alpha * fiber_ratio)
    fatprotein_multiplier = 1.0 / (1.0 + eta_fp_u * fatprotein)

    k_abs_i = k_base * su * fiber_multiplier * liquid_multiplier * fatprotein_multiplier 

    # t: (num_timesteps,) -> reshape for broadcasting
    # t_meal: (num_meals,)
    dt = t.unsqueeze(1) - t_meal.unsqueeze(0)  # (num_timesteps, num_meals)
    dt = torch.clamp(dt, min=0.0)  

    # carbs: (num_meals,) -> (1, num_meals)
    # k_abs_i: (num_meals,) -> (1, num_meals)
    absorption_per_meal = carbs.unsqueeze(0) * k_abs_i.unsqueeze(0) * (1.0 - torch.exp(-dt * k_abs_i.unsqueeze(0)))
    
    total_absorption = absorption_per_meal.sum(dim=1)  # (num_timesteps,)
    
    return torch.clamp(total_absorption, min=0.0)