from typing import List, Dict, Any
import torch
from ai.models.user.parameters import UserParams
from ai.models.glucose.dynamics import step_glucose


def simulate_glucose(
    G0: float,
    time: torch.Tensor,
    meals: List[Dict[str, Any]],
    activity: List[Dict[str, Any]],
    insulin_medications: List[Dict[str, Any]],
    other_medications: List[Dict[str, Any]],
    params: UserParams,
    insulin: bool,
    insulin_type: str | None,
) -> torch.Tensor:
    G = [G0]
    if isinstance(time, list):
        time = torch.tensor(time, dtype=torch.float32)
    
    for i in range(len(time) - 1):
        current_time = time[i].item() if isinstance(time[i], torch.Tensor) else time[i]
        bN = 1 if 22 <= current_time or current_time < 6 else 0
        
        # Pass raw data - let step_glucose compute effects
        G_next = step_glucose(
            G_tilde=G[i],
            t=current_time,
            meals=meals,
            activity=activity,
            insulin_medications=insulin_medications,
            other_medications=other_medications,
            insulin=insulin,
            insulin_type=insulin_type,
            bN=bN,
            params=params
        )
        
        G.append(G_next.item() if isinstance(G_next, torch.Tensor) else G_next)
    
    return torch.tensor(G, dtype=torch.float32)