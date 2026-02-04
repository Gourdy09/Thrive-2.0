from typing import List, Dict, Any
import torch
from ai.models.user.parameters import UserParams
from ai.models.glucose.absorption import carbs_absorption_batch, carbs_effect_at_time
from ai.models.glucose.dynamics import step_glucose
from ai.models.glucose.activity import activity_effect_at_time
from ai.models.glucose.medication import insulin_effect_at_time
from ai.models.glucose.circadian import circadian_offset, night_penalty


def simulate_glucose(
    G0: float,
    time: torch.Tensor,
    meals: List[Dict[str, Any]],
    activity: List[Dict[str, Any]],
    medication: List[Dict[str, Any]],
    params: UserParams
) -> torch.Tensor:
    """
    Simulate glucose levels over time given meals, activity, and medication.
    
    Args:
        G0: Initial glucose level (mg/dL)
        time: torch.Tensor of time points (minutes or hours, shape (num_timesteps,))
        meals: List of meal dictionaries with keys: carbs, t_meal, is_liquid, fiber_ratio, etc.
        activity: List of activity events
        medication: List of medication/insulin events
        params: UserParams object containing absorption and glucose dynamics parameters
    
    Returns:
        torch.Tensor of glucose levels at each time point, shape (num_timesteps,)
    
    Example:
        G0 = 100.0
        time = torch.linspace(0, 240, 480)  # 0 to 240 minutes
        meals = [{"carbs": 50, "t_meal": 60, "is_liquid": False, "fiber_ratio": 0.05}]
        activity = []
        medication = []
        params = UserParams()
        glucose_trajectory = simulate_glucose(G0, time, meals, activity, medication, params)
    """
    G = [G0]
    
    if isinstance(time, list):
        time = torch.tensor(time, dtype=torch.float32)
    
    # Simulate glucose at each time step
    for i in range(len(time) - 1):
        current_time = time[i].item() if isinstance(time[i], torch.Tensor) else time[i]
        
        carb_effect = carbs_effect_at_time(current_time, meals, params)
        activity_effect = activity_effect_at_time(current_time, activity)
        insulin_effect = insulin_effect_at_time(current_time, medication)
        circ_offset = circadian_offset(current_time)
        night_pen = night_penalty(current_time, meals)
        
        G_next = step_glucose(
            G[i],
            carb_effect,
            circ_offset,
            night_pen,
            insulin_effect,
            activity_effect,
            params
        )
        
        G.append(G_next)
    
    return torch.tensor(G, dtype=torch.float32)