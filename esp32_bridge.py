"""
RenewCred - ESP32 Access Point Live Bridge
Continuously streams live hardware sensor telemetry from the ESP32 Access Point (http://192.168.4.1/api/data)
into the RenewCred AI Verification & Carbon Engine backend (http://127.0.0.1:8000/api/sensor-data).

Usage:
  1. Connect to an access-point firmware network configured by you.
  2. Run RenewCred backend in one terminal: python main.py
  3. Run this bridge in another terminal:   python esp32_bridge.py
"""

import time
import requests
import sys

ESP32_URL = "http://192.168.4.1/api/data"
BACKEND_URL = "http://127.0.0.1:8000/api/sensor-data"

def main():
    print("==================================================================")
    print("      RenewCred ESP32 Hardware Live Bridge Service               ")
    print(f"      Polling from ESP32:  {ESP32_URL}")
    print(f"      Forwarding to API:   {BACKEND_URL}")
    print("==================================================================")
    
    success_count = 0
    fail_count = 0

    while True:
        try:
            # 1. Fetch live telemetry from ESP32 AP
            esp_res = requests.get(ESP32_URL, timeout=2.5)
            if esp_res.status_code == 200:
                data = esp_res.json()
                if "device_id" not in data or not data["device_id"]:
                    data["device_id"] = "ESP32_001"
                
                # 2. Ingest into RenewCred FastAPI Backend
                post_res = requests.post(BACKEND_URL, json=data, timeout=3.0)
                if post_res.status_code == 200:
                    out = post_res.json()
                    success_count += 1
                    status_badge = f"[{out.get('status', 'NORMAL')}]"
                    print(f"[PACKET #{success_count:04d}] {status_badge} "
                          f"V={data['voltage']:.2f}V | I={data['current']:.2f}A | P={data['power']:.2f}W | "
                          f"T={data['temperature']:.1f}°C | H={data['humidity']:.1f}% -> Ingested & AI-Verified")
                    fail_count = 0
                else:
                    print(f"[WARN] Backend returned status {post_res.status_code}: {post_res.text}")
            else:
                print(f"[WARN] ESP32 returned status {esp_res.status_code}")
                
        except requests.exceptions.ConnectionError:
            fail_count += 1
            if fail_count % 5 == 1:
                print("[INFO] Waiting for ESP32 at http://192.168.4.1... Make sure your laptop Wi-Fi is connected to 'Renewcred'")
        except Exception as e:
            print(f"[ERROR] {e}")

        time.sleep(1.5)

if __name__ == "__main__":
    main()
