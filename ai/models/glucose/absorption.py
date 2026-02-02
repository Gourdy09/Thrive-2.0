import torch
from ai.models.user.parameters import UserParams
params = UserParams()
def carbs_absorption(
    carbs, 
    t_meal, 
    t,
    k_base: float,        # baseline glucose absorption rate
    su: float,            # user-specific absorption speed multiplier
    alpha: float,         # learned sensitivity to fiber
    fiber_ratio: float,   # fiber / carb ratio for this meal
    eta_liq: float,       # liquid multiplier
    is_liquid: bool,      # True if meal is liquid, else False
    eta_fp_u: float,      # user-specific fat/protein effect
    fatprotein_i: float   # normalized fat+protein content of meal (0-1)
):
    """
    Compute the absorbed carbs at time t from a single meal.
    """
    liquid_multiplier = 1 + eta_liq if is_liquid else 1.0
    fiber_multiplier = 1 / (1 + alpha * fiber_ratio)
    fatprotein_multiplier = 1 / (1 + eta_fp_u * fatprotein_i)

    k_abs_i = k_base * su * fiber_multiplier * liquid_multiplier * fatprotein_multiplier

    dt = t - t_meal
    dt = torch.clamp(dt, min=0.0)  
    absorption = carbs * k_abs_i * (1 - torch.exp(-dt * k_abs_i))
    absorption = torch.clamp(absorption, min=0.0)  # ensure non-negative
    return absorption

def total_carb_effect(t, meals, params):
    """
    Sum absorption from all meals at time t
    t: current timestamp (float or tensor)
    meals: list of dicts, each with meal info
    params: UserParams 
    """
    return sum(
        carbs_absorption(
            c["carbs"],
            c["t_meal"],
            t, # current_time = torch.tensor(120.0)  
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
    
    Returns:
        absorption: torch.Tensor, shape (num_timesteps,)
    """
    liquid_multiplier = torch.where(is_liquid, 1.0 + eta_liq, torch.ones_like(is_liquid, dtype=torch.float))
    fiber_multiplier = 1 / (1 + alpha * fiber_ratio)
    fatprotein_multiplier = 1 / (1 + eta_fp_u * fatprotein)

    k_abs_i = k_base * su * fiber_multiplier * liquid_multiplier * fatprotein_multiplier 

    # t: (num_timesteps,) -> reshape for broadcasting
    dt = t.unsqueeze(1) - t_meal.unsqueeze(0)  
    dt = torch.clamp(dt, min=0.0)  

    absorption_per_meal = carbs.unsqueeze(0) * k_abs_i.unsqueeze(0) * (1 - torch.exp(-dt * k_abs_i.unsqueeze(0)))
    total_absorption = absorption_per_meal.sum(dim=1)  
    
    return total_absorption
