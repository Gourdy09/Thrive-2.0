import torch 
import torch.nn as nn 
from torch.optim import Adam, SGD
from torch.optim.lr_scheduler import CosineAnnealingLR, LinearLR
import json 
from pathlib import Path  
from typing import Dict, List, Tuple, Optional 
from datetime import datetime
import numpy as np 
import shutil

from ai.data.preprocessing import load_processed_data 
from ai.models.user.parameters import UserParams
from ai.simulation.simulate_glucose import simulate_glucose
from ai.personalization.loss import GlucoseLoss


class GlucoseTrainer: 
    def __init__(
        self,
        model_name: str = "glucose_model",
        device: str = "cpu",
        checkpoint_dir: str = "./checkpoints",
        log_dir: str = "./logs"
    ):
        self.device = torch.device(device)
        self.model_name = model_name 
        self.checkpoint_dir = Path(checkpoint_dir)
        self.log_dir = Path(log_dir)

        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)
        self.log_dir.mkdir(parents=True, exist_ok=True)

        self.best_val_loss = float('inf')
        self.train_losses = []
        self.val_losses = []
        self.epoch = 0

    def train(
        self,
        num_epochs: int = 100,
        batch_size: int = 8, 
        learning_rate: float = 0.01,
        weight_decay: float = 1e-5,
        use_scheduler: bool = True,  
        early_stopping_patience: int = 10, 
        validate_every: int = 1, 
        data_dir: str = "./data/processed"
    ) -> Dict:
        print("=" * 70)
        print(f"TRAINING: {self.model_name}")
        print("=" * 70)
        
        print("\n[1/5] Loading data...")
        train_data, val_data, test_data = load_processed_data(data_dir)
        print(f"  Train: {len(train_data['meal_features'])} examples")
        print(f"  Val:   {len(val_data['meal_features'])} examples")
        print(f"  Test:  {len(test_data['meal_features'])} examples")

        print("\n[2/5] Initializing model...") 
        params = UserParams()
        params = params.to(self.device)
        loss_fn = GlucoseLoss(
            lambda_fingerstick=1.0,
            lambda_window=0.5,
            lambda_phys=0.0,
            lambda_med=0.0,
            window_tolerance=10.0
        )

        print("\n[3/5] Setting up optimizer...")
        optimizer = Adam(
            params.parameters(),
            lr=learning_rate,
            weight_decay=weight_decay
        )

        scheduler = None  
        if use_scheduler:  
            scheduler = CosineAnnealingLR(optimizer, T_max=num_epochs) 
        
        print(f"  Optimizer: Adam(lr={learning_rate}, weight_decay={weight_decay})")
        if scheduler:  
            print(f"  Scheduler: CosineAnnealingLR(T_max={num_epochs})") 
        
        # Training setup 
        print("\n[4/5] Training configuration:")
        print(f"  Epochs: {num_epochs}")
        print(f"  Learning rate: {learning_rate}")
        print(f"  Early stopping patience: {early_stopping_patience}")

        print("\n[5/5] Starting training...\n")

        no_improve_count = 0 
        for epoch in range(num_epochs):
            self.epoch = epoch

            # Training phase 
            train_loss, train_loss_dict = self._train_epoch(
                params, optimizer, loss_fn, train_data
            )
            self.train_losses.append(train_loss)

            # Validation phase 
            if epoch % validate_every == 0:
                val_loss, val_loss_dict = self._validate_epoch(
                    params, loss_fn, val_data
                )
                self.val_losses.append(val_loss)
                
                # Check for improvement  
                if val_loss < self.best_val_loss:
                    self.best_val_loss = val_loss
                    no_improve_count = 0
                    self._save_checkpoint(params, optimizer, is_best=True)
                else:
                    no_improve_count += 1
                
                lr = optimizer.param_groups[0]['lr']
                print(f"Epoch {epoch+1}/{num_epochs} | "
                      f"Train: {train_loss:.4f} | "
                      f"Val: {val_loss:.4f} | "
                      f"LR: {lr:.6f}")
                
                if no_improve_count >= early_stopping_patience:
                    print(f"\nEarly stopping! No improvement for {early_stopping_patience} epochs.")
                    break 
            else:
                # Just log training loss on non-validation epochs
                lr = optimizer.param_groups[0]['lr']
                print(f"Epoch {epoch+1}/{num_epochs} | "
                      f"Train: {train_loss:.4f} | "
                      f"LR: {lr:.6f}")
            
            # Update learning rate 
            if scheduler: 
                scheduler.step()

        print("\n" + "=" * 70)
        print("Training complete!")
        print("=" * 70)

        self._load_best_checkpoint(params)

        print("\nFinal Evaluation:")
        test_loss, test_loss_dict = self._validate_epoch(params, loss_fn, test_data)
        print(f"  Test Loss: {test_loss:.4f}")
 
        summary = {
            'model_name': self.model_name, 
            'num_epochs': epoch + 1, 
            'best_val_loss': float(self.best_val_loss),
            'test_loss': float(test_loss),
            'final_train_loss': float(train_loss),
            'learning_rate': learning_rate,
            'early_stopping': no_improve_count >= early_stopping_patience,
            'timestamp': datetime.now().isoformat()
        }

        with open(self.log_dir / f"{self.model_name}_summary.json", 'w') as f:
            json.dump(summary, f, indent=2)
        metadata_src = Path(data_dir) / "metadata.json"
        metadata_dst = self.log_dir / "metadata.json"
        if metadata_src.exists():
            shutil.copy(metadata_src,metadata_dst)
            print(f"    Metadata copied to logs/")
        else:
            print(f"    Warning: metadata.json not found at {metadata_src}")
        return summary 

    def _train_epoch( 
        self, 
        params: UserParams,
        optimizer,
        loss_fn: GlucoseLoss,
        train_data: Dict
    ) -> Tuple[float, Dict]:
        params.train() if hasattr(params, 'train') else None 

        epoch_loss = 0.0
        num_examples = len(train_data['meal_features'])

        for i in range(num_examples):
            meal = train_data['meal_features'][i]
            glucose_seq = train_data['glucose_sequences'][i]

            # Forward pass 
            predicted = self._simulate_glucose_from_meal(params, meal, glucose_seq)
            observed = torch.tensor(glucose_seq['glucose_values'], dtype=torch.float32)
            baseline = torch.tensor([glucose_seq['baseline_glucose']], dtype=torch.float32)

            loss, loss_dict = loss_fn(
                predicted.unsqueeze(0),
                observed.unsqueeze(0),
                baseline
            )

            # Backward pass
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            epoch_loss += loss.item()
        
        avg_loss = epoch_loss / num_examples
        return avg_loss, {}

    def _validate_epoch( 
        self, 
        params: UserParams,
        loss_fn: GlucoseLoss,
        val_data: Dict
    ) -> Tuple[float, Dict]:
        params.eval() if hasattr(params, 'eval') else None 

        with torch.no_grad():
            epoch_loss = 0.0
            num_examples = len(val_data['meal_features'])

            for i in range(num_examples):
                meal = val_data['meal_features'][i]
                glucose_seq = val_data['glucose_sequences'][i]

                # Forward pass 
                predicted = self._simulate_glucose_from_meal(params, meal, glucose_seq)
                observed = torch.tensor(glucose_seq['glucose_values'], dtype=torch.float32)
                baseline = torch.tensor([glucose_seq['baseline_glucose']], dtype=torch.float32)

                loss, loss_dict = loss_fn(
                    predicted.unsqueeze(0),
                    observed.unsqueeze(0), 
                    baseline 
                )
                epoch_loss += loss.item()
            
            avg_loss = epoch_loss / num_examples
        
        return avg_loss, {}

    def _simulate_glucose_from_meal(  
        self,
        params: UserParams,
        meal: Dict, 
        glucose_seq: Dict 
    ) -> torch.Tensor:
        meals = [{
            'carbs': meal['carbs'],
            't_meal': meal['hour'],
            'fiber_ratio': meal['fiber_ratio'],
            'is_liquid': bool(meal['is_liquid']),
            'fatprotein': meal['fatprotein'],
            'alpha': 0.3
        }]
        
        times = glucose_seq['glucose_times']
        if not isinstance(times, torch.Tensor):
            times = torch.tensor(times)
        
        try:
            predicted = simulate_glucose(
                G0=glucose_seq['baseline_glucose'],
                time=times.tolist() if isinstance(times, torch.Tensor) else times, 
                meals=meals, 
                activity=[],
                insulin_medications=[],
                other_medications=[],
                params=params,
                insulin=False, 
                insulin_type=None 
            )
            
            if isinstance(predicted, torch.Tensor):
                return predicted
            else:
                return torch.tensor(predicted, dtype=torch.float32)
        except Exception as e:
            import traceback
            print(f"\n❌ SIMULATE_GLUCOSE ERROR:")
            print(f"Error: {e}")
            print(f"Traceback:")
            traceback.print_exc()
            print(f"Meal: {meal}")
            print(f"Times: {times}")
            print()
        return torch.zeros(len(times), dtype=torch.float32)
    def _save_checkpoint( 
        self, 
        params: UserParams,
        optimizer, 
        is_best: bool = False
    ):
        checkpoint = {
            'epoch': self.epoch, 
            'model_state': params.state_dict(),
            'optimizer_state': optimizer.state_dict(),
            'train_losses': self.train_losses,
            'val_losses': self.val_losses,
            'best_val_loss': self.best_val_loss
        }
        
        if is_best:
            path = self.checkpoint_dir / f"{self.model_name}_best.pt"
        else:
            path = self.checkpoint_dir / f"{self.model_name}_epoch_{self.epoch}.pt"  
        
        torch.save(checkpoint, path)

    def _load_best_checkpoint(self, params: UserParams):  
        path = self.checkpoint_dir / f"{self.model_name}_best.pt"
        if path.exists():
            checkpoint = torch.load(path, map_location=self.device)
            params.load_state_dict(checkpoint['model_state']) 
            print(f"Loaded best model from epoch {checkpoint['epoch']}")


