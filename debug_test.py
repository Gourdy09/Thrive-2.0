import torch
from ai.models.user.parameters import UserParams
from ai.models.glucose.dynamics import step_glucose
from ai.models.glucose.medication import calculate_med_effect

# Test with sample data
params = UserParams()

# Test medication conversion
from components.ai_medication.convert_medication_period import convert_medication_period

med_list = convert_medication_period('metformin_500_er', 12.0)
print(f"Medication list: {med_list}")

# Test medication effect calculation
if med_list:
    med_effect = calculate_med_effect(med_list, 12.0)
    print(f"Med effect: {med_effect}")
    print(f"Is NaN? {torch.isnan(med_effect)}")
    print(f"Is Inf? {torch.isinf(med_effect)}")

# Test step_glucose
glucose = step_glucose(
    G_tilde=100.0,
    t=12.0,
    meals=[{'carbs': 45, 't_meal': 12.0, 'fiber_ratio': 0.15, 'is_liquid': False, 'fatprotein': 0.2, 'alpha': 0.3}],
    insulin_medications=[],
    other_medications=med_list or [],
    activity=[],
    insulin=False,
    insulin_type=None,
    bN=0,
    params=params,
    medication_period='metformin_500_er'
)

print(f"Step glucose result: {glucose}")
print(f"Is NaN? {torch.isnan(glucose)}")
print(f"Is Inf? {torch.isinf(glucose)}")