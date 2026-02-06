import torch
from typing import Any, List, Dict
from ai.models.user.parameters import UserParams
from ai.models.glucose.absorptions_util import getk_absi
from components.ai_medication.med_durationmodel import med_durationModel
params = UserParams()

def calculate_insulin_effect(
    t: float,
    insulin: bool,
    insulin_type: str | None,
    insulin_medications: List[Dict[str, Any]],
    bN: int,
    meals: List[Dict[str, Any]],
    params: UserParams,
    meds:  List[Dict[str, Any]],
) -> float:
    """Calculate total insulin effect (endogenous + exogenous + medication)"""
    endo = calculate_endo_insulin(t, params, bN, meals)
    med = calculate_med_effect(meds,t)
    if insulin and insulin_type:
        exo = calculate_exo_insulin(t, insulin_type, insulin_medications, params)
    else:
        exo = 0.0
    
    return endo + exo + med


def calculate_endo_insulin(
    t: float,
    params: UserParams,
    bN: int,
    meals: List[Dict[str, Any]],
) -> float:
    """Calculate endogenous insulin from carb absorption"""
    total_endo = 0.0
    
    for meal in meals:
        carbs = meal["carbs"]
        t_meal = meal["t_meal"]
        fiber_ratio = meal.get("fiber_ratio", 0.1)
        is_liquid = meal.get("is_liquid", False)
        fatprotein = meal.get("fatprotein", 0.1)
        
        k_abs_i = getk_absi(
            params.k_base,
            params.su,
            params.alpha,
            fiber_ratio,
            params.eta_liq,
            is_liquid,
            params.eta_fp_u,
            fatprotein,
        )
        
        delta_t = max(0.0, t - t_meal)
        
        # Absorption kernel: e^(-k_abs_i * delta_t)
        exp_term = torch.exp(torch.tensor(-k_abs_i * delta_t))
        
        endo_insulin = (
            carbs
            * k_abs_i
            * (1.0 - exp_term.item())
            * (1.0 - torch.sigmoid(torch.tensor(params.delta_u)).item() * bN)
        )
        
        total_endo += endo_insulin
    
    return total_endo


def calculate_exo_insulin(
    t: float,
    insulin_type: str,
    insulin_medications: List[Dict[str, Any]],
    params: UserParams,
) -> float:
    """Calculate exogenous insulin effect"""
    total_exo = 0.0
    
    for med in insulin_medications:
        units = med["units"]
        delta_t = max(0.0, t - med["time"])
        med_type = med.get("type", insulin_type)
        
        if med_type == "Rapid-Acting":
            insulin_effect = get_rapid_acting(delta_t, units, params)
        elif med_type == "Short-Acting (Regular)":
            insulin_effect = get_short_acting(delta_t, units)
        elif med_type == "Intermediate-Acting":
            insulin_effect = get_intermediate(delta_t, units, params)
        else:  
            insulin_effect = get_long_acting(delta_t, units)
        
        total_exo += insulin_effect
    
    return total_exo


def get_rapid_acting(delta_t: float, units: float, params: UserParams) -> float:
    if delta_t < 0 or delta_t > 5.0:  
        return 0.0
    
    k = 2.0  
    effect = units * delta_t * torch.exp(torch.tensor(-k * delta_t))
    return effect.item()


def get_short_acting(delta_t: float, units: float) -> float:
    if delta_t < 0 or delta_t > 8.0:
        return 0.0
    
    effect = units * (delta_t / 2.0) * torch.exp(torch.tensor(-0.5 * delta_t))
    return effect.item()


def get_intermediate(delta_t: float, units: float, params: UserParams) -> float:
    if delta_t < 0 or delta_t > 12.0: 
        return 0.0
    
    t_peak = 4.0
    numerator = (delta_t / t_peak) ** 2
    denominator = 1.0 + (delta_t / t_peak) ** 2
    effect = units * (numerator / denominator) * torch.exp(torch.tensor(-delta_t / 12.0))
    return effect.item()


def get_long_acting(delta_t: float, units: float) -> float:
    if 0 <= delta_t <= 24.0:
        return units / 24.0
    else:
        return 0.0
def calculate_med_effect(
    t: float,  
    meds: List[Dict[str, Any]],
) -> float:
    total_med = 0.0
    
    for med in meds:
        dose = med.get("dose", 0)
        med_id = med.get("med_id")
        med_class = med.get("med_class")
        t_k = med.get("t_k", 0) 
        
        model = med_durationModel([med_id])
        t_duration = model.t_duration(med_id, med_class)
        
        # Width of gaussian decay: duration / 3
        w_k = t_duration / 3.0
        
        # Gaussian decay centered at t_k: exp(-((t - t_k) / w_k)^2)
        delta_t = t - t_k
        effect_kernel = torch.exp(-((delta_t / w_k) ** 2))
        
        med_effect = dose * effect_kernel.item()
        total_med += med_effect
    
    return total_med