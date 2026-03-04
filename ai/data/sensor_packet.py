from __future__ import annotations
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import List, Dict

VM_THRESHOLD = 1.2
T_MIN_STEP_SEC = 0.4
S_W1 = 0.4
S_W2 = 0.2
S_W3 = 0.2

@dataclass
class SensorPacket:
    """
    time stamp snapshot of all sensor stuff drom PCB 
    """
    seq: int # packet seq number 
    unix: int # unix timestamp  abs time 
    timestamp: str # reading version of unix 
    steps: int 
    vm: float 
    peak_vm: float 
    hr: float # heart rate 
    hrv: float 
    hrv_drop: float
    hr_drop: float 
    hr_stability: float 
    sleep_score: float 
    interpolated: bool = False # true if packet was synthesised to fill a gap, pcb dont send my side 
def parse_packet(raw: Dict) -> SensorPacket:
    return SensorPacket(
        seq          = int(raw["seq"]),
        unix         = int(raw["unix"]),
        timestamp    = str(raw["timestamp"]),
        steps        = int(raw["steps"]),
        vm           = float(raw["vm"]),
        peak_vm      = float(raw["peak_vm"]),
        hr           = float(raw["hr"]),
        hrv          = float(raw["hrv"]),
        hrv_drop     = float(raw["hrv_drop"]),
        hr_drop      = float(raw["hr_drop"]),
        hr_stability = float(raw["hr_stability"]),
        sleep_score  = float(raw["sleep_score"]),
    )
def _lerp(a: float, b: float, t:float) -> float:
    """
    linear interpolation - estimat a value between 2 known points 
    """
    return a + (b-a) * t
def _unix_to_iso(unix: int) -> str:
    return datetime.fromtimestamp(unix, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
def _interpolate_midpoint(prev: SensorPacket, curr: SensorPacket) -> SensorPacket:
    """
    creates one syntehtic packret to fil gaps bet 'prev' and 'curr'
    """
    mid_unix = prev.unix + (curr.unix - prev.unix) // 2

    return SensorPacket(
        seq          = prev.seq + 1,
        unix         = mid_unix,
        timestamp    = _unix_to_iso(mid_unix),
        steps        = round((prev.steps + curr.steps) / 2),
        vm           = _lerp(prev.vm,           curr.vm,           0.5),
        peak_vm      = _lerp(prev.peak_vm,      curr.peak_vm,      0.5),
        hr           = _lerp(prev.hr,           curr.hr,           0.5),
        hrv          = _lerp(prev.hrv,          curr.hrv,          0.5),
        hrv_drop     = _lerp(prev.hrv_drop,     curr.hrv_drop,     0.5),
        hr_drop      = _lerp(prev.hr_drop,      curr.hr_drop,      0.5),
        hr_stability = _lerp(prev.hr_stability, curr.hr_stability, 0.5),
        sleep_score  = _lerp(prev.sleep_score,  curr.sleep_score,  0.5),
        interpolated = True,
    )
def process_packet_stream(raw_packets: List[Dict]) -> List[SensorPacket]:
    #call this 
    if not raw_packets:
        return []
    packets = sorted([parse_packet(p) for p in raw_packets], key=lambda p: p.seq)
    result: List[SensorPacket] = [packets[0]]
    n_interpolated = 0

    for i in range(1, len(packets)):
        prev = result[-1]
        curr = packets[i]

        if curr.seq != prev. seq +1:
            result.append(_interpolate_midpoint(prev, curr))
            n_interpolated += 1
        result.append(curr)
    #bluetooth reliability ober time 
    if n_interpolated:
        pct = n_interpolated / len(result) * 100
        print(f"    [sensor_packets] in {n_interpolated} gaps(s) filled "
              f"({pct: .1f}% of streams is interpolated")
        
    return result
def packets_to_dicts(packets: List[SensorPacket]) -> List[Dict]:
    # do this before serializing to JSON ro insert to supabase
    return [asdict(p) for p in packets]
def get_window(
        packets: List[SensorPacket],
        start_unix: int, 
        end_unix: int, 
) -> List[SensorPacket]:
    return [p for p in packets if start_unix <= p.unix <= end_unix]


"""
Chnage to PacketStream class once the bluetooh handler is on
class PacketStream:
    def __init__(self):
        self.prev: Optional[SensorPacket] = None   # remembers last packet
        self.buffer: List[SensorPacket] = []        # accumulates on device

    def ingest(self, raw: Dict) -> SensorPacket:
        curr = parse_packet(raw)

        if self.prev and curr.seq != self.prev.seq + 1:
            # gap detected — insert midpoint
            mid = _interpolate_midpoint(self.prev, curr)
            self.buffer.append(mid)

        self.buffer.append(curr)
        self.prev = curr
        return curr 


then 
onPacketReceived(rawJson) {
    stream.ingest(rawJson)   // handles gap check automatically
}

"""