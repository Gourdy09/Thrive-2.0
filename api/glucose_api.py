from __future__ import annotations
from flask import Flask, request, jsonify 
from typing import Dict, List, Any 
import torch 
import json
import os 
import traceback
from ai.models.user.parameters import UserParams
from ai.simulation.simulate_glucose import simulate_glucose

app = Flask(__name__)

def _load_user_params(user_id: str) -> UserParams:
    params = UserParams()
    try:
        from supabase import create_client
        url = os.environ.get("EXPO_PUBLIC_SUPABASE_URL")
        key = os.environ.get("EXPO_PUBLIC_SUPABASE_KEY")
        if not url or not key:
            print(f"  [api] Supabase credentials missing — using default params for {user_id}")
            return params
        sb = create_client(url,key)
        resp =(
            sb.table("user_model_params")
            .select("*")
            .eq("user_id", user_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        rows = resp.data or []
        if not rows:
            print(f"    [api] No trained params fond for {user_id} - using defaults")
            return params
        row = rows[0]
        scalar_fields = ["Gb", "beta1", "beta2", "beta3", "beta4", "beta5",
            "su", "k_base", "alpha", "eta_liq_u", "eta_fp_u", "delta_u",
            "lambda_fingerstick", "lambda_window", "lambda_phys", "lambda_med",]
        state = params.state_dict()
        for field in scalar_fields:
            if field in row and row[field] is not None:
                state[field] = torch.tensor(float(row[field]))
        if "alpha_activity_raw" in row and row["alpha_activity_raw"] is not None:
            state["alpha_activity_raw"] = torch.tensor(
                row["alpha_activity_raw"], dtype=torch.float32
            )
        params.load_state_dict(state)
        print(f"    [api] Loaded trained params for user {user_id}"
            f"(phase {row.get('training_phase','?')})")
    except Exception as e:
        print(f"    [api] WARNING: Could not load user params: {e}")
        traceback.print_exc()
    return params

@app.route('/simulate-glucose', methods=['POST'])
def simulate_glucose_endpoint():
    try:
        data = request.get_json()

        user_id = data.get('userID')
        meals = data.get('meals',[])
        G_b = float(data.get('G_b',100.0))
        insulin = bool(data.get('insulin', False))
        insulin_type = data.get('insulin_type')
        activity = data.get('activity',[])
        insulin_med = data.get('insulinMedications',[])
        other_med = data.get('otherMedications',[])
        
        if not meals:
            return jsonify({
                'error': 'No meals provided',
                'glucoseTrajectory': [],
                'peakGlucose': G_b,
                'averageGlucose': G_b,
                'timePoints': []
            }), 400 

        params = _load_user_params(user_id) if user_id else UserParams()
        time_points = [i * .25 for i in range (96)]

        glucose_trajectory = simulate_glucose(
            G0=G_b,
            time=time_points,
            meals=meals,
            activity= activity,
            insulin_medications=insulin_med,
            other_medications=other_med,
            params=params,
            insulin=insulin,
            insulin_type=insulin_type
        )
        glucose_list = glucose_trajectory.detach().numpy().tolist()
        peak_glucose = max(glucose_list)
        avg_glucose = sum(glucose_list) / len(glucose_list)

        return jsonify({
            'glucoseTrajectory': glucose_list,
            'peakGlucose': float(peak_glucose),
            'averageGlucose': float(avg_glucose),
            'timePoints': time_points
        })
    except Exception as e:
        print(f"    [api] Error in simulate_glucose endpoint: {e}")
        traceback.print_exc()
        return jsonify({
            'error': str(e),
            'glucoseTrajectory': [],
            'peakGlucose': 100.0,
            'averageGlucose': 100.0,
            'timePoints': []
        }), 500

@app.route('/train-model', methods=['POST'])
def train_model_endpoint():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        num_epochs = data.get('num_epochs',100)
        db_path = data.get("dbPath","./glucose_app.db")
        days_since_start = int(data.get("daysSinceStart",0))
        fingerstick_entries = data.get("fingersticks")
        phase_epochs = data.get("phaseEpochs") or {1: 200, 2: 300, 3: 500}
        seed = int(data.get("seed",42))

        if not user_id:
            return jsonify({'error': 'userId required'}), 400 
        from ai.training.train import train_user_model, extract_params_dict

        params = train_user_model(
            user_id             = user_id,
            db_path             = db_path,
            days_since_start    = days_since_start,
            fingerstick_entries = fingerstick_entries,
            phase_epochs        = phase_epochs,
            seed                = seed,
            supabase_url        = os.environ.get("EXPO_PUBLIC_SUPABASE_URL"),
            supabase_key        = os.environ.get("EXPO_PUBLIC_SUPABASE_KEY"),
            upload_to_supabase  = True,
        )
        return jsonify({
            'messgage': 'Model trained successfully',
            'userID': user_id,
            "learnedParams": extract_params_dict(params)
        })
    except Exception as e:
        print(f"Error in train_model endpoint: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status":"ok"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0',port=5000)