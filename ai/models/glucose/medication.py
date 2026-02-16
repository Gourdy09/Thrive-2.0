import torch
from typing import Any, List, Dict
from ai.models.user.parameters import UserParams
from ai.models.glucose.absorptions_util import getK_abs_i
from components.ai_medication.med_durationmodel import med_durationModel


def calculate_insulin_effect(
    t: float,
    insulin: bool,
    insulin_type: str | None,
    insulin_medications: List[Dict[str, Any]],
    bN: int,
    meals: List[Dict[str, Any]],
    params: UserParams,
    meds: List[Dict[str, Any]],
) -> torch.Tensor:
    endo = calculate_endo_insulin(t, params, bN, meals)
    med = calculate_med_effect(meds, t)
    if insulin and insulin_type:
        exo = calculate_exo_insulin(t, insulin_type, insulin_medications, params)
    else:
        exo = torch.tensor(0.0, dtype=torch.float32)
    
    return endo + exo + med


def calculate_endo_insulin(
    t: float,
    params: UserParams,
    bN: int,
    meals: List[Dict[str, Any]],
) -> torch.Tensor:
    total_endo = torch.tensor(0.0, dtype=torch.float32)
    
    for meal in meals:
        carbs = meal["carbs"]
        t_meal = meal["t_meal"]
        fiber_ratio = meal.get("fiber_ratio", 0.1)
        is_liquid = meal.get("is_liquid", False)
        fatprotein = meal.get("fatprotein", 0.1)
        
        k_abs_i = getK_abs_i(
            params.k_base,
            params.su,
            params.alpha,
            fiber_ratio,
            params.eta_liq_u,
            is_liquid,
            params.eta_fp_u,
            fatprotein,
        )
        
        delta_t = max(0.0, t - t_meal)
        delta_t_tensor = torch.tensor(delta_t, dtype=torch.float32)
        
        # Absorption kernel: e^(-k_abs_i * delta_t)
        exp_term = torch.exp(-delta_t_tensor * k_abs_i)
        
        endo_insulin = (
            torch.tensor(carbs, dtype=torch.float32)
            * k_abs_i
            * (1.0 - exp_term)
            * (1.0 - torch.sigmoid(params.delta_u) * torch.tensor(float(bN), dtype=torch.float32))
        )
        
        total_endo = total_endo + endo_insulin
    
    return total_endo


def calculate_exo_insulin(
    t: float,
    insulin_type: str,
    insulin_medications: List[Dict[str, Any]],
    params: UserParams,
) -> torch.Tensor:
    total_exo = torch.tensor(0.0, dtype=torch.float32)
    
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
        
        total_exo = total_exo + insulin_effect
    
    return total_exo


def get_rapid_acting(delta_t: float, units: float, params: UserParams) -> torch.Tensor:
    if delta_t < 0 or delta_t > 5.0:  
        return torch.tensor(0.0, dtype=torch.float32)
    
    k = 2.0
    delta_t_tensor = torch.tensor(delta_t, dtype=torch.float32)
    units_tensor = torch.tensor(units, dtype=torch.float32)
    
    effect = units_tensor * delta_t_tensor * torch.exp(-k * delta_t_tensor)
    return effect


def get_short_acting(delta_t: float, units: float) -> torch.Tensor:
    if delta_t < 0 or delta_t > 8.0:
        return torch.tensor(0.0, dtype=torch.float32)
    
    delta_t_tensor = torch.tensor(delta_t, dtype=torch.float32)
    units_tensor = torch.tensor(units, dtype=torch.float32)
    
    effect = units_tensor * (delta_t_tensor / 2.0) * torch.exp(-0.5 * delta_t_tensor)
    return effect


def get_intermediate(delta_t: float, units: float, params: UserParams) -> torch.Tensor:
    if delta_t < 0 or delta_t > 12.0: 
        return torch.tensor(0.0, dtype=torch.float32)
    
    delta_t_tensor = torch.tensor(delta_t, dtype=torch.float32)
    units_tensor = torch.tensor(units, dtype=torch.float32)
    t_peak = 4.0
    
    numerator = (delta_t_tensor / t_peak) ** 2
    denominator = 1.0 + (delta_t_tensor / t_peak) ** 2
    effect = units_tensor * (numerator / denominator) * torch.exp(-delta_t_tensor / 12.0)
    return effect


def get_long_acting(delta_t: float, units: float) -> torch.Tensor:
    if 0 <= delta_t <= 24.0:
        return torch.tensor(units / 24.0, dtype=torch.float32)
    else:
        return torch.tensor(0.0, dtype=torch.float32)


def calculate_med_effect(
    meds: List[Dict[str, Any]],
    t: float,  
) -> torch.Tensor:
    total_med = torch.tensor(0.0, dtype=torch.float32)
    
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
        delta_t_tensor = torch.tensor(delta_t, dtype=torch.float32)
        w_k_tensor = torch.tensor(w_k, dtype=torch.float32)
        
        effect_kernel = torch.exp(-((delta_t_tensor / w_k_tensor) ** 2))
        
        med_effect = torch.tensor(dose, dtype=torch.float32) * effect_kernel
        total_med = total_med + med_effect
    
    return total_med