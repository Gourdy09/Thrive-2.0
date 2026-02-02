import torch 
import math 

def circadian_encoding(hour) :
    return torch.sin(2*math.pi*hour/24) , torch.cos(2*math.pi*hour/24)

def night_meal_penalty(is_bN, meal_dt):
    return ((is_bN ==1) & (meal_dt >= 120) & (meal_dt <= 60)).float 
