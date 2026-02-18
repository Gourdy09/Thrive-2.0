import torch
from pathlib import Path

checkpoint_path = Path("./checkpoints/glucose_advanced_best.pt")

if checkpoint_path.exists():
    checkpoint = torch.load(checkpoint_path, map_location="cpu")
    
    print("=" * 70)
    print("CHECKPOINT CONTENTS")
    print("=" * 70)
    
    print(f"\nKeys in checkpoint: {list(checkpoint.keys())}\n")
    
    for key, value in checkpoint.items():
        if isinstance(value, dict):
            print(f"{key}:")
            if key == 'model_state':
                print(f"  Model parameters:")
                for param_name, param_value in value.items():
                    print(f"    - {param_name}: {param_value.shape if hasattr(param_value, 'shape') else type(param_value)}")
                   # print(f"    - {param_name}: {param_value.item() if param_value.dim() == 0 else param_value}") to get the param values
            else:
                for k, v in list(value.items())[:5]:  # Show first 5
                    print(f"  {k}: {v}")
        else:
            print(f"{key}: {value}")
    
    print("\n" + "=" * 70)
else:
    print(f"    Checkpoint not found at {checkpoint_path}")