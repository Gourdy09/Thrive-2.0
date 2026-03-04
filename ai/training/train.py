"""
STAGED TRAINING SCHEDULE
--------------------------
Phase 1 (days 0-2)   Trainable: Gb, beta1, su
                     Loss:      L_fingerstick only
                     Goal:      Anchor baseline glucose and carb sensitivity

Phase 2 (days 3-7)   Trainable: + delta_u, beta2, beta3, eta_liq_u
                     Loss:      L_fingerstick + L_phys
                     Goal:      Add circadian/nocturnal and wearable signals

Phase 3 (day 8+)     Trainable: + eta_fp_u, beta4, beta5, alpha
                     Loss:      L_phys dominant (fingerstick gone)
                     Goal:      Full personalisation from wearable alone
"""
from __future__ import annotations
import json
import traceback
from datetime import datetime 
from pathlib import Path
from typing import Dict, List, Optional, Tuple 
import torch 
from torch.optim import Adam 
from torch.optim.lr_scheduler import CosineAnnealingLR
from ai.data.preprocessing import load_training_data
from ai.models.user.parameters import UserParams
from ai.simulation.simulate_glucose import simulate_glucose
from ai.personalization.loss import GlucoseLoss
PHASE_PARAMS: Dict[int, List[str]] = {
    1: ["Gb","beta1", "su"],
    2:["Gb", "beta1", "su","delta_u","beta2","beta3","eta_liq_u"],
    3: ["Gb", "beta1", "su", "delta_u", "beta2", "beta3", "eta_liq_u",
        "eta_fp_u", "beta4", "beta5", "alpha"],
}

HR_SCALE = 0.5 #bpm rise per mg/dl glucose rise 
HRV_SCALE = 0.3 # ms HRV sppression per mg/dl glucose rise 
LAMBDA_REG = 0.3 # delta_empirical reg weight 

def _set_trainable_params(params: UserParams, phase: int) -> None:
    unlocked = set(PHASE_PARAMS[phase])
    for name, p in params.named_parameters():
        p.requires_grad = name in unlocked
    locked = [n for n, p in params.named_parameters() if not p.requires_grad]
    unlocked_names = [n for n, p in params.named_parameters() if p.requires_grad]
    print(f"    Phase {phase} - trainable: {unlocked_names}")
    print(f"                   - frozen:    {locked}")
def etract_params_dict(params:UserParams)-> Dict:
    return {
        "Gb":                 params.Gb.item(),
        "beta1":              params.beta1.item(),
        "beta2":              params.beta2.item(),
        "beta3":              params.beta3.item(),
        "beta4":              params.beta4.item(),
        "beta5":              params.beta5.item(),
        "su":                 params.su.item(),
        "k_base":             params.k_base.item(),
        "alpha":              params.alpha.item(),
        "eta_liq_u":          params.eta_liq_u.item(),
        "eta_fp_u":           params.eta_fp_u.item(),
        "delta_u":            params.delta_u.item(),
        "lambda_fingerstick": params.lambda_fingerstick.item(),
        "lambda_window":      params.lambda_window.item(),
        "lambda_phys":        params.lambda_phys.item(),
        "lambda_med":         params.lambda_med.item(),
        "alpha_activity_raw": params.alpha_activity_raw.detach().tolist(),
    }
def upload_params_to_supabase(
    user_id: str,
    params: UserParams,
    training_phase: int,    
    best_val_loss: float,
    num_meals_seen: int,
    supabase_url: Optional[str] = None, 
    supabase_key: Optional[str] =None 
) -> bool:
    try:
        from supabase import create_client
        url = supabase_url or os.environ.get("EXPO_PUBLIC_SUPABASE_URL")
        key = supabase_key or os.environ.get("EXPO_PUBLIC_SUPABASE_KEY")
        if not url or not key:
            raise EnvironmentError("Supabase credential not set")
        sb = create_client(url,key)
        row = {
            "user_id": user_id,
            "training_phase": training_phase,
            "num_meals_seen": num_meals_seen,
            "best_val_loss":  best_val_loss,
            "trained_at":     datetime.utcnow().isoformat() + "Z",
            **extract_params_dict(params),
        }
        sb.table("user_model_params").upsert(row, on_conflict="user_id").execute()
        print(f"    [train] Params uploaded to Supabase for use {user_id}")
        return True 
    except Exception as e:
        print(f"    [train] WARNING: Could not upload params: {e}")
        traceback.print_exc()
        return False 
        
