import torch 
def getK_abs_i(
    k_base: float,        # baseline glucose absorption rate
    su: float,            # user-specific absorption speed multiplier
    alpha: float,         # learned sensitivity to fiber
    fiber_ratio: float,   # fiber / carb ratio for this meal
    eta_liq: float,       # liquid multiplier
    is_liquid: bool,      # True if meal is liquid, else False
    eta_fp_u: float,      # user-specific fat/protein effect
    fatprotein_i: float   # normalized fat+protein content of meal (0-1)
) -> float:
    """
    Compute the absorbed carbs at time t from a single meal.
    
    Args:
        carbs: grams of carbohydrates
        t_meal: meal time
        t: current time
        k_base: baseline absorption rate
        su: user-specific absorption multiplier
        alpha: fiber sensitivity coefficient
        fiber_ratio: fiber content ratio
        eta_liq: liquid adjustment factor
        is_liquid: whether meal is liquid
        eta_fp_u: fat/protein user sensitivity
        fatprotein_i: normalized fat+protein content
        
    Returns:
        Absorbed carbohydrate amount at time t
    """
    liquid_multiplier = (1.0 + eta_liq) if is_liquid else 1.0
    fiber_multiplier = 1.0 / (1.0 + alpha * fiber_ratio)
    fatprotein_multiplier = 1.0 / (1.0 + eta_fp_u * fatprotein_i)
    k_abs_i = k_base * su * fiber_multiplier * liquid_multiplier * fatprotein_multiplier
    return k_abs_i

def getK_abs_i_batch(
    k_base: float,
    su: float,
    alpha: torch.Tensor,
    fiber_ratio: torch.Tensor,
    eta_liq: float,
    is_liquid: torch.Tensor,
    eta_fp_u: float,
    fatprotein: torch.Tensor
) -> torch.Tensor:
    liquid_multiplier = 1.0 + eta_liq * is_liquid.float()
    fiber_multiplier = 1.0 / (1.0 + alpha * fiber_ratio)
    fatprotein_multiplier = 1.0 / (1.0 + eta_fp_u * fatprotein)

    return k_base * su * fiber_multiplier * liquid_multiplier * fatprotein_multiplier
