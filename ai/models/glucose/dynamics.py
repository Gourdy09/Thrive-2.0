import torch 
from ai.models.glucose.absorption import carbs_absorption, total_carb_effect
from ai.models.glucose.medication import calculate_insulin_effect
from ai.models.user.parameters import UserParams
from components.ai_medication.convert_medication_period import convert_medication_period

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
    params: UserParams,
    medication_period: str = "unknown"
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
    MEDICATION_EFFECTS = {
        'baseline': {'carb_mult': 1.0, 'insulin_mult': 1.0},
        'pioglitazone_45': {'carb_mult': 0.95, 'insulin_mult': 1.1},
        'metformin_500': {'carb_mult': 0.90, 'insulin_mult': 1.15},
        'metformin_500_er': {'carb_mult': 0.88, 'insulin_mult': 1.2},
        'unknown': {'carb_mult': 1.0, 'insulin_mult': 1.0}
    }
    med_effect = MEDICATION_EFFECTS.get(medication_period, MEDICATION_EFFECTS['unknown'])
    carb_mult = torch.tensor(med_effect['carb_mult'], dtype=torch.float32)
    insulin_mult = torch.tensor(med_effect['insulin_mult'], dtype=torch.float32)
    
    other_meds = convert_medication_period(medication_period, t)
    all_other_meds = (other_meds or []) + other_meds

    carbs_t = total_carb_effect(t, meals, params)
    
    Liquid_t = torch.tensor(1.0 if any(m.get("is_liquid", False) for m in meals) else 0.0, dtype=torch.float32)
    
    carbS_t = carbs_t / 100.0
    
    iE_t = calculate_insulin_effect(
        t=t,
        insulin=insulin,
        insulin_type=insulin_type,
        insulin_medications=insulin_medications or [],
        bN=bN,
        meals=meals or [],
        params=params,
        meds=all_other_meds or []
    )
    
    # Activity effect
    activity_t = torch.tensor(sum(a.get("intensity", 0.0) for a in activity), dtype=torch.float32) # chnage later 
    
    # Noise term
    epsilon_t = torch.randn(1, dtype=torch.float32) * params.sigma
    
    bN_tensor = torch.tensor(float(bN), dtype=torch.float32)
    
    delta_G = (
        params.beta1 * carbs_t * carb_mult * (1.0 + params.rho * Liquid_t)
        + params.beta2 * bN_tensor
        + params.beta3 * (carbS_t * bN_tensor)
        - params.beta4 * iE_t * insulin_mult
        + params.beta5 * activity_t
        + epsilon_t
    )

    return torch.tensor(G_tilde, dtype=torch.float32) + delta_G