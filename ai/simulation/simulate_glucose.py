from typing import List, Dict, Any
import torch
from ai.models.user.parameters import UserParams
from ai.models.glucose.dynamics import step_glucose


def simulate_glucose(
    G0: float,
    time,
    meals: List[Dict[str, Any]],
    activity: List[Dict[str, Any]],
    insulin_medications: List[Dict[str, Any]],
    other_medications: List[Dict[str, Any]],
    params: UserParams,
    insulin: bool,
    insulin_type: str | None,
    medication_period: str = "unknown",
) -> torch.Tensor:
    """
    Simulate glucose trajectory over time.
    
    Returns TENSOR to maintain gradient flow for training.
    """
    
    if isinstance(time, list):
        time = torch.tensor(time, dtype=torch.float32)
    elif not isinstance(time, torch.Tensor):
        time = torch.tensor([time], dtype=torch.float32)
    
    G = [torch.tensor(G0, dtype=torch.float32)]
    
    for i in range(len(time) - 1):
        current_time = time[i].item() if isinstance(time[i], torch.Tensor) else time[i]
        
        bN = 1 if (22 <= current_time or current_time < 6) else 0
        
        # Step glucose forward 
        G_next = step_glucose(
            G_tilde=G[i].item() if isinstance(G[i], torch.Tensor) else G[i],
            t=current_time,
            meals=meals,
            activity=activity,
            insulin_medications=insulin_medications,
            other_medications=other_medications,
            insulin=insulin,
            insulin_type=insulin_type,
            bN=bN,
            params=params,
            medication_period=medication_period
        )
        
        G.append(G_next)
    
    # Stack all glucose values into single tensor
    result = torch.cat([g.unsqueeze(0) if g.dim() == 0 else g for g in G])
    
    return result