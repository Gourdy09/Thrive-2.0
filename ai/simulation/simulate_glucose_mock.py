"""
Mock glucose simulator with proper gradient flow.
"""

import torch
from typing import List, Dict, Any
from ai.models.user.parameters import UserParams


def simulate_glucose_mock(
    G0: float,
    time,
    meals: List[Dict[str, Any]],
    activity: List[Dict[str, Any]],
    insulin_medications: List[Dict[str, Any]],
    other_medications: List[Dict[str, Any]],
    params: UserParams,
    insulin: bool,
    insulin_type: str | None,
) -> torch.Tensor:
    """
    Mock glucose simulator with proper gradient flow.
    
    Returns realistic glucose trajectory while maintaining differentiability.
    """
    
    # Convert time to tensor
    if isinstance(time, list):
        time_tensor = torch.tensor(time, dtype=torch.float32)
    else:
        time_tensor = torch.tensor(time, dtype=torch.float32) if not isinstance(time, torch.Tensor) else time
    
    # Total carbs from all meals
    total_carbs = sum(m.get("carbs", 0.0) for m in meals)
    
    # Initialize glucose trajectory
    glucose_trajectory = []
    
    # Process each time point
    for t in time_tensor:
        t_val = t.item()  # Convert to float for control flow
        
        # ===== Carb Effect =====
        # Simple model: carbs cause a rise that peaks at 45 min and decays
        carb_effect = torch.tensor(0.0, dtype=torch.float32)
        
        if total_carbs > 0 and t_val < 180:  # 3 hour window
            if t_val < 45:
                # Rising phase
                phase = t_val / 45.0
                carb_response = torch.tensor(phase, dtype=torch.float32)
            else:
                # Decay phase
                decay_factor = torch.tensor((t_val - 45.0) / 90.0, dtype=torch.float32)
                carb_response = torch.exp(-decay_factor)
            
            # Scale by parameters (now keeping as tensors!)
            carb_effect = torch.tensor(total_carbs, dtype=torch.float32) * params.beta1 * carb_response
        
        # ===== Activity Effect =====
        activity_effect = torch.tensor(0.0, dtype=torch.float32)
        for act in activity:
            intensity = act.get("intensity", 0.0)
            activity_effect = activity_effect - torch.tensor(intensity, dtype=torch.float32) * params.beta5
        
        # ===== Insulin Effect =====
        insulin_effect = torch.tensor(0.0, dtype=torch.float32)
        for med in insulin_medications:
            med_time = med.get("time", 0)
            if t_val >= med_time:
                insulin_effect = insulin_effect - torch.tensor(0.5, dtype=torch.float32) * params.beta4
        
        # ===== Combine Effects =====
        total_effect = carb_effect + activity_effect + insulin_effect
        
        # ===== Add Noise =====
        noise = torch.randn(1, dtype=torch.float32) * 0.5
        
        glucose_trajectory.append(total_effect + noise)
    
    # Stack all time points
    trajectory = torch.stack(glucose_trajectory)
    
    # Add baseline and clamp to realistic range
    result = torch.tensor(G0, dtype=torch.float32) + trajectory
    result = torch.clamp(result, min=50.0, max=300.0)
    
    return result