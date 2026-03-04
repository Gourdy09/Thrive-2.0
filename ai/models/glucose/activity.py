import torch 
from ai.models.user.parameters import UserParams
def activity_Effect(VM_avg, VM_peak, HRV_response, step_freq, sedentary_minutes, HR_postprandial):
    """
    α = torch.tensor([α1,...,α6])
    """
    params = UserParams()
    alpha = params.alpha_activity.view(-1,1) 
    features = torch.stack([VM_avg, VM_peak, HR_postprandial, HRV_response, step_freq, -sedentary_minutes], dim=0)  
    return (alpha * features).sum(dim=0)