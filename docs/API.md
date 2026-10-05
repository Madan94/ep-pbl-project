# API guide

Base URL: http://127.0.0.1:8000. Interactive schema: /docs. The active Vite workspace is standalone and does not call these endpoints.

## Ingestion

POST /api/sensor-data accepts:

~~~json
{
  "device_id": "SOLAR_ESP32_001",
  "temperature": 29.4,
  "humidity": 58,
  "voltage": 12.5,
  "current": 1.8,
  "power": 22.5
}
~~~

Only temperature is required. Missing electrical values are estimated/computed; omitted timestamps use current UTC. The response contains an ID, sensor values, expected_power, status, reason, confidence, and timestamp.

Each ingestion saves a reading and prediction snapshot, then broadcasts:

~~~json
{
  "type": "NEW_READING",
  "data": {
    "device_id": "SOLAR_ESP32_001",
    "power": 22.5,
    "expected_power": 22.5,
    "status": "NORMAL"
  }
}
~~~

The data object also contains the remaining ingestion response fields. Connect to ws://127.0.0.1:8000/ws/live. No historical replay or authentication is provided.

## Querying

- GET /api/latest?device_id=SOLAR_ESP32_001: latest record; 404 if absent.
- GET /api/history?device_id=SOLAR_ESP32_001&limit=50: newest first.
- GET /api/sensor-data: simplified latest reading or an OFFLINE placeholder.
- GET /api/prediction-logs?limit=100: object with total and logs; optional device_id. Limit maximum is 1,000. Total is the returned count, not a database-wide count.
- GET /api/ai/status: rule-engine description and cloud configuration, not live provider verification.

## Accounting

GET /api/carbon returns current-session counts and estimates, all-time counts/estimates, session timestamps, and archive metadata. It aggregates all devices; a device_id filter is not implemented here.

POST /api/carbon/reset-session archives totals and changes the in-memory session boundary. GET /api/carbon/sessions reads archives. An empty session falls back to all existing readings. Accepted readings assume 1.5 seconds of generation regardless of their timestamps.

## Certificate creation

POST /api/carbon/mint:

~~~json
{
  "device_id": "SOLAR_ESP32_001",
  "energy_kwh": 18.642,
  "owner_wallet": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
}
~~~

Returns status, certificate, and blockchain objects. The blockchain object is simulated. Caller-supplied energy is not bound to an eligible sensor dataset. If energy is omitted/nonpositive, session totals are used, with a small demo fallback for empty totals.

GET /api/certificates/latest returns the latest non-seeded record or a generated preview. GET /api/certificates/{cert_id} returns saved metadata, but synthesizes a preview for unknown IDs. Do not treat a successful lookup as proof that a certificate was issued. Preview/seed metadata is not authoritative cryptographic evidence.

Append /download for application/pdf or /render for printable HTML. HTML triggers the browser print dialog.

## Marketplace

GET /api/marketplace/listings seeds two projects if the listing table is empty and returns active listings. Prices are INR per credit; total_price_inr is price multiplied by credit quantity.

POST /api/marketplace/buy:

~~~json
{
  "listing_id": "ID_FROM_LISTINGS_RESPONSE",
  "buyer_wallet": "demo-buyer"
}
~~~

Updates ownership and marks the listing SOLD. Unavailable/already sold listings return 400. There is no wallet signature, payment, or authenticated buyer check.

POST /api/marketplace/retire:

~~~json
{
  "certificate_id": "ID_FROM_MINT_RESPONSE",
  "owner_wallet": "demo-owner",
  "retirement_reason": "Demonstration offset"
}
~~~

Missing certificates return 404; already retired certificates return 400. Ownership is not authenticated. The current implementation marks the database record retired and uses fixed simulated token ID 1001; it does not reconcile listings or real blockchain state.

## Operational boundaries

Write endpoints are unauthenticated, CORS is unrestricted, database queries are not generally bounded, and session/WebSocket state is process-local. Do not expose this API as a production trading/issuance service without the changes listed in the README.
