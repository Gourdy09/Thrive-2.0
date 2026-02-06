import torch 
import math 

def circadian_encoding(hour) :
    return torch.sin(2*math.pi*hour/24) , torch.cos(2*math.pi*hour/24)

def night_meal_penalty(is_bN, meal_dt):
    return ((is_bN ==1) & (meal_dt >= 120) & (meal_dt <= 60)).float 

def circadian_ratio(deltas, is_night):
    day = deltas[~is_night]
    night = deltas[is_night]

    if len(day) < 5 or len(night) < 3:
        return None 

    return torch.mean(night) / torch.mean(day)
