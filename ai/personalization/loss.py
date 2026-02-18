"""
Total Loss:
    L_total = λ_f * L_fingerstick + L_phys + L_window + L_med + L_param
"""

import torch 
import torch.nn as nn
from typing import Dict, List, Tuple, Optional, Any
import numpy as np


class GlucoseLoss(nn.Module):
    def __init__(self, 
        lambda_fingerstick: float = 1.0,
        lambda_window: float = 0.5,
        lambda_med: float = 0.05,
        lambda_phys: float = 0.1,
        window_tolerance: float = 10.0,
        hr_weight: float = 0.5,
        hrv_weight: float = 0.5):
        super().__init__()
        self.lambda_f = lambda_fingerstick
        self.lambda_w = lambda_window
        self.lambda_p = lambda_phys
        self.lambda_m = lambda_med
        self.delta = window_tolerance
        self.w1 = hr_weight
        self.w2 = hrv_weight    
    
    def forward(
        self, 
        pred_glucose: torch.Tensor, 
        obs_glucose: torch.Tensor, 
        G_b: torch.Tensor, 
        params: Optional[Any] = None,
        hr_pred: Optional[torch.Tensor] = None,
        hr_obs: Optional[torch.Tensor] = None, 
        hrv_predicted: Optional[torch.Tensor] = None,
        hrv_observed: Optional[torch.Tensor] = None,
        med_duration_model: Optional[Any] = None
    ) -> Tuple[torch.Tensor, Dict[str, float]]:
        if not isinstance(pred_glucose, torch.Tensor):
            pred_glucose = torch.tensor(pred_glucose, dtype=torch.float32)
        if not isinstance(obs_glucose, torch.Tensor):
            obs_glucose = torch.tensor(obs_glucose, dtype=torch.float32)  
        if not isinstance(G_b, torch.Tensor):
            G_b = torch.tensor(G_b, dtype=torch.float32)  
        
       
        loss_fingerstick = self._fingerstick_loss(
            pred_glucose, obs_glucose, G_b
        )
        loss_window = self._window_loss(
            pred_glucose, obs_glucose
        )
        loss_phys = torch.tensor(0.0, dtype=torch.float32)
        if hr_pred is not None and hr_obs is not None:
            loss_phys = loss_phys + self._hr_loss(hr_pred, hr_obs)
        if hrv_predicted is not None and hrv_observed is not None:
            loss_phys = loss_phys + self._hrv_loss(hrv_predicted, hrv_observed)
        
        loss_med = torch.tensor(0.0, dtype=torch.float32)
        if med_duration_model is not None:
            loss_med = self._med_duration_loss(med_duration_model)
        
        loss_param_reg = torch.tensor(0.0, dtype=torch.float32)
        if params is not None:
            loss_param_reg = self._parameter_reg(params)  
        
        total_loss = (
            self.lambda_f * loss_fingerstick + 
            self.lambda_w * loss_window +
            self.lambda_p * loss_phys + 
            self.lambda_m * loss_med +
            loss_param_reg
        )
        
        loss_dict = {
            'total': total_loss.item(),
            'fingerstick': loss_fingerstick.item(),
            'window': loss_window.item(),
            'phys': loss_phys.item(),
            'med': loss_med.item(),
            'param_reg': loss_param_reg.item()
        }
        return total_loss, loss_dict
    
    def _fingerstick_loss(
        self,
        pred: torch.Tensor, 
        obs: torch.Tensor,
        baseline: torch.Tensor
    ) -> torch.Tensor:
        baseline_expanded = baseline.unsqueeze(-1)  # [batch_size, 1]
        obs_response = obs - baseline_expanded
        pred_response = pred - baseline_expanded

        loss = torch.mean((pred_response - obs_response) ** 2)
        return loss  
    
    def _window_loss(
        self,
        pred: torch.Tensor,
        obs: torch.Tensor 
    ) -> torch.Tensor:
        abs_error = torch.abs(pred - obs)
        band_loss = torch.clamp(abs_error - self.delta, min=0.0) ** 2

        loss = torch.mean(band_loss)
        return loss 
    
    def _hrv_loss(
        self,
        hrv_pred: torch.Tensor,
        hrv_obs: torch.Tensor
    ) -> torch.Tensor:
        loss = torch.mean((hrv_pred - hrv_obs) ** 2)
        return self.w2 * loss 
    
    def _hr_loss(
        self, 
        hr_pred: torch.Tensor,
        hr_obs: torch.Tensor
    ) -> torch.Tensor:
        loss = torch.mean((hr_pred - hr_obs) ** 2) 
        return self.w1 * loss 
    
    def _med_duration_loss(
        self,
        med_duration_model: Any  
    ) -> torch.Tensor:
        reg_loss = torch.tensor(0.0, dtype=torch.float32)
        if hasattr(med_duration_model, 'theta'):
            for theta in med_duration_model.theta.values():
                reg_loss = reg_loss + torch.pow(theta, 2)
        return self.lambda_m * reg_loss
    
    def _parameter_reg(  
        self,
        params: Any
    ) -> torch.Tensor:
        reg_loss = torch.tensor(0.0, dtype=torch.float32)  
        if hasattr(params, 'beta1'):
            for i in range(1, 10):
                beta = getattr(params, f'beta{i}', None)
                if beta is not None and isinstance(beta, torch.nn.Parameter):
                    reg_loss = reg_loss + torch.sum(torch.pow(beta, 2))
        return 0.001 * reg_loss


def compute_loss_batch(  
    predictions: List[torch.Tensor],  
    observations: List[torch.Tensor], 
    baselines: List[float], 
    loss_fn: GlucoseLoss,
    **kwargs
) -> Tuple[torch.Tensor, List[Dict]]: 
    batch_losses = []
    loss_dicts = []
    
    for pred, obs, baseline in zip(predictions, observations, baselines):
        loss, loss_dict = loss_fn(
            pred.unsqueeze(0),
            obs.unsqueeze(0),
            torch.tensor([baseline]),  
            **kwargs
        )
        batch_losses.append(loss)
        loss_dicts.append(loss_dict)

    batch_loss = torch.mean(torch.stack(batch_losses))
    return batch_loss, loss_dicts


if __name__ == "__main__":
    # Example usage
    batch_size = 8  
    time_steps = 12

    pred = torch.randn(batch_size, time_steps) * 20 + 120
    obs = torch.randn(batch_size, time_steps) * 20 + 115
    baseline = torch.ones(batch_size) * 100 

    loss_fn = GlucoseLoss(
        lambda_fingerstick=1.0,
        lambda_window=0.5,
        lambda_phys=0.0,
        lambda_med=0.0,
        window_tolerance=10.0
    )
    
    total_loss, loss_dict = loss_fn(pred, obs, baseline)
    
    print("Loss Breakdown:")
    for key, value in loss_dict.items():
        print(f"  {key}: {value:.4f}")
    print(f"\nTotal Loss: {total_loss.item():.4f}")