def train_simple(
    num_epochs: int = 50,
    learning_rate: float = 0.01,
    model_name: str = "glucose_model"
):
    trainer = GlucoseTrainer(model_name=model_name)
    
    results = trainer.train(
        num_epochs=num_epochs,
        learning_rate=learning_rate,
        validate_every=1,
        early_stopping_patience=5
    )
    
    return results


def train_advanced(
    config_file: Optional[str] = None
):
    config = {
        'num_epochs': 100,
        'batch_size': 8,
        'learning_rate': 0.01,
        'weight_decay': 1e-5,
        'use_scheduler': True, 
        'early_stopping_patience': 10,
        'validate_every': 1,
        'device': 'cpu',
        'model_name': 'glucose_advanced'
    }
    
    if config_file and Path(config_file).exists():
        with open(config_file) as f:
            custom_config = json.load(f)
            config.update(custom_config)
    
    print("Training Configuration:")
    for key, value in config.items():
        print(f"  {key}: {value}") 
    
    trainer = GlucoseTrainer(
        model_name=config['model_name'],
        device=config['device'] 
    )
    
    results = trainer.train(
        num_epochs=config['num_epochs'],
        batch_size=config['batch_size'],
        learning_rate=config['learning_rate'],
        weight_decay=config['weight_decay'],
        use_scheduler=config['use_scheduler'], 
        early_stopping_patience=config['early_stopping_patience'],
        validate_every=config['validate_every']
    )
    
    return results 


if __name__ == "__main__":
    results = train_advanced()
    print("\n Training complete43or4xh -rfh!")