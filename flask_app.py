from flask import Flask, request, jsonify
from ai.models.glucose.dynamics import simulate_glucose
from ai.models.user.parameters import UserParams
import torch

app = Flask(__name__)

@app.route("/simulate-glucose", methods=["POST"])
def run_simulation():
    data = request.json
    user_id = data.get("userId")
    meals = data.get("meals")
    baseline_glucose = float(data.get("baselineGlucose", 100))
    insulin = data.get("insulin", False)
    insulin_type = data.get("insulinType")
    insulin_medication = data.get("insulinMedications")
    # Initialize parameters
    params = UserParams()
    
    # Create time array (0 to 480 minutes = 8 hours)
    time = torch.linspace(0, 480, 480)  # one per minute
    
    # Run simulation
    glucose_trajectory = simulate_glucose(
        G0=baseline_glucose,
        time=time,
        meals=meals,
        activity=[],  # add if you have activity data
        insulin_medications=insulin_medication,  
        other_medications=[],  # add if you have other meds
        params=params,
        insulin=insulin,
        insulin_type=insulin_type
    )
    
    return jsonify({
        "userId": user_id,
        "glucoseTrajectory": glucose_trajectory.tolist(),
        "timePoints": time.tolist(),
        "baselineGlucose": baseline_glucose,
        "peakGlucose": float(glucose_trajectory.max()),
        "averageGlucose": float(glucose_trajectory.mean()),
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)