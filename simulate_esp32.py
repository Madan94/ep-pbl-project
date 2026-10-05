"""
RenewCred - ESP32 Hardware Node Continuous Telemetry Simulator
Simulates a live physical ESP32 IoT solar node broadcasting real-time sensor
telemetry to the FastAPI backend and AI Verification engine (dMRV).

Usage:
    python simulate_esp32.py --continuous --interval 1.5
"""

import argparse
import math
import random
import sys
import time
import requests

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


class SolarNodeSimulator:
    def __init__(self, device_id: str = "SOLAR_ESP32_001"):
        self.device_id = device_id
        self.base_voltage = 12.4
        self.base_current = 1.85
        self.base_temp = 29.5
        self.base_hum = 58.0
        self.step = 0

    def get_reading(self, force_anomaly: bool = False) -> dict:
        self.step += 1
        # Smooth organic sine drift + small noise
        drift = math.sin(self.step * 0.05) * 0.3
        noise_v = random.uniform(-0.08, 0.08)
        noise_i = random.uniform(-0.05, 0.05)

        voltage = round(max(11.5, min(13.2, self.base_voltage + drift + noise_v)), 2)
        current = round(max(1.2, min(2.4, self.base_current + (drift * 0.5) + noise_i)), 2)
        power = round(voltage * current, 2)

        if force_anomaly:
            # Deliberately violate P = V * I for AI anomaly detector test
            power = round(power * random.choice([2.5, 0.3]), 2)

        temperature = round(self.base_temp + (drift * 0.4) + random.uniform(-0.2, 0.2), 1)
        humidity = round(self.base_hum - (drift * 0.5) + random.uniform(-0.4, 0.4), 1)

        return {
            "device_id": self.device_id,
            "voltage": voltage,
            "current": current,
            "power": power,
            "temperature": temperature,
            "humidity": humidity,
        }


def main():
    parser = argparse.ArgumentParser(description="RenewCred ESP32 Live Node Simulator")
    parser.add_argument("--url", default="http://127.0.0.1:8000", help="FastAPI Base URL")
    parser.add_argument("--device-id", default="SOLAR_ESP32_001", help="Device identifier")
    parser.add_argument("--interval", type=float, default=1.5, help="Seconds between telemetry posts")
    parser.add_argument("--anomaly-every", type=int, default=12, help="Inject anomaly every N packets (0 to disable)")
    parser.add_argument("--continuous", action="store_true", default=True, help="Stream continuously")
    args = parser.parse_args()

    endpoint = f"{args.url.rstrip('/')}/api/sensor-data"
    sim = SolarNodeSimulator(device_id=args.device_id)

    print("==================================================================")
    print("      RenewCred ESP32 Live Telemetry Broadcaster (Online)         ")
    print(f"      Node ID:       {args.device_id}")
    print(f"      Target API:    {endpoint}")
    print(f"      Interval:      {args.interval}s")
    print("==================================================================")

    i = 0
    while True:
        i += 1
        force_anomaly = args.anomaly_every > 0 and i % args.anomaly_every == 0
        payload = sim.get_reading(force_anomaly=force_anomaly)

        try:
            resp = requests.post(endpoint, json=payload, timeout=4)
            if resp.status_code == 200:
                res = resp.json()
                status_str = res.get("status", "NORMAL")
                badge = f"[{status_str:7}]"
                print(
                    f"[TX #{i:04d}] {badge} "
                    f"V={payload['voltage']:.2f}V | I={payload['current']:.2f}A | P={payload['power']:.2f}W | "
                    f"T={payload['temperature']:.1f}°C | H={payload['humidity']:.1f}% -> Ingested & AI Verified"
                )
            else:
                print(f"[TX #{i:04d}] API Error {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"[TX #{i:04d}] Connection error: {e}")

        time.sleep(args.interval)


if __name__ == "__main__":
    main()

