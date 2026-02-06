from typing import Dict, List
import torch 

Med_class_prior_duation = {
    "biguanide" :12.0, # metofrmin 
    "sulfonylurea": 18.0,
    "basal_insulin": 24.0,
    "bolus_insulin": 5.0,
    "glp1_daily": 24.0,
    "glp1_weekly": 144.0,
    "sglt2": 24.0,
}

class med_durationModel(torch.nn.Module):
    def __init__(self, meds):
        super().__init__()
        self.theta = torch.nn.ParameterDict({
            med_id: torch.nn.Parameter(torch.tensor(0.0))
            for med_id in meds 
        })
    def t_duration(self, med_id, med_class):
        prior = Med_class_prior_duation[med_class]
        theta_clamped = torch.clamp(self.theta[med_id], -1.0, 1.0)
        return prior * torch.exp(theta_clamped)
    @staticmethod
    def duration_regularizer(model, lambda_d=0.5):
        return lambda_d * sum(
            theta**2 for theta in model.theta.values()
        )
   