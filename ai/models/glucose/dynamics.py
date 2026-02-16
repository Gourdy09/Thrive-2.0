import torch 
from ai.models.glucose.absorption import carbs_absorption, total_carb_effect
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
) -> torch.Tensor:
    """
    Single step glucose update - returns TENSOR for gradient flow
    
    G_{t+1} = G_t + β1·carbs_t(1 + ρ·Liquid_t)
                  + β2·bN_t
                  + β3·(carbS_t · bN_t)
                  - β4·iE_t
                  + β5·activity_t
                  + β(6-9) later on 
                  + ε_t
    """
    
    carbs_t = total_carb_effect(t, meals, params)
    
    Liquid_t = torch.tensor(1.0 if any(m.get("is_liquid", False) for m in meals) else 0.0, dtype=torch.float32)
    
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
    
    # Activity effect
    activity_t = torch.tensor(sum(a.get("intensity", 0.0) for a in activity), dtype=torch.float32) # chnage later 
    
    # Noise term
    epsilon_t = torch.randn(1, dtype=torch.float32) * params.sigma
    
    bN_tensor = torch.tensor(float(bN), dtype=torch.float32)
    
    delta_G = (
        params.beta1 * carbs_t * (1.0 + params.rho * Liquid_t)
        + params.beta2 * bN_tensor
        + params.beta3 * (carbS_t * bN_tensor)
        - params.beta4 * iE_t
        + params.beta5 * activity_t
        + epsilon_t
    )

    return torch.tensor(G_tilde, dtype=torch.float32) + delta_G