def _compute_loss(
        loss_fn: GlucoseLoss,
        params: UserParams,
        pred_glucose: torch.Tensor,
        obs_glucose: torch.Tensor, 
        G_b: torch.Tensor,
        hr_pred: Optional[torch.Tensor],
        hr_obs: Optional[torch.Tensor],
        hrv_pred: Optional[torch.Tensor],
        hrv_obs: Optional[torch.Tensor],
) -> Tuple[torch.Tensor, Dict[str, float]]:
    l_fs = loss_fn._fingerstick_loss(pred_glucose, obs_glucose, G_b)
    l_w = loss_fn._window_loss(pred_glucose, obs_glucose)
    l_pr = loss_fn._parameter_reg(params)
    l_hr = loss_fn._hr_loss(hr_pred, hr_obs) if(hr_pred is not None and hr_obs is not None) else torch.tensor(0.0)
    l_hrv = loss_fn._hrv_loss(hrv_pred,hrv_obs) if(hrv_pred is not None and hrv_obs is not None) else torch.tensor(0.0)
    l_p = l_hr + l_hrv

    total = (
        torch.abs(params.lambda_fingerstick) * l_fs +
        torch.abs(params.lambda_window) * l_w +
        torch.abs(params.lambda_phys) * l_p + 
        l_pr
    )
    components = {
        "fingerstick": l_fs.item(),
        "window":      l_w.item(),
        "phys":        l_p.item(),
        "param_reg":   l_pr.item(),
        "lambda_f":    params.lambda_fingerstick.item(),
        "lambda_w":    params.lambda_window.item(),
        "lambda_p":    params.lambda_phys.item(),
    }
    return total, components
def _extract_obs_tensors(
    sequences: Dict,
    phase: int,
) -> Tuple[torch.Tensor, Optional[torch.Tensor],Optional[torch.Tensor], Optional[torch.Tensor]]:
    fingersticks = sequences.get("fingersticks",[])
    sensor_wins = sequences.get("sensor_windows",[])

    if phase <= 2 and any(fs is not None for fs in fingersticks):
        obs_glucose = torch.tensor([
            fs["glucose_mg_dl"] if fs is not None else float("nan")
            for fs in fingersticks
        ], dtype=torch.float32)
    else:
        obs_glucose = None

    if phase == 3:
        obs_glucose = None 
    hr_obs = torch.tensor([s["hr_postprandial"] for s in sensor_wins], dtype=torch.float32)
    hrv_obs = torch.tensor([s["hrv_drop_norm"] for s in sensor_wins], dtype=torch.float32)
    G_b = torch.tensor([s["hr_baseline"] for s in sensor_wins],  dtype=torch.float32)
    return obs_glucose, hr_obs, hrv_obs, G_b

def _train_phase(
    phase: int, 
    params: UserParams,
    loss_fn: GlucoseLoss,
    train_seqs: Dict,
    val_seqs: Dict,
    epochs: int, 
    lr: float,
    checkpoint_dir: Path, 
) -> Dict[str, List[float]]:
    print(f"\n{'='*55}")
    print(f"    PHASE {phase} ({epochs} epochs, lr={lr})")
    print(f"{'='*55}")

    trainable = [p for p in params.parameters() if p.requires_grad]
    optimizer = Adam(trainable, lr=lr)
    scheduler = CosineAnnealingLR(optimizer, T_max=epochs, eta_min=lr * 0.01)
    best_val = float("inf")
    history = {"train": [], "val":[]}
    ckpt_path = checkpoint_dir / f"phase{phase}_best.pt"

    train_obs_glucose, train_hr_obs, train_hrv_obs, train_G_b = _extract_obs_tensors(train_seqs, phase)
    val_obs_glucose,   val_hr_obs,   val_hrv_obs,   val_G_b   = _extract_obs_tensors(val_seqs,   phase)
    
    for epoch in range(1, epochs+1):
        params.train()
        optimizer.zero_grad()
        pred_glucose_train = run_glucose_simulation(
            sequences = train_seqs["meal_features"],
            sensor_windows = train_seqs["sensor_windows"],
            params    = params,
        )
        hr_pred_train = pred_glucose_train * HR_SCALE
        hrv_pred_train = pred_glucose_train * HRV_SCALE

        train_loss, train_components = _compute_loss(
            loss_fn = loss_fn, 
            params       = params,
            pred_glucose = pred_glucose_train,
            obs_glucose  = train_obs_glucose if train_obs_glucose is not None else pred_glucose_train.detach(),
            G_b          = train_G_b,
            hr_pred      = hr_pred_train,
            hr_obs       = train_hr_obs,
            hrv_pred     = hrv_pred_train,
            hrv_obs      = train_hrv_obs,
        )
        train_loss.backward()
        
        torch.nn.utils.clip_grad_norm_(params.parameters(), max_norm=1.0)
        optimizer.step()
        scheduler.step()

        params.eval()
        with torch.no_grad():
            pred_glucose_val = run_glucose_simulation(
                sequences      = val_seqs["meal_features"],
                sensor_windows = val_seqs["sensor_windows"],
                params         = params,
            )
            hr_pred_val = pred_glucose_val * HR_SCALE
            hrv_pred_val = pred_glucose_val * HRV_SCALE 

            val_loss, val_components = _compute_loss(
                loss_fn = loss_fn,
                params       = params,
                pred_glucose = pred_glucose_val,
                obs_glucose  = val_obs_glucose if val_obs_glucose is not None else pred_glucose_val,
                G_b          = val_G_b,
                hr_pred      = hr_pred_val,
                hr_obs       = val_hr_obs,
                hrv_pred     = hrv_pred_val,
                hrv_obs      = val_hrv_obs,
            )
        history["train"].append(train_loss.item())
        history["val"].append(val_loss.item())

        if val_loss.item() < best_val:
            best_val = val_loss.item()
            torch.save({
                "epoch": epoch,
                "phase": phase,
                "params": params.state_dict(),
                "val_loss": best_val,
                "components": val_components,
            }, ckpt_path)
        if epoch % 10 == 0 or epoch ==1:
            print ( f"  Epoch {epoch:3d}/{epochs} | "
                f"train={train_loss.item():.4f} | "
                f"val={val_loss.item():.4f} | "
                f"fs={train_components['fingerstick']:.4f} | "
                f"phys={train_components['phys']:.4f}")
    print(f"\n  Phase {phase} done — best val loss: {best_val:.4f}  (saved → {ckpt_path})")
    return history
