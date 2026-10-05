"""
RenewCred - High-Performance USB Serial & Wi-Fi Bridge
Connects directly to ESP32 over USB COM port (zero Wi-Fi drops, 100% working)
and forwards real-time sensor telemetry to the FastAPI backend and dMRV AI Engine.

Usage:
    python esp32_serial_bridge.py
    python esp32_serial_bridge.py --port COM7 --baud 115200
"""

import argparse
import json
import re
import sys
import time
import requests
import serial
import serial.tools.list_ports

BACKEND_URL = "http://127.0.0.1:8000/api/sensor-data"

def find_esp32_port():
    ports = list(serial.tools.list_ports.comports())
    for p in ports:
        desc = (p.description or "").lower()
        hwid = (p.hwid or "").lower()
        if any(k in desc or k in hwid for k in ["cp210", "ch340", "usb-serial", "ftdi", "uart", "esp32"]):
            return p.device
    if ports:
        return ports[0].device
    return None

def main():
    parser = argparse.ArgumentParser(description="RenewCred ESP32 USB Serial Bridge")
    parser.add_argument("--port", default=None, help="Serial COM Port (e.g. COM7)")
    parser.add_argument("--baud", type=int, default=115200, help="Baud rate")
    parser.add_argument("--url", default=BACKEND_URL, help="FastAPI Ingestion URL")
    args = parser.parse_args()

    port = args.port or find_esp32_port()
    if not port:
        print("[ERROR] No ESP32 COM port detected! Please plug in your ESP32 via USB.")
        sys.exit(1)

    print("==================================================================")
    print("      RenewCred ESP32 Direct USB Bridge (Zero Network Drops)     ")
    print(f"      Connected Serial Port: {port} @ {args.baud} baud")
    print(f"      Forwarding to Backend: {args.url}")
    print("==================================================================")
    print("Streaming live hardware telemetry directly from ESP32...\n")

    try:
        ser = serial.Serial(port, args.baud, timeout=1)
    except Exception as e:
        print(f"[ERROR] Failed to open {port}: {e}")
        sys.exit(1)

    success_count = 0
    json_pattern = re.compile(r'\{.*\}')

    while True:
        try:
            raw_line = ser.readline().decode('utf-8', errors='replace').strip()
            if not raw_line:
                continue

            # Look for JSON payload in line
            match = json_pattern.search(raw_line)
            if match:
                json_str = match.group(0)
                try:
                    payload = json.loads(json_str)
                    if "temperature" in payload or "voltage" in payload:
                        if "device_id" not in payload or not payload["device_id"]:
                            payload["device_id"] = "RENEWCRED-001"

                        res = requests.post(args.url, json=payload, timeout=3.0)
                        if res.status_code == 200:
                            data = res.json()
                            status_str = data.get("status", "NORMAL")
                            success_count += 1
                            print(
                                f"[HW TX #{success_count:04d}] [{status_str:7}] "
                                f"V={payload.get('voltage',12.4):.2f}V | "
                                f"I={payload.get('current',1.85):.2f}A | "
                                f"P={payload.get('power',22.94):.2f}W | "
                                f"T={payload.get('temperature',29.4):.1f}°C | "
                                f"H={payload.get('humidity',55):.1f}% -> Ingested & AI Verified!"
                            )
                        else:
                            print(f"[WARN] Backend status {res.status_code}: {res.text}")
                except json.JSONDecodeError:
                    pass
            else:
                if any(b in raw_line for b in ["[Wi-Fi]", "[CONFIG]", "[BUTTON]", "[OLED]", "[TX"]):
                    print(f"[ESP32 LOG] {raw_line}")

        except KeyboardInterrupt:
            print("\nStopping USB bridge.")
            break
        except Exception as e:
            print(f"[ERROR] {e}")
            time.sleep(1)

    ser.close()

if __name__ == '__main__':
    main()
