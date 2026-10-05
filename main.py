"""
RenewCred - Main End-to-End API (Modules 1 - 7)
Integrates ESP32 Ingestion, AI Verification (dMRV), Supabase/SQLite DB,
Carbon Engine, Blockchain Smart Contract Bridge, Certificate PDF Generator,
and Carbon Marketplace.
"""

from datetime import datetime, timezone
import json
import math
import os
from typing import List, Optional
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Query, Response, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

# Local Modules
from ai_verifier import check_cloud_ai_api_key, verify_telemetry
from blockchain_bridge import blockchain_bridge
from carbon_engine import calculate_carbon_offset, create_certificate_record
import database
from database import CarbonRecordDB, DeviceDB, MarketplaceListingDB, PredictionLogDB, SensorReadingDB, get_db, init_db
from pdf_generator import generate_certificate_html, generate_certificate_pdf_bytes

init_db()

app = FastAPI(
    title="RenewCred End-to-End Platform API",
    description="ESP32 -> AI Verification -> Carbon Engine -> Blockchain Smart Contract -> Marketplace",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        dead = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead.append(connection)
        for conn in dead:
            self.disconnect(conn)

manager = ConnectionManager()


class SensorReadingInput(BaseModel):
    device_id: Optional[str] = "RENEWCRED-001"
    temperature: float
    humidity: Optional[float] = 55.0
    voltage: Optional[float] = None
    current: Optional[float] = None
    power: Optional[float] = None
    carbon: Optional[float] = None
    timestamp: Optional[datetime] = None


class MintCreditRequest(BaseModel):
    device_id: Optional[str] = "RENEWCRED-001"
    energy_kwh: Optional[float] = None
    owner_wallet: Optional[str] = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"


class BuyCreditRequest(BaseModel):
    listing_id: str
    buyer_wallet: str = "0x3C44CdD459672051407800165241539A9D0a747E"


class RetireCreditRequest(BaseModel):
    certificate_id: str
    owner_wallet: str
    retirement_reason: str = "Offsetting Annual Corporate Scope 2 Footprint"


def seed_marketplace_data(db: Session):
    if db.query(MarketplaceListingDB).count() == 0:
        seed_records = [
            {
                "cert_id": "RCC-2026-88102",
                "device_id": "SOLAR-ESP32-001",
                "energy_kwh": 125.40,
                "co2_kg": 102.83,
                "credits": 0.10283,
                "price": 1250.0,
                "project": "Rooftop Solar Generation",
            },
            {
                "cert_id": "RCC-2026-44019",
                "device_id": "SOLAR-ESP32-002",
                "energy_kwh": 305.00,
                "co2_kg": 250.10,
                "credits": 0.25010,
                "price": 1400.0,
                "project": "EV Clean Charging Station",
            },
        ]

        for s in seed_records:
            cert_data = create_certificate_record(s["device_id"], s["energy_kwh"])
            cert_data["certificate_id"] = s["cert_id"]
            cert_data["co2_reduced_kg"] = s["co2_kg"]
            cert_data["carbon_credits"] = s["credits"]

            chain_rec = blockchain_bridge.submit_and_mint(cert_data)

            db_record = CarbonRecordDB(
                certificate_id=s["cert_id"],
                device_id=s["device_id"],
                project_id=s["project"],
                energy_kwh=s["energy_kwh"],
                co2_reduced_kg=s["co2_kg"],
                carbon_credits=s["credits"],
                certificate_hash=cert_data["certificate_hash"],
                tx_hash=chain_rec["tx_hash"],
                verification_status="AI VERIFIED ✓",
                blockchain_status="CONFIRMED",
                owner_wallet="0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
            )
            db.add(db_record)

            listing = MarketplaceListingDB(
                certificate_id=s["cert_id"],
                seller_wallet="0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
                project_name=s["project"],
                credits_amount=s["credits"],
                co2_kg=s["co2_kg"],
                price_per_credit_inr=s["price"],
                status="ACTIVE",
            )
            db.add(listing)

        db.commit()


@app.get("/")
def serve_dashboard():
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"service": "RenewCred End-to-End API"}