def train_user_model(
        user_id:          str,
        db_path:          str            = "./glucose_app.db",
        fingerstick_json: Optional[str]  = None,
        fingerstick_entries: Optional[List[Dict]] = None,
        supabase_url:        Optional[str]        = None,
        supabase_key:        Optional[str]        = None,
        upload_to_supabase:  bool                 = True,
        checkpoint_dir:   str            = "./checkpoints",
        days_since_start: int            = 0,
        phase_epochs:     Dict[int, int] = {1: 200, 2: 300, 3: 500},
        phase_lr:         Dict[int, float] = {1: 1e-2, 2: 5e-3, 3: 1e-3},
        seed:             int            = 42,
) -> UserParams:
    torch.manual_seed(seed)
    ckpt_dir = Path(checkpoint_dir) / user_id 
    ckpt_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n[train] Loading data for user {user_id}...")
    train_seqs, val_seqs, test_seqs, meds_dicts= load_training_data(
        db_path             = db_path,
        user_id             = user_id,
        supabase_url        = supabase_url,
        supabase_key        = supabase_key,
        fingerstick_json    = fingerstick_json,
        entries_list        = fingerstick_entries,
        days_since_start    = days_since_start,
        seed                = seed,
    )
    print(f"[train] train={len(train_seqs['meal_features'])}  "
          f"val={len(val_seqs['meal_features'])}  "
          f"meds={len(meds_dicts)}")

    params = UserParams()
    loss_fn = GlucoseLoss(
        lambda_fingerstick = 1.0,  
        lambda_window      = 1.0,
        lambda_phys        = 1.0,
        lambda_med         = 1.0,
        window_tolerance   = 10.0,
    )

    night_deltas, day_deltas = _day_night_deltas(train_seqs, params)

    if days_since_start <= 2:
        start_phase = 1
    elif days_since_start <=7:
        start_phase = 2
    else:
        start_phase = 3
    print(f"[train] days_since_start={days_since_start} -> starting at phase {start_phase}")
    if start_phase >1:
        prev_ckpt = ckpt_dir / f"phase{start_phase - 1}_best.pt"
        if prev_ckpt.exists():
            checkpoint = torch.load(prev_ckpt)
            params.load_state_dict(checkpoint["params"])
            print(f"[train] Loaded phase {start_phase - 1} checkpoint from {prev_ckpt}")
        else:
            print(f"[train] WARNING: no phase {start_phase - 1} checkpoint found — starting from scratch")

    all_history = {}
    total_meals    = len(train_seqs["meal_features"]) + len(val_seqs["meal_features"])
    final_val_loss = float("inf")
    for phase in range(start_phase,4):
        history = _train_phase(
            phase          = phase,
            params         = params,
            loss_fn        = loss_fn,
            train_seqs     = train_seqs,
            val_seqs       = val_seqs,
            epochs         = phase_epochs[phase],
            lr             = phase_lr[phase],
            checkpoint_dir = ckpt_dir,
            night_deltas   = night_deltas,
            day_deltas     = day_deltas,
        )
        all_history[f"phase{phase}"] = history 
        best_ckpt = ckpt_dir / f"phase{phase}_best.pt"
        ckpt_data = torch.load(best_ckpt)
        params.load_state_dict(ckpt_data["params"])
        final_val_loss = ckpt_data["val_loss"]
        
    final_path = ckpt_dir / f"final_params.pt"
    torch.save(params.state_dict(), final_path)
    print(f"\n[train] Training complete. Final params aved -> {final_path}")
    history_path = ckpt_dir / "loss_history.json"
    with open(history_path,"w") as f:
        json.dump(all_history, f, indent=2)
    print(f"[train] Loss history saved -> {history_path}")
    if upload_to_supabase:
        upload_params_to_supabase(
            user_id        = user_id,
            params         = params,
            training_phase = start_phase,     
            best_val_loss  = final_val_loss,
            num_meals_seen = total_meals,
            supabase_url   = supabase_url,
            supabase_key   = supabase_key,
        )

    return params 

if __name__ == "__main__":
    import sys
    uid  = sys.argv[1] if len(sys.argv) > 1 else "test_user"
    days = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    train_user_model(
        user_id          = uid,
        db_path          = "./glucose_app.db",
        days_since_start = days,
    )