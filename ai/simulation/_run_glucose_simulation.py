from typing import List, Dict, Any
import torch
from ai.models.user.parameters import UserParams
from ai.simulation.simulate_glucose import simulate_glucose
def run_glucose_simulation(
    sequences: List[Dict[str, Any]],
    sensor_window: List[Dict[str, Any]],
    params: UserParams,
) -> torch.Tensor:
    
    G0 = params.Gb
    time_hours = []

    for s in sequences:
        ts = s['timestamp']
        if isinstance(ts, str):
            dt_obj = __import__("datetime").datetime.fromisoformat(ts.replace("Z", "+00:00"))
        else:
            dt_obj = ts
        time_hours.append(dt_obj.hour + dt_obj.minute / 60.0)

    meals = sequences

    insulin_medications = [s.get('insulin_medications', []) for s in sequences]
    insulin_flags = [bool(meds) for meds in insulin_medications]
    insulin_types = [meds[0].get('type') if meds else None for meds in insulin_medications]
    other_medications = [s.get('other_medications', []) for s in sequences]
    activity = sensor_window

    G = [torch.tensor(G0, dtype=torch.float32)]

    for i in range(len(time_hours) - 1):
        current_time = time_hours[i]

        G_next = simulate_glucose(
            G0=G[i].item() if isinstance(G[i], torch.Tensor) else G[i],
            time=[current_time, time_hours[i + 1]],  
            meal=[meals[i]],
            activity=[activity[i]], 
            insulin_medications=insulin_medications[i] if insulin_flags[i] else [],
            other_medications=other_medications[i],
            params=params,
            insulin=insulin_flags[i],
            insulin_type=insulin_types[i],
            medication_period=meals[i]['meal_features'].get('medication_period', 'unknown')
        )

        G.append(G_next[-1].detach() if G_next.dim() > 0 else G_next.detach())

    return torch.cat([g.unsqueeze(0) if g.dim() == 0 else g for g in G])