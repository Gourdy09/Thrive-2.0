
def convert_medication_period(medication_period: str, current_time: float):
    from components.ai_medication.med_durationmodel import med_durationModel

    med_mapp = {
        'baseline': [],
        'pioglitazone_45': {
            'med_id': 'pioglitazone_45',
            'dose': 45,
            't_k': 8.0,
            'med_class': 'thiazolidinedione'
        },
        'metformin_500': {
            'med_id': 'metformin_500',
            'dose': 500,
            't_k': 8.0,
            'med_class': 'biguanide'
        },
        'metformin_500_er': {
            'med_id': 'metformin_500_er',
            'dose': 500,
            't_k': 8.0,
            'med_class': 'biguanide'
        }
    }

    med_dict = med_mapp.get(medication_period,[])
    if isinstance(med_dict, dict):
        if 'metformin' in med_dict['med_id'].lower():
            verified_class = 'biguanide'
        elif 'pioglitazone' in med_dict['med_id'].lower():
            verified_class = 'tzd'
        else:
            verified_class = "other"
        
        med_dict['med_class'] = verified_class
        return [med_dict]
    return []