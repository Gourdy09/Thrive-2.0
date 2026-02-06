import torch 
import math
from ai.models.glucose.absorption import carbs_absorption
from ai.models.glucose.medication import calculate_insulin_effect
from ai.models.user.parameters import UserParams

def step_glucose(
    G_tilde: float,
    t: float,
    meals: list,
    insulin_medications: list,
    other_medications: list,
    activity: list,
    insulin: bool,
    insulin_type: str | None,
    bN: int,  # 1 if night, 0 if day
    params: UserParams
) -> float:
    """
    G_{t+1} = G_t + β1·carbs_t(1 + ρ·Liquid_t)
                  + β2·bN_t
                  + β3·(carbS_t · bN_t)
                  - β4·iE_t
                  + β5·activity_t
                  add the rest after we get the sensor 
                  + ε_t
    """
    
    carbs_t = sum(
        carbs_absorption(
            carbs=m["carbs"],
            t_meal=m["t_meal"],
            t=t,
            fiber_ratio=m.get("fiber_ratio", 0.0),
            is_liquid=m.get("is_liquid", False),
            fatprotein_i=m.get("fatprotein", 0.0),
            params=params
        )
        for m in meals
    )
    
    Liquid_t = 1.0 if any(m.get("is_liquid", False) for m in meals) else 0.0
    
    carbS_t = carbs_t / 100.0  
    
    iE_t = calculate_insulin_effect(
        t=t,
        insulin=insulin,
        insulin_type=insulin_type,
        insulin_medications=insulin_medications,
        bN=bN,
        meals=meals,
        params=params,
        meds=other_medications
    )
    
    activity_t = sum(
        a.get("intensity", 0.0)  # or more complex activity_effect() function
        for a in activity
    )
    
    # ε_t: noise term
    epsilon_t = torch.randn(1).item() * params.sigma  # sigma = noise std dev
    
    delta_G = (
        params.beta1 * carbs_t * (1.0 + params.rho * Liquid_t)
        + params.beta2 * bN
        + params.beta3 * (carbS_t * bN)
        - params.beta4 * iE_t
        + params.beta5 * activity_t
        + epsilon_t
    )
    
    return G_tilde + delta_G