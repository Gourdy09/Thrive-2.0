from flask import Flask, request, jsonify 
from typing import Dict, List, Any 
import torch 
import json

from ai.models.user.parameters import UserParams
from ai.simulation.simulate_glucose import simulate_glucose

app = Flask(__name__)

@app.route('/simulate-glucose', methods=['POST'])
def simulate_glucose_endpoint():
    try:
        data = request.get_json()

        user_id = data.get('userID')
        meals = data.get('meals',[])
        G_b = data.get('G_b',100.0)
        insulin = data.get('insulin', False)
        insulin_type = data.get('insulin_type')
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
        params = UserParams()
        time_points = [i * .25 for i in range (96)]
        glucose_trajectory = simulate_glucose(
            G0=G_b,
            time=time_points,
            meals=meals,
            activity=[],
            insulin_medications=insulin_med or [],
            other_medications=other_med or [],
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
        print(f"    Error in simulate_glucose endpoint: {e}")
        import traceback
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
        if not user_id:
            return jsonify({'error': 'userId required'}), 400 
        from ai.training.train import GlucoseTrainer

        trainer = GlucoseTrainer(model_name=f"glucose_user_{user_id}")
        results = trainer.train(num_epochs=num_epochs)

        return jsonify({
            'messgage': 'Model trained successfully',
            'results': results,
            'userID': user_id
        })
    except Exception as e:
        print(f"Error in train_model endpoint: {e}")
        return jsonify({'error': str(e)}), 500
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0',port=5000)