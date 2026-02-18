import torch 
from ai.models.glucose.dynamics import step_glucose
from ai.models.user.parameters import UserParams

# 1 sequence 
G_obs = torch.tensor([...]) # your glucose reading 
carb_effect = torch.tensor([...])
circadian_offset = torch.tensor([...])
night_penalty = torch.tensor([...])
insulin_effect = torch.tensor([...])
activity_effect = torch.tensor([...])

params = UserParams()
G_tilde = torch.zeros(1) 
predictions= [] 

for t in range(len(G_obs)):
    G_tilde = step_glucose(
        G_tilde,
        carb_effect[t],
        circadian_offset[t],
        night_penalty[t],
        insulin_effect[t],
        activity_effect[t],
        params
    )
    predictions.append(G_tilde)

predictions = torch.stack(predictions)
loss = torch.mean((predictions.squeeze() + params.Gb - G_obs)**2)
