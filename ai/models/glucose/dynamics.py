import torch 
from ai.models.glucose.absorption import carbs_absorption
from ai.models.user.parameters import UserParams

params = UserParams()

def step_glucose(
    G_tilde,
    t: float ,
    meals: list,
    circadian_offset,
    night_penalty,
    insulin_effect,
    activity_effect,
    hr_effects=None,
    params=params
):
    """ One timestamp update of rel glucose
    G_tilde: previous relative glucose (scalar tensor)
    carb_effect: effect of carbs at this timestep
    circadian_offset: circadian modulation
    night_penalty: penalty for eating at night
    insulin_effect: effect of insulin
    activity_effect: effect of physical activity
    hr_effects: the rest of the betas 
    params: UserParams (learnable)
"""
    carb_effect_t = sum(
        carbs_absorption(
            carbs=torch.tensor(m["carbs"], dtype=torch.float),
            t_meal=torch.tensor(m["t_meal"], dtype=torch.float),
            t=torch.tensor(t, dtype=torch.float),
            k_base=params.k_base.item(),
            su=params.su.item(),
            alpha=m.get("alpha", 0.3),           # other number is defaulted if not provided 
            fiber_Ratio=m.get("fiber_ratio", 0.0),
            eta_liq=m.get("eta_liq", 0.6),
            is_liquid=m.get("is_liquid", False),
            eta_fp_u=m.get("eta_fp_u", 0.2),
            fatprotein_i=m.get("fatprotein", 0.0)
        )
        for m in meals
    )
    delta_G = (
        params.beta1 * carb_effect_t 
        + params.beta2 * circadian_offset
        + params.beta3 * night_penalty
        - params.beta4 * insulin_effect
        - params.beta5 * activity_effect
    )
    if hr_effects is not None:
        delta_G += params.beta6 * hr_effects[0]
        delta_G += params.beta7 * hr_effects[1]
        delta_G += params.beta8 * hr_effects[2]
        delta_G += params.beta9 * hr_effects[3]
        
    return G_tilde + delta_G