@app.get("/api/ai/status")
def get_ai_status():
    """Checks AI model status and whether a Cloud API key is provided."""
    return {
        "status": "ONLINE",
        "local_ml": "Deterministic physical power consistency checks",
        "cloud_ai": check_cloud_ai_api_key(),
        "note": "No external cloud API key is required. Local physics rules determine status. OpenRouter explanations are optional; no trained ML model is loaded."
    }


@app.post("/api/sensor-data")
async def post_sensor_data(reading: SensorReadingInput, db: Session = Depends(get_db)):
    ts = reading.timestamp or datetime.now(timezone.utc)

    dev_id = reading.device_id or "RENEWCRED-001"
    device = db.query(DeviceDB).filter(DeviceDB.device_id == dev_id).first()
    if not device:
        device = DeviceDB(device_id=dev_id, name=f"Node {dev_id}")
        db.add(device)
    device.last_seen = ts

    # If voltage/current not supplied by hardware, compute dynamic solar PV electrical model from live temperature
    temp = reading.temperature
    hum = reading.humidity if reading.humidity is not None else 55.0

    if reading.voltage is not None:
        volts = reading.voltage
    else:
        # Solar PV thermal model: standard panel voltage drop with rising temperature (-0.04V/°C above 25°C)
        temp_drop = (temp - 25.0) * 0.04
        # Micro-drift simulating natural sunlight irradiance fluctuation
        time_seed = (datetime.now(timezone.utc).timestamp() % 60)
        sun_variation = round(math.sin(time_seed / 5.0) * 0.25, 2)
        volts = round(max(10.5, min(14.5, 12.60 - temp_drop + sun_variation)), 2)

    if reading.current is not None:
        amps = reading.current
    else:
        # Solar current varies with ambient humidity and irradiance
        time_seed = (datetime.now(timezone.utc).timestamp() % 60)
        curr_variation = round(math.cos(time_seed / 4.0) * 0.12, 2)
        amps = round(max(0.5, min(3.5, 1.80 + curr_variation - (hum - 50.0) * 0.002)), 2)

    reported_power = reading.power if reading.power is not None else round(volts * amps, 2)
    expected_power, status, reason, confidence = verify_telemetry(volts, amps, reported_power)

    carbon_val = reading.carbon if reading.carbon is not None else round((temp * 0.001) + (hum * 0.0001), 4)

    db_reading = SensorReadingDB(
        device_id=dev_id,
        temperature=reading.temperature,
        humidity=hum,
        voltage=volts,
        current=amps,
        power=reported_power,
        expected_power=expected_power,
        status=status,
        anomaly_reason=reason if status != "NORMAL" else None,
        timestamp=ts,
    )
    db.add(db_reading)
    db.commit()
    db.refresh(db_reading)

    # --- Compute live session carbon snapshot ---
    session_readings = db.query(SensorReadingDB).filter(
        SensorReadingDB.timestamp >= CURRENT_SESSION_START
    ).all()
    if not session_readings:
        session_readings = db.query(SensorReadingDB).all()
    sess_energy = sum((r.power / 1000.0) * (1.5 / 3600.0) for r in session_readings if r.status == "NORMAL")
    sess_calc = calculate_carbon_offset(sess_energy)

    # --- Log prediction snapshot to PredictionLogDB ---
    pred_log = PredictionLogDB(
        timestamp=ts,
        device_id=dev_id,
        voltage=volts,
        current=amps,
        power_reported=reported_power,
        power_expected=expected_power,
        temperature=reading.temperature,
        humidity=hum,
        ai_status=status,
        ai_reason=reason if status != "NORMAL" else None,
        session_energy_kwh=sess_calc["energy_kwh"],
        session_co2_kg=sess_calc["co2_reduced_kg"],
        session_carbon_credits=sess_calc["carbon_credits"],
        session_reading_count=len(session_readings),
        source="LIVE",
    )
    db.add(pred_log)
    db.commit()

    ts_iso = db_reading.timestamp.replace(tzinfo=timezone.utc).isoformat() if db_reading.timestamp.tzinfo is None else db_reading.timestamp.isoformat()
    record_out = {
        "id": db_reading.id,
        "device_id": db_reading.device_id,
        "temperature": db_reading.temperature,
        "humidity": db_reading.humidity,
        "voltage": db_reading.voltage,
        "current": db_reading.current,
        "power": db_reading.power,
        "carbon": carbon_val,
        "expected_power": db_reading.expected_power,
        "status": db_reading.status,
        "reason": reason,
        "confidence": confidence,
        "timestamp": ts_iso,
    }

    await manager.broadcast({"type": "NEW_READING", "data": record_out})
    return record_out


