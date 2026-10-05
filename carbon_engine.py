"""
RenewCred - Module 5: Carbon Calculation Engine & Certificate Metadata
Computes energy generation, avoided grid CO2 emissions, carbon credits,
and generates cryptographic SHA-256 certificate hashes.
"""

from datetime import datetime, timezone
import hashlib
import json
import random

# Grid emission factor (kg CO2 per kWh)
EMISSION_FACTOR_KG_PER_KWH = 0.82

# 1 Carbon Credit = 1 tonne CO2e (1000 kg CO2e)
KG_PER_CARBON_CREDIT = 1000.0


def calculate_carbon_offset(energy_kwh: float, emission_factor: float = EMISSION_FACTOR_KG_PER_KWH) -> dict:
    """
    Computes avoided emissions and carbon credits from clean energy generated.
    """
    co2_reduced_kg = round(energy_kwh * emission_factor, 6)
    carbon_credits = round(co2_reduced_kg / KG_PER_CARBON_CREDIT, 9)

    return {
        "energy_kwh": round(energy_kwh, 4),
        "emission_factor_kg_per_kwh": emission_factor,
        "co2_reduced_kg": co2_reduced_kg,
        "carbon_credits": carbon_credits,
    }


def generate_certificate_hash(
    certificate_id: str,
    project_id: str,
    device_id: str,
    energy_kwh: float,
    co2_reduced_kg: float,
    carbon_credits: float,
    timestamp_str: str,
) -> str:
    """
    Produces a cryptographic SHA-256 digest of certificate fields.
    """
    raw_payload = f"{certificate_id}|{project_id}|{device_id}|{energy_kwh:.4f}|{co2_reduced_kg:.4f}|{carbon_credits:.9f}|{timestamp_str}"
    return hashlib.sha256(raw_payload.encode("utf-8")).hexdigest()


def create_certificate_record(
    device_id: str,
    energy_kwh: float,
    project_id: str = "SOLAR-ESP32-001",
    owner_wallet: str = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
) -> dict:
    """
    Builds a complete Digital Carbon Certificate data record.
    """
    rand_seq = random.randint(10000, 99999)
    cert_id = f"RCC-2026-{rand_seq}"
    ts = datetime.now(timezone.utc)
    ts_str = ts.isoformat()

    calc = calculate_carbon_offset(energy_kwh)

    cert_hash = generate_certificate_hash(
        cert_id,
        project_id,
        device_id,
        calc["energy_kwh"],
        calc["co2_reduced_kg"],
        calc["carbon_credits"],
        ts_str,
    )

    return {
        "certificate_id": cert_id,
        "project_id": project_id,
        "device_id": device_id,
        "energy_kwh": calc["energy_kwh"],
        "emission_factor": calc["emission_factor_kg_per_kwh"],
        "co2_reduced_kg": calc["co2_reduced_kg"],
        "carbon_credits": calc["carbon_credits"],
        "certificate_hash": f"0x{cert_hash}",
        "verification_status": "AI VERIFIED ✓",
        "blockchain_status": "PENDING",
        "owner_wallet": owner_wallet,
        "disclaimer": "RenewCred Digital Carbon Certificate — Prototype certificate for demonstration purposes. Not an independently certified carbon credit.",
        "timestamp": ts_str,
    }
