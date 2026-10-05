"""
RenewCred - Module 3: Database & Persistence Layer
SQLite / PostgreSQL ORM schemas for devices, sensor readings, carbon records,
digital certificates, and marketplace listings.
"""

from datetime import datetime, timezone
import json
import os
from uuid import uuid4

from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text, create_engine
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

DB_PATH = os.path.join(os.path.dirname(__file__), "renewcred.db")
SQLALCHEMY_DATABASE_URL = os.getenv("RENEWCRED_DATABASE_URL", f"sqlite:///{DB_PATH}")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite:") else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class DeviceDB(Base):
    __tablename__ = "devices"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    device_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, default="Solar ESP32 Node")
    location = Column(String, default="Roof Solar Testbed")
    status = Column(String, default="ACTIVE")
    last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    readings = relationship("SensorReadingDB", back_populates="device")


class SensorReadingDB(Base):
    __tablename__ = "sensor_readings"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    device_id = Column(String, ForeignKey("devices.device_id"), nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=True)
    voltage = Column(Float, nullable=False)
    current = Column(Float, nullable=False)
    power = Column(Float, nullable=False)
    expected_power = Column(Float, nullable=False)
    status = Column(String, default="NORMAL")  # "NORMAL", "ANOMALY", "SUSPECT"
    anomaly_reason = Column(String, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    device = relationship("DeviceDB", back_populates="readings")


class CarbonRecordDB(Base):
    __tablename__ = "carbon_records"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    certificate_id = Column(String, unique=True, index=True, nullable=False)
    device_id = Column(String, nullable=False)
    project_id = Column(String, default="SOLAR-ESP32-001")
    energy_kwh = Column(Float, nullable=False)
    emission_factor = Column(Float, default=0.82)
    co2_reduced_kg = Column(Float, nullable=False)
    carbon_credits = Column(Float, nullable=False)
    certificate_hash = Column(String, nullable=False)
    tx_hash = Column(String, nullable=True)
    verification_status = Column(String, default="AI VERIFIED ✓")
    blockchain_status = Column(String, default="PENDING")
    retired = Column(Boolean, default=False)
    retirement_reason = Column(String, nullable=True)
    retired_at = Column(DateTime, nullable=True)
    owner_wallet = Column(String, default="0x71C7656EC7ab88b098defB751B7401B5f6d8976F")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)


class MarketplaceListingDB(Base):
    __tablename__ = "marketplace_listings"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    certificate_id = Column(String, ForeignKey("carbon_records.certificate_id"), nullable=False)
    seller_wallet = Column(String, nullable=False)
    project_name = Column(String, default="Solar Energy Generation")
    credits_amount = Column(Float, nullable=False)
    co2_kg = Column(Float, nullable=False)
    price_per_credit_inr = Column(Float, default=1250.0)
    status = Column(String, default="ACTIVE")  # ACTIVE, SOLD, CANCELLED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class PredictionLogDB(Base):
    """
    Stores every live telemetry prediction snapshot for review.
    Each row captures: timestamp, device, sensor readings,
    AI verification verdict, and accumulated carbon metrics.
    """
    __tablename__ = "prediction_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    device_id = Column(String, nullable=False, index=True)

    # Sensor readings
    voltage = Column(Float, nullable=True)
    current = Column(Float, nullable=True)
    power_reported = Column(Float, nullable=True)
    power_expected = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)

    # AI verdict
    ai_status = Column(String, default="NORMAL")    # NORMAL / ANOMALY
    ai_reason = Column(String, nullable=True)

    # Session carbon snapshot at time of prediction
    session_energy_kwh = Column(Float, nullable=True)
    session_co2_kg = Column(Float, nullable=True)
    session_carbon_credits = Column(Float, nullable=True)
    session_reading_count = Column(Integer, nullable=True)

    # Source: LIVE, MINTED
    source = Column(String, default="LIVE")


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
