# Deployment guide

## Static demonstration workspace

The current dashboard is a client-side mock workspace. Configure a static hosting service with:

| Setting | Value |
| --- | --- |
| Project root | frontend |
| Install | npm ci |
| Build | npm run build |
| Output | dist |

Deploy the built directory, not node_modules or source-only HTML. Verify the home page, JavaScript/CSS assets, all five tabs, narrow-screen navigation, filtering, downloads, and pause/resume after deployment. The active application does not use URL routes for tabs; no backend/API rewrite is required.

Browser state resets on refresh. No cloud credentials are needed. Google Fonts is optional because system fonts are available as fallback.

## Controlled backend hosting

The backend remains a prototype. For an internal demonstration:

1. Create a Python 3.12 environment and install requirements.lock.txt.
2. Export environment variables; .env files are not automatically read.
3. Use persistent writable SQLite storage and a predictable absolute database URL.
4. Run Uvicorn without development reload.
5. Place the service behind a TLS reverse proxy supporting WebSocket upgrades.
6. Keep one worker while session boundaries, connections, and the simulated ledger remain process-local.
7. Limit access to the demonstration audience.

Example server command:

~~~powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
~~~

Binding to loopback assumes a same-host proxy. Adapt the bind address for a container/private network. Uvicorn creates tables on import; versioned migrations are not provided.

The backend root still serves the earlier static/index.html dashboard. It does not serve frontend/dist automatically. Vite's development proxy configuration does not become a production reverse proxy.

## Storage and restarts

- SQLite stores device, reading, certificate, listing, and prediction records.
- Session archive JSON is written beside main.py.
- Session boundaries and WebSocket connections are in process memory.
- The simulated blockchain ledger is in process memory and is lost on restart.

Back up SQLite consistently and verify restore procedures before preserving important data. Concurrent JSON archive updates and multiworker behavior need redesign. Do not deploy the current SQLite/JSON combination to ephemeral storage if persistence matters.

## Public production release requirements

Complete authentication, authorization, device signatures, validated physical inputs, rate limits, CORS restrictions, accounting integration, deduplication, migrations, retention, observability, and backup/restore tests.

Certificate issuance needs eligible-record binding, double-issuance prevention, correct metadata hashes, authoritative lookup semantics, and independently approved methodology. Real blockchain integration requires secure signing, contract deployment verification, receipts, reconciliation, and contract review. Real trading needs wallet ownership verification, atomic state transitions, retirement/listing consistency, and settlement.

No hosted deployment, load test, browser journey, real cloud request, or blockchain transaction was verified in this release.