@app.get("/api/sensor-data")
def get_sensor_data_simple(db: Session = Depends(get_db)):
    latest = db.query(SensorReadingDB).order_by(SensorReadingDB.timestamp.desc()).first()
    if not latest:
        return {
            "device_id": "RENEWCRED-001",
            "temperature": 0.0,
            "humidity": 0.0,
            "power": 0.0,
            "carbon": 0.0,
            "status": "OFFLINE",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    carbon_est = round((latest.temperature * 0.001) + ((latest.humidity or 55.0) * 0.0001), 4)
    ts_iso = latest.timestamp.replace(tzinfo=timezone.utc).isoformat() if latest.timestamp and latest.timestamp.tzinfo is None else latest.timestamp.isoformat()
    return {
        "device_id": latest.device_id,
        "temperature": latest.temperature,
        "humidity": latest.humidity,
        "voltage": latest.voltage,
        "current": latest.current,
        "power": latest.power,
        "carbon": carbon_est,
        "status": latest.status,
        "timestamp": ts_iso
    }


@app.get("/api/latest")
def get_latest(device_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(SensorReadingDB)
    if device_id:
        query = query.filter(SensorReadingDB.device_id == device_id)
    latest = query.order_by(SensorReadingDB.timestamp.desc()).first()
    if not latest:
        raise HTTPException(status_code=404, detail="No telemetry data recorded")
    return latest


@app.get("/api/history")
def get_history(device_id: Optional[str] = None, limit: int = 50, db: Session = Depends(get_db)):
    query = db.query(SensorReadingDB)
    if device_id:
        query = query.filter(SensorReadingDB.device_id == device_id)
    records = query.order_by(SensorReadingDB.timestamp.desc()).limit(limit).all()
    res = []
    for r in records:
        ts_iso = r.timestamp.replace(tzinfo=timezone.utc).isoformat() if r.timestamp and r.timestamp.tzinfo is None else (r.timestamp.isoformat() if r.timestamp else datetime.now(timezone.utc).isoformat())
        res.append({
            "id": r.id,
            "device_id": r.device_id,
            "temperature": r.temperature,
            "humidity": r.humidity,
            "voltage": r.voltage,
            "current": r.current,
            "power": r.power,
            "expected_power": r.expected_power,
            "status": r.status,
            "anomaly_reason": r.anomaly_reason,
            "timestamp": ts_iso,
        })
    return res


SESSIONS_LOG_FILE = os.path.join(os.path.dirname(__file__), "carbon_calculation_sessions.json")
CURRENT_SESSION_START = datetime.now(timezone.utc)


def load_session_logs() -> list:
    if os.path.exists(SESSIONS_LOG_FILE):
        try:
            with open(SESSIONS_LOG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []


def save_session_log(session_data: dict):
    logs = load_session_logs()
    logs.insert(0, session_data)
    with open(SESSIONS_LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=2)


@app.get("/api/carbon")
def get_carbon_summary(db: Session = Depends(get_db)):
    global CURRENT_SESSION_START
    readings_all = db.query(SensorReadingDB).all()
    total_readings = len(readings_all)
    verified = sum(1 for r in readings_all if r.status == "NORMAL")
    anomalies = sum(1 for r in readings_all if r.status == "ANOMALY")

    total_energy_kwh = sum((r.power / 1000.0) * (1.5 / 3600.0) for r in readings_all if r.status == "NORMAL")
    calc_all = calculate_carbon_offset(total_energy_kwh)

    # Session-specific calculations (since CURRENT_SESSION_START)
    session_readings = [r for r in readings_all if r.timestamp and (r.timestamp.replace(tzinfo=timezone.utc) if r.timestamp.tzinfo is None else r.timestamp) >= CURRENT_SESSION_START]
    if not session_readings:
        # If no readings after session start, treat all readings as current active session
        session_readings = readings_all

    session_verified = sum(1 for r in session_readings if r.status == "NORMAL")
    session_anomalies = sum(1 for r in session_readings if r.status == "ANOMALY")
    session_energy_kwh = sum((r.power / 1000.0) * (1.5 / 3600.0) for r in session_readings if r.status == "NORMAL")
    calc_session = calculate_carbon_offset(session_energy_kwh)

    first_ts = session_readings[0].timestamp if session_readings else CURRENT_SESSION_START
    last_ts = session_readings[-1].timestamp if session_readings else datetime.now(timezone.utc)

    first_iso = first_ts.replace(tzinfo=timezone.utc).isoformat() if first_ts.tzinfo is None else first_ts.isoformat()
    last_iso = last_ts.replace(tzinfo=timezone.utc).isoformat() if last_ts.tzinfo is None else last_ts.isoformat()

    return {
        # Current active ESP32 connection session totals
        "total_readings": len(session_readings),
        "verified_readings": session_verified,
        "anomaly_readings": session_anomalies,
        "total_energy_kwh": calc_session["energy_kwh"],
        "total_co2_reduced_kg": calc_session["co2_reduced_kg"],
        "total_carbon_credits": calc_session["carbon_credits"],
        "emission_factor_kg_per_kwh": 0.82,

        # Session metadata (for user transparency & file tracking)
        "session_start_time": first_iso,
        "session_end_time": last_iso,
        "all_time_readings": total_readings,
        "all_time_energy_kwh": calc_all["energy_kwh"],
        "all_time_co2_reduced_kg": calc_all["co2_reduced_kg"],
        "all_time_carbon_credits": calc_all["carbon_credits"],
        "saved_log_file": "carbon_calculation_sessions.json"
    }


@app.post("/api/carbon/reset-session")
def reset_carbon_session(db: Session = Depends(get_db)):
    global CURRENT_SESSION_START
    current_summary = get_carbon_summary(db)
    
    # Save the completed session data into the json log file
    session_record = {
        "session_id": f"SESS-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}",
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "calculated_from": current_summary.get("session_start_time"),
        "calculated_to": current_summary.get("session_end_time"),
        "total_packets": current_summary.get("total_readings"),
        "energy_kwh": current_summary.get("total_energy_kwh"),
        "co2_reduced_kg": current_summary.get("total_co2_reduced_kg"),
        "carbon_credits": current_summary.get("total_carbon_credits"),
        "logged_at": datetime.now(timezone.utc).isoformat()
    }
    save_session_log(session_record)

    # Set new session start time to NOW
    CURRENT_SESSION_START = datetime.now(timezone.utc)
    return {
        "status": "SUCCESS",
        "message": "Telemetry session reset! Calculations will now track new ESP32 connection data.",
        "archived_session": session_record,
        "new_session_start": CURRENT_SESSION_START.isoformat(),
        "log_file": SESSIONS_LOG_FILE
    }


@app.get("/api/carbon/sessions")
def get_carbon_session_logs():
    return {
        "log_file_path": SESSIONS_LOG_FILE,
        "sessions": load_session_logs()
    }


@app.post("/api/carbon/mint")
def mint_carbon_certificate(req: MintCreditRequest, db: Session = Depends(get_db)):
    device_id = req.device_id or "RENEWCRED-001"
    energy_kwh = req.energy_kwh

    if energy_kwh is None or energy_kwh <= 0:
        summary = get_carbon_summary(db)
        energy_kwh = summary.get("total_energy_kwh", 0.0)
        if energy_kwh <= 0:
            energy_kwh = 0.0002

    cert_data = create_certificate_record(device_id, energy_kwh, owner_wallet=req.owner_wallet)

    onchain = blockchain_bridge.submit_and_mint(cert_data)

    db_record = CarbonRecordDB(
        certificate_id=cert_data["certificate_id"],
        device_id=cert_data["device_id"],
        project_id=cert_data["project_id"],
        energy_kwh=cert_data["energy_kwh"],
        co2_reduced_kg=cert_data["co2_reduced_kg"],
        carbon_credits=cert_data["carbon_credits"],
        certificate_hash=cert_data["certificate_hash"],
        tx_hash=onchain["tx_hash"],
        verification_status="AI VERIFIED ✓",
        blockchain_status="CONFIRMED",
        owner_wallet=req.owner_wallet,
    )
    db.add(db_record)

    listing = MarketplaceListingDB(
        certificate_id=cert_data["certificate_id"],
        seller_wallet=req.owner_wallet,
        project_name="Solar Energy Telemetry Node",
        credits_amount=cert_data["carbon_credits"],
        co2_kg=cert_data["co2_reduced_kg"],
        price_per_credit_inr=1300.0,
        status="ACTIVE",
    )
    db.add(listing)

    db.commit()
    db.refresh(db_record)

    return {
        "status": "SUCCESS",
        "certificate": cert_data,
        "blockchain": onchain,
    }


@app.get("/api/certificates/latest")
def get_latest_certificate(db: Session = Depends(get_db)):
    # Always return live session carbon values (never the stale seeded records)
    summary = get_carbon_summary(db)
    energy_kwh = summary["total_energy_kwh"] if summary["total_energy_kwh"] > 0 else 0.0002

    # Look for most recently minted certificate (exclude seed data)
    cert = (
        db.query(CarbonRecordDB)
        .filter(CarbonRecordDB.certificate_id.not_in(["RCC-2026-88102", "RCC-2026-44019"]))
        .order_by(CarbonRecordDB.timestamp.desc())
        .first()
    )

    if cert:
        return {
            "certificate_id": cert.certificate_id,
            "project_id": cert.project_id,
            "device_id": cert.device_id,
            "energy_kwh": cert.energy_kwh,
            "co2_reduced_kg": cert.co2_reduced_kg,
            "carbon_credits": cert.carbon_credits,
            "certificate_hash": cert.certificate_hash,
            "tx_hash": cert.tx_hash,
            "verification_status": cert.verification_status,
            "blockchain_status": cert.blockchain_status,
            "retired": cert.retired,
            "retirement_reason": cert.retirement_reason,
            "owner_wallet": cert.owner_wallet,
            "timestamp": cert.timestamp.isoformat() if cert.timestamp else datetime.now(timezone.utc).isoformat(),
            "disclaimer": "RenewCred Digital Carbon Certificate — Prototype certificate for demonstration purposes. Not an independently certified carbon credit.",
        }

    # No minted certificate yet — return live session snapshot as a preview
    cert_data = create_certificate_record("RENEWCRED-001", energy_kwh)
    cert_data["energy_kwh"] = summary["total_energy_kwh"]
    cert_data["co2_reduced_kg"] = summary["total_co2_reduced_kg"]
    cert_data["carbon_credits"] = summary["total_carbon_credits"]
    return cert_data


@app.get("/api/certificates/{cert_id}")
def get_certificate(cert_id: str, db: Session = Depends(get_db)):
    seed_marketplace_data(db)
    cert = db.query(CarbonRecordDB).filter(CarbonRecordDB.certificate_id == cert_id).first()
    if not cert:
        summary = get_carbon_summary(db)
        energy_kwh = summary["total_energy_kwh"] if summary["total_energy_kwh"] > 0 else 0.0002
        cert_data = create_certificate_record("SOLAR-ESP32-001", energy_kwh)
        cert_data["certificate_id"] = cert_id
        return cert_data

    return {
        "certificate_id": cert.certificate_id,
        "project_id": cert.project_id,
        "device_id": cert.device_id,
        "energy_kwh": cert.energy_kwh,
        "co2_reduced_kg": cert.co2_reduced_kg,
        "carbon_credits": cert.carbon_credits,
        "certificate_hash": cert.certificate_hash,
        "tx_hash": cert.tx_hash,
        "verification_status": cert.verification_status,
        "blockchain_status": cert.blockchain_status,
        "retired": cert.retired,
        "retirement_reason": cert.retirement_reason,
        "owner_wallet": cert.owner_wallet,
        "timestamp": cert.timestamp.isoformat(),
        "disclaimer": "RenewCred Digital Carbon Certificate — Prototype certificate for demonstration purposes. Not an independently certified carbon credit.",
    }


@app.get("/api/certificates/{cert_id}/download")
def download_certificate_pdf(cert_id: str, db: Session = Depends(get_db)):
    cert_res = get_certificate(cert_id, db)
    pdf_bytes = generate_certificate_pdf_bytes(cert_res)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={cert_id}.pdf"}
    )


@app.get("/api/certificates/{cert_id}/render", response_class=HTMLResponse)
def render_certificate_pdf_view(cert_id: str, db: Session = Depends(get_db)):
    cert_res = get_certificate(cert_id, db)
    return generate_certificate_html(cert_res)


@app.get("/api/marketplace/listings")
def get_marketplace_listings(db: Session = Depends(get_db)):
    seed_marketplace_data(db)
    listings = db.query(MarketplaceListingDB).filter(MarketplaceListingDB.status == "ACTIVE").all()
    out = []
    for l in listings:
        out.append({
            "id": l.id,
            "certificate_id": l.certificate_id,
            "project_name": l.project_name,
            "seller_wallet": l.seller_wallet,
            "credits_amount": l.credits_amount,
            "co2_kg": l.co2_kg,
            "price_per_credit_inr": l.price_per_credit_inr,
            "total_price_inr": round(l.credits_amount * l.price_per_credit_inr, 2),
            "status": l.status,
            "created_at": l.created_at.isoformat(),
        })
    return out


@app.post("/api/marketplace/buy")
def buy_carbon_credits(req: BuyCreditRequest, db: Session = Depends(get_db)):
    listing = db.query(MarketplaceListingDB).filter(MarketplaceListingDB.id == req.listing_id).first()
    if not listing or listing.status != "ACTIVE":
        raise HTTPException(status_code=400, detail="Listing unavailable or already sold")

    cert = db.query(CarbonRecordDB).filter(CarbonRecordDB.certificate_id == listing.certificate_id).first()
    if cert:
        cert.owner_wallet = req.buyer_wallet

    listing.status = "SOLD"
    db.commit()

    return {
        "status": "SUCCESS",
        "message": f"Successfully purchased {listing.credits_amount} Carbon Credits!",
        "certificate_id": listing.certificate_id,
        "new_owner": req.buyer_wallet,
    }


@app.post("/api/marketplace/retire")
def retire_carbon_credits(req: RetireCreditRequest, db: Session = Depends(get_db)):
    cert = db.query(CarbonRecordDB).filter(CarbonRecordDB.certificate_id == req.certificate_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    if cert.retired:
        raise HTTPException(status_code=400, detail="Credit is already retired")

    cert.retired = True
    cert.retirement_reason = req.retirement_reason
    cert.retired_at = datetime.now(timezone.utc)
    db.commit()

    blockchain_bridge.retire_credit(1001, req.owner_wallet, req.retirement_reason)

    return {
        "status": "SUCCESS",
        "message": "Carbon credit successfully retired on-chain!",
        "certificate_id": cert.certificate_id,
        "retired_at": cert.retired_at.isoformat(),
        "retirement_reason": cert.retirement_reason,
    }


@app.get("/api/prediction-logs")
def get_prediction_logs(
    device_id: Optional[str] = None,
    limit: int = Query(default=100, le=1000),
    db: Session = Depends(get_db)
):
    """
    Returns all saved prediction snapshots — every live telemetry reading with
    timestamp, sensor values, AI verdict, and session carbon accumulation.
    """
    query = db.query(PredictionLogDB).order_by(PredictionLogDB.timestamp.desc())
    if device_id:
        query = query.filter(PredictionLogDB.device_id == device_id)
    logs = query.limit(limit).all()

    out = []
    for log in logs:
        ts_iso = (
            log.timestamp.replace(tzinfo=timezone.utc).isoformat()
            if log.timestamp and log.timestamp.tzinfo is None
            else (log.timestamp.isoformat() if log.timestamp else None)
        )
        out.append({
            "id": log.id,
            "timestamp": ts_iso,
            "device_id": log.device_id,
            "voltage": log.voltage,
            "current": log.current,
            "power_reported": log.power_reported,
            "power_expected": log.power_expected,
            "temperature": log.temperature,
            "humidity": log.humidity,
            "ai_status": log.ai_status,
            "ai_reason": log.ai_reason,
            "session_energy_kwh": log.session_energy_kwh,
            "session_co2_kg": log.session_co2_kg,
            "session_carbon_credits": log.session_carbon_credits,
            "session_reading_count": log.session_reading_count,
            "source": log.source,
        })
    return {"total": len(out), "logs": out}


@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
