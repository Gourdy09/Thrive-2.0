import torch 
import torch.nn as nn 

class UserParams(nn.Module):
    def __init__(self):
        super().__init__()
    # Physiological βs (learnable)
        self.beta1 = nn.Parameter(torch.tensor(0.01))   # carb sensitivity
        self.beta2 = nn.Parameter(torch.tensor(0.01))   # circadian offset
        self.beta3 = nn.Parameter(torch.tensor(0.01))    # night-time penalty
        self.beta4 = nn.Parameter(torch.tensor(0.01))   # insulin effect
        self.beta5 = nn.Parameter(torch.tensor(0.01))    # activity effect

        # HR related βs
        self.beta6 = nn.Parameter(torch.tensor(0.0))    # HRV drop 
        self.beta7 = nn.Parameter(torch.tensor(0.0))    # HR postprandial 
        self.beta8 = nn.Parameter(torch.tensor(0.0))    # 
        self.beta9 = nn.Parameter(torch.tensor(0.0))    # bN 

        #Physiological constant (decide wheter to be fixed or learnt)
        self.Gb = nn.Parameter(torch.tensor(96.0))  # baseline glucose 
        self.eta_fp_u = nn.Parameter(torch.tensor(0.01)) # fat/protein delay 
        self.su_raw = nn.Parameter(torch.tenosr(0.1))    # user-specific absorption speed multiplier
        self.k_base_raw = nn.Parameter(torch.tensor(0.1))   # Baseline absorption rate 

        @property
        def su(self):
            return 0.7 + (1.3 - 0.7) * torch.sigmoid(self.su_raw)
        @property
        def k_base(self):
            return 0.015 + (0.04-0.015) * torch.sigmoid(self.k_base_raw)