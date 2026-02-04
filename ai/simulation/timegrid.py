def make_time_grid(dt_minutes: float, hours: float):
    T = int((hours * 60) / dt_minutes)
    return [i * dt_minutes for i in range(T)]
