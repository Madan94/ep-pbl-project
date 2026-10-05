# RenewCred

**Clean energy monitoring, telemetry verification, and demonstration carbon accounting in a professional SaaS workspace.**

RenewCred combines a responsive React dashboard, a FastAPI backend, SQLite persistence, ESP32 firmware, and a Solidity registry prototype. It demonstrates how sensor readings can become energy estimates, avoided-emissions summaries, certificates, and sample marketplace activity.

> **Status: academic prototype.** The active dashboard uses continuous mock data. Backend blockchain transactions are simulated. Certificates are demonstration artifacts, not independently certified carbon credits. Real payments, real chain transactions, and production authorization are not implemented.

## Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology stack](#technology-stack)
- [Quick start](#quick-start)
- [Backend setup](#backend-setup)
- [Configuration](#configuration)
- [Telemetry and accounting](#telemetry-and-accounting)
- [API reference](#api-reference)
- [Hardware](#hardware)
- [Certificates and blockchain](#certificates-and-blockchain)
- [Repository structure](#repository-structure)
- [Validation](#validation)
- [Deployment and production readiness](#deployment-and-production-readiness)
- [Troubleshooting](#troubleshooting)
- [Contributing and license](#contributing-and-license)

## Features

### Active dashboard

The light workspace uses sage accents, responsive navigation, monitoring tables, and reported-versus-expected generation charts. Its visual direction takes inspiration from [ElevenLabs](https://elevenlabs.io/), with RenewCred-specific content.

| View | Functionality |
| --- | --- |
| Overview | Live power, energy, avoided CO2, verification rate, generation chart, diagnostics, recent telemetry, CSV export |
| Verification | Approved/flagged totals, live activity, manual anomaly injection |
| Certificates | Six seeded certificates, session demo certificates, JSON downloads |
| Marketplace | Six renewable projects, indicative INR prices, demo purchases, portfolio, retirement |
| Telemetry logs | Device/ID/reason search, status filters, detailed readings, filtered CSV export |

The generator starts with **80 readings across four node IDs**, adds one reading every **1.5 seconds**, and retains up to **200 readings**. Its historical summary starts at 1,460 readings and 18.642 kWh; totals intentionally exceed the rolling buffer.

Pause/resume controls telemetry and visible marketplace price updates. Automatic anomalies occur every 47th step. Manual anomaly injection resumes streaming and queues a flagged reading. Flagged power does not increase carbon totals.

Purchases, retirements, and new certificates persist across tab navigation. **Refreshing resets browser demo state.**

### Backend prototype

- Sensor ingestion, automatic device registration, and persistent prediction snapshots.
- SQLite readings, certificates, and marketplace records.
- Physical consistency checks with NORMAL, SUSPECT, and ANOMALY outcomes.
- Optional OpenRouter explanations with local fallback.
- Session/all-time carbon estimates and local session archives.
- SHA-256 certificate digests, native PDFs, and printable HTML.
- Demonstration ownership updates, retirement, and WebSocket broadcasts.

## Architecture

~~~mermaid
flowchart LR
  Mock[Browser mock generator] --> UI[React / Vite workspace]
  UI --> Export[CSV and JSON downloads]
  ESP32[ESP32 firmware] --> API[FastAPI]
  Simulator[Python simulator] --> API
  USB[USB serial bridge] --> API
  API --> Rules[Physical verification]
  Rules -. Optional explanation .-> Cloud[OpenRouter]
  API --> DB[(SQLite)]
  DB --> Carbon[Carbon estimates]
  Carbon --> Cert[Metadata / PDF / HTML]
  Cert --> Ledger[In-memory ledger simulation]
  API --> WS[WebSocket broadcasts]
~~~

**The active frontend does not consume backend APIs or WebSocket telemetry.** Starting the API or connecting hardware does not replace its mock data. Earlier API-connected implementations remain as reference code.

The Solidity registry is separate from the Python simulation; the backend never calls the contract.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, Vite 5, Tailwind CSS 3, Recharts, Lucide React |
| Earlier wallet helper | ethers 6; inactive in the dashboard |
| API | Python 3.12, FastAPI, Pydantic, Uvicorn |
| Persistence | SQLAlchemy, SQLite |
| Optional explanations | OpenRouter HTTP requests |
| Certificates | ReportLab, HTML, SHA-256 |
| Hardware | ESP32, DHT22, SSD1306 OLED, LEDs, button, buzzer |
| Contract | Solidity ^0.8.20 |
| Tests | Node test runner, Python unittest, FastAPI TestClient |

No trained scikit-learn model is loaded. Supabase is not currently integrated.

## Quick start

### Prerequisites

- Git.
- Node.js 22 or newer with npm; validation used Node.js 24.21.0.
- Python 3.12 for the backend, optional for the dashboard.
- Arduino IDE and ESP32 hardware only for firmware testing.

### Standalone dashboard

~~~powershell
git clone https://github.com/Madan94/ep-pbl-project.git
cd ep-pbl-project\frontend
npm.cmd ci
npm.cmd run dev
~~~

Open **http://localhost:3000**. No backend, API key, wallet, database, or hardware is required. If the port is occupied, use the URL printed by Vite. On macOS/Linux, use npm instead of npm.cmd.

### Build and preview

From frontend:

~~~powershell
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1
~~~

Output is written to **frontend/dist/**. Preview normally uses port 4173 and is for local inspection; deploy built files through static hosting.

## Backend setup

Run from the repository root:

~~~powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.lock.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
~~~

[requirements.txt](requirements.txt) declares runtime dependencies. [requirements-dev.txt](requirements-dev.txt) adds test support. [requirements.lock.txt](requirements.lock.txt) records exact versions used in the verified runtime/test environment, including test dependencies. It is a pip-compatible snapshot, not a hash-verified lockfile.

| Address | Purpose |
| --- | --- |
| http://127.0.0.1:8000/docs | Swagger documentation |
| http://127.0.0.1:8000/redoc | ReDoc documentation |
| http://127.0.0.1:8000/openapi.json | API schema |
| http://127.0.0.1:8000/ | Earlier static dashboard |
| ws://127.0.0.1:8000/ws/live | New-reading broadcasts |

Tables are created on API import. The default database is renewcred.db beside database.py and is ignored by Git. The API root serves static/index.html, **not the active Vite application**.

### Continuous backend simulator

In another terminal:

~~~powershell
.\.venv\Scripts\python.exe simulate_esp32.py --continuous --interval 1.5 --anomaly-every 12
~~~

Stop with Ctrl+C. Continuous mode is enabled by default; there is no finite --count option. Use --anomaly-every 0 to disable anomalies. Additional options: --url and --device-id.

### Submit one reading

~~~powershell
$reading = @{
  device_id = "SOLAR_ESP32_001"
  temperature = 29.4
  humidity = 58.0
  voltage = 12.5
  current = 1.8
  power = 22.5
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/sensor-data" -Method Post -ContentType "application/json" -Body $reading
Invoke-RestMethod "http://127.0.0.1:8000/api/latest?device_id=SOLAR_ESP32_001"
Invoke-RestMethod "http://127.0.0.1:8000/api/carbon"
~~~

## Configuration

[.env.example](.env.example) lists placeholders. **The backend does not automatically load .env files.** Export variables before starting the process or configure them through your process manager.

| Variable | Default | Behavior |
| --- | --- | --- |
| OPENROUTER_API_KEY | Empty | Enables optional explanation requests; no hardcoded key fallback |
| OPENROUTER_MODEL | mistralai/mistral-7b-instruct:free | Request model ID; availability is not guaranteed |
| RENEWCRED_DATABASE_URL | Local SQLite URL | SQLAlchemy connection URL override |
| EVM_RPC_URL | http://127.0.0.1:8545 | Demo bridge metadata only; no RPC calls |

~~~powershell
$env:OPENROUTER_API_KEY = "YOUR_API_KEY"
$env:OPENROUTER_MODEL = "YOUR_AVAILABLE_MODEL_ID"
~~~

For local verification only:

~~~powershell
Remove-Item Env:OPENROUTER_API_KEY -ErrorAction SilentlyContinue
~~~

Configuration is not connectivity verification. Provider failures use local explanations. Cloud text does not override physical decisions, certify credits, or sign records. The dashboard sends no data to OpenRouter.

SQLite is the supported local database. Other SQLAlchemy URLs need a driver and separate schema/runtime validation. A PostgreSQL/Supabase deployment is not provided.

## Telemetry and accounting

### Input schema

| Field | Requirement | Unit / fallback |
| --- | --- | --- |
| device_id | Optional | RENEWCRED-001 |
| temperature | Required | Celsius |
| humidity | Optional | Relative humidity percentage; default 55 |
| voltage | Optional | Volts; backend estimate if missing |
| current | Optional | Amperes; backend estimate if missing |
| power | Optional | Watts; voltage × current if missing |
| carbon | Optional | Legacy auxiliary value, not authoritative avoided emissions |
| timestamp | Optional | ISO datetime; current UTC if missing |

Missing electrical fields are estimates, not measurements. Complete physical input constraints and device authentication are not yet enforced.

### Verification

Reported power is compared to voltage × current:

- Up to 15% deviation: NORMAL.
- Above 15% and up to 35%: SUSPECT.
- Above 35%: ANOMALY.
- Negative voltage/current, voltage above 30 V, current above 10 A, and nonzero power with zero expected power are explicitly flagged.

The dashboard has its own mock generator and simulated confidence scores, not calibrated model probabilities.

### Calculation

~~~text
energy_increment_kWh = (accepted_power_W / 1000) × (1.5 / 3600)
avoided_CO2_kg        = accepted_energy_kWh × 0.82
estimated_credits    = avoided_CO2_kg / 1000
~~~

Only NORMAL readings increase energy totals. The 0.82 kg/kWh factor is a hardcoded project assumption, not a certified baseline. For example, 1,000 kWh estimates 820 kg avoided CO2 and 0.82 credits. A 24 W reading at 1.5 seconds adds 0.00001 kWh.

**Limitation:** The backend assumes 1.5 seconds for each accepted reading instead of integrating timestamps. Firmware sends every 5 seconds. Per-device timestamp integration is required before hardware data supports measured generation or verified issuance. Duplicate submissions are not deduplicated.

Session boundaries are process-local. With no new readings, a new/reset session falls back to all stored readings. Reset archives a summary in carbon_calculation_sessions.json without deleting the database.

## API reference

| Method | Route | Purpose |
| --- | --- | --- |
| POST | /api/sensor-data | Ingest, verify, save, broadcast |
| GET | /api/sensor-data | Simplified latest reading/offline placeholder |
| GET | /api/latest | Latest reading; optional device_id |
| GET | /api/history | Readings; optional device_id and limit |
| GET | /api/ai/status | Rule-engine and cloud configuration status |
| GET | /api/carbon | Session and all-time totals |
| POST | /api/carbon/reset-session | Archive totals, reset session |
| GET | /api/carbon/sessions | Session archives |
| POST | /api/carbon/mint | Certificate and simulated transaction |
| GET | /api/certificates/latest | Latest non-seeded certificate/preview |
| GET | /api/certificates/{cert_id} | Saved data; unknown IDs generate previews |
| GET | /api/certificates/{cert_id}/download | Native PDF |
| GET | /api/certificates/{cert_id}/render | HTML with automatic print dialog |
| GET | /api/marketplace/listings | Active listings; seed demos if table empty |
| POST | /api/marketplace/buy | Demo ownership update |
| POST | /api/marketplace/retire | Database and simulated ledger retirement |
| GET | /api/prediction-logs | Snapshots; device_id, limit up to 1,000 |
| WS | /ws/live | NEW_READING broadcasts |

See [docs/API.md](docs/API.md) for payloads and response boundaries. Running /docs reflects the actual request models.

## Hardware

Firmware uses Wi-Fi client mode, posts directly to FastAPI, and emits USB JSON.

| Component | Pin / configuration |
| --- | --- |
| DHT22 | GPIO 4 |
| SSD1306 OLED | SDA 21, SCL 22; 0x3C; 128 × 64 |
| Button | GPIO 15; INPUT_PULLUP |
| Green / red / blue LED | GPIO 18 / 19 / 2 |
| Buzzer | GPIO 23 |
| Serial | 115200 baud |
| Transmission | Every 5,000 ms |

~~~powershell
Copy-Item firmware\config.example.h firmware\config.h
~~~

Fill ignored config.h with your network settings and the backend computer's LAN IP. For LAN testing, bind Uvicorn to 0.0.0.0 and configure the firewall.

Install the ESP32 board package, ArduinoJson, Adafruit GFX, Adafruit SSD1306, and DHT libraries in Arduino IDE. Flash firmware/esp32_renewcred.ino. Short button presses change pages; long presses queue anomalies.

DHT22 supplies temperature/humidity with fallback values. **Voltage/current/power are model-generated; no electrical measurement driver is included.**

~~~powershell
.\.venv\Scripts\python.exe esp32_serial_bridge.py --port COM7 --baud 115200
~~~

Use the correct port or omit --port for discovery. Avoid USB forwarding alongside direct Wi-Fi delivery of identical readings.

esp32_bridge.py expects the earlier access-point endpoint at http://192.168.4.1/api/data, absent from the bundled firmware. See [docs/HARDWARE.md](docs/HARDWARE.md).

## Certificates and blockchain

The dashboard creates JSON demo certificates in browser memory. The backend independently stores metadata and generates PDF/HTML.

blockchain_bridge.py generates transaction-shaped hashes and maintains a dictionary. Polygon labels and CONFIRMED responses are simulated: no RPC request, signature, gas payment, or receipt exists. The ledger resets on restart while SQLite persists.

The Solidity registry includes submission, duplicate-hash prevention, transfer, retirement, and lookup. Energy/CO2 use a 10^4 scale; credits use 10^9. It is not an ERC-20/ERC-721 implementation. Deployment tooling and contract tests are absent. Public submission is not protected by the declared onlyOwner modifier.

The inactive ethers helper includes an illustrative contract address and demo wallet fallback; neither is a validated deployment.

## Repository structure

~~~text
ep-pbl-project/
├── README.md / .env.example
├── requirements.txt / requirements-dev.txt / requirements.lock.txt
├── main.py                       FastAPI orchestration
├── database.py                   SQLite models
├── ai_verifier.py                Rules and optional audit text
├── carbon_engine.py              Estimates and certificate hashes
├── blockchain_bridge.py          Simulated ledger
├── pdf_generator.py              PDF / HTML
├── simulate_esp32.py              Backend simulator
├── esp32_serial_bridge.py         USB forwarding
├── esp32_bridge.py                Earlier access-point bridge
├── contracts/RenewCredCarbon.sol
├── firmware/
│   ├── esp32_renewcred.ino
│   └── config.example.h
├── frontend/
│   ├── src/App.jsx               Active workspace
│   ├── src/components/           Current views and earlier Tab experiments
│   ├── src/utils/                Generator, exports, earlier wallet helper
│   ├── scripts/mock-data.test.mjs
│   ├── public/favicon.svg
│   ├── app/ and components/      Earlier Next.js experiment
│   └── package.json / vite.config.js
├── static/index.html             Earlier server dashboard
├── tests/test_backend.py
└── docs/                         API, hardware, deployment, legacy notes
~~~

Credentials, databases, archives, virtual environments, dependencies, and builds are excluded from Git. See [docs/LEGACY.md](docs/LEGACY.md) for inactive implementations.

## Validation

From frontend:

~~~powershell
npm.cmd test
npm.cmd run build
~~~

From the root:

~~~powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
~~~

Backend tests use temporary SQLite storage and disable live cloud requests. They do not modify your database or session archive.

| Check | Release result |
| --- | --- |
| Frontend data tests | 4 passed: chronology, node coverage, power rules, IDs, anomalies, carbon units |
| Frontend build | Passed with separate React, chart, icon bundles |
| Backend tests | 12 passed: accounting, verification, cloud fallback, configuration status, ingestion/history/logs, anomaly exclusion, PDF/demo mint/retirement/purchase, WebSocket delivery |
| Page rendering | Five views rendered populated content in server-render checks |
| Browser visual/interactions | Not validated; no browser connection available |
| External integrations | Physical hardware, live OpenRouter, contract deployment/chain transactions, payments, hosted deployment not validated |

The Python snapshot emits a Starlette/httpx deprecation warning during tests. Tests pass; review test-client compatibility on upgrades.

## Deployment and production readiness

For static hosting: set project root to frontend, install with npm ci, build with npm run build, publish dist. No API proxy or wallet service is required by the active dashboard. Google Fonts has system-font fallbacks; the older static dashboard also loads CDN scripts.

For controlled backend hosting: remove --reload, use persistent storage, and place Uvicorn behind a TLS proxy with WebSocket support. Keep one worker while session/connection/ledger state is process-local. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Before public production use:

- Add authentication, authorization, device identity, input bounds, rate limits, and restricted CORS. Current write endpoints are unauthenticated and CORS permits all origins.
- Add measured electrical inputs, timestamp accounting, deduplication, immutable provenance, and bounded queries.
- Introduce shared durable state, migrations, retention, backups, restore checks, and monitoring.
- Bind issuance to verified eligible readings and prevent double issuance. Minting currently accepts caller-supplied energy.
- Replace synthetic unknown-certificate previews with authoritative errors; verify metadata against its digest.
- Implement signed chain transactions, receipts, reconciliation, protected minting, and independent contract review.
- Enforce marketplace ownership, atomic settlement, and retirement/listing consistency. Retirement currently uses a fixed simulated token ID.
- Establish approved emissions methodology and independent certification before tradeable-credit claims.
- Complete browser/accessibility, hardware, load, security, and dependency checks.

## Troubleshooting

| Symptom | Explanation / action |
| --- | --- |
| PowerShell blocks npm.ps1 | Use npm.cmd |
| Python opens Microsoft Store | Install Python 3.12 and recreate the virtual environment |
| Missing Python imports | Install dependencies using the virtual environment interpreter |
| Dashboard stays simulated | Expected; it is independent of backend telemetry |
| /api/latest returns 404 | Submit a reading and verify the device filter |
| Cloud provider fails | Local verification continues; inspect exported configuration |
| USB port unavailable | Check cable/drivers/port and close Serial Monitor |
| Firmware cannot reach API | Check LAN IP, 0.0.0.0 binding, Wi-Fi, and firewall |
| Carbon differs from wall time | Fixed interval accounting does not reflect timestamp gaps |
| Reset displays old totals | No-new-reading sessions fall back to stored history |
| Portfolio disappears on refresh | Demo state is ephemeral |

## Contributing and license

Use focused branches, keep credentials out of source, distinguish simulated and verified behavior, run relevant tests/builds, and update documentation when interfaces change.

Report problems through [GitHub issues](https://github.com/Madan94/ep-pbl-project/issues) with reproduction steps and sanitized logs. Do not upload API keys, Wi-Fi credentials, private keys, or local databases. Revoke or rotate exposed credentials.

A repository-wide license has not been selected. The Solidity file's MIT SPDX identifier does not imply a license grant for every file. Add an explicit repository license before broader redistribution.
