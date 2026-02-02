import torch 

def activity_Effect(VM_avg, VM_peak, HRV_response, step_freq, sedentary_minutes, HR_postprandial, alpha):
    """
    α = torch.tensor([α1,...,α6])
    """
    alpha = alpha.view(-1,1) 
    features = torch.stack([VM_avg, VM_peak, HR_postprandial, HRV_response, step_freq, -sedentary_minutes], dim=0)  
    return (alpha * features).sum(dim=0)