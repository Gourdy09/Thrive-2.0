import torch 
from ai.models.glucose.absorption import carbs_absorption, total_carb_effect
from ai.models.glucose.medication import calculate_insulin_effect
from ai.models.user.parameters import UserParams
from components.ai_medication.convert_medication_period import convert_medication_period
from ai.models.glucose.activity import activity_Effect
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
    medication_period: str = "unknown",
    training: bool = False 
) -> torch.Tensor:

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
    all_other_meds = (other_meds or []) + (other_medications or [])

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
    VM_avg          = torch.tensor(0.0, dtype=torch.float32)
    VM_peak         = torch.tensor(0.0, dtype=torch.float32)
    HR_postprandial = torch.tensor(0.0, dtype=torch.float32)
    HRV_response    = torch.tensor(0.0, dtype=torch.float32)
    step_freq       = torch.tensor(0.0, dtype=torch.float32)
    sedentary_minutes = torch.tensor(0.0, dtype=torch.float32)
    HRV_drop        = torch.tensor(0.0, dtype=torch.float32)
    HR_response     = torch.tensor(0.0, dtype=torch.float32)
    HRV_drop_norm   = torch.tensor(0.0, dtype=torch.float32)
    activity_t      = torch.tensor(0.0, dtype=torch.float32)

    # Activity effect
    if activity:
        s = activity[-1]
        VM_avg = torch.tensor(s.get("activity_mean",0.0), dtype=torch.float32)
        VM_peak = torch.tensor(s.get("hr_peak", 0.0), dtype=torch.float32)
        HR_postprandial = torch.tensor(s.get("hrv_post_mean", 0.0), dtype=torch.float32)
        HRV_response = torch.tensor(s.get("hrv_baseline", 0.0), dtype=torch.float32)
        step_freq = torch.tensor(s.get("real_packet_count", 0.0), dtype=torch.float32)
        sedentary_minutes = torch.tensor(0.0, dtype=torch.float32)  # placeholder
        HRV_drop = torch.tensor(s.get("hrv_drop",0.0), dtype=torch.float32)
        HR_response    = torch.tensor(s.get("hr_response",     0.0), dtype=torch.float32)
        HRV_drop_norm = torch.tensor(s.get("hrv_drop_norm",0.0), dtype=torch.float32)
        activity_t = activity_Effect(VM_avg, VM_peak, HRV_response, step_freq, sedentary_minutes, HR_postprandial)
    else:
        activity_t = torch.tensor(0.0, dtype=torch.float32)
    # Noise term
    epsilon_t =(
        torch.zeros(1, dtype=torch.float32)
        if training
        else torch.randn(1, dtype=torch.float32) * params.sigma
    )
    # epsilon_t = torch.zeros(1) if kwargs.get("training", False) else torch.randn(1) * params.sigma
    bN_tensor = torch.tensor(float(bN), dtype=torch.float32)
    
    delta_G = (
        params.beta1 * carbs_t * carb_mult * (1.0 + params.rho * Liquid_t)
        + params.beta2 * bN_tensor
        + params.beta3 * (carbS_t * bN_tensor)
        - params.beta4 * iE_t * insulin_mult
        + params.beta5 * activity_t
        + params.beta6 * HRV_drop
        + params.beta7 * HR_postprandial
        + params.beta8 * (carbS_t * HRV_drop_norm)
        + params.beta9 * (bN_tensor * HR_response)
        + epsilon_t
    )

    return torch.tensor(G_tilde, dtype=torch.float32) + delta_G