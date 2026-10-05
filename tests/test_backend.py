"""Offline release checks with an isolated temporary SQLite database."""
import os
import tempfile
import unittest
from unittest.mock import patch

_temp = tempfile.TemporaryDirectory(prefix="renewcred-tests-")
os.environ["RENEWCRED_DATABASE_URL"] = "sqlite:///" + os.path.join(_temp.name, "test.db").replace("\\", "/")
os.environ["OPENROUTER_API_KEY"] = ""

from fastapi.testclient import TestClient
import ai_verifier
import database
from carbon_engine import calculate_carbon_offset, create_certificate_record
from main import app


class CalculationTests(unittest.TestCase):
    def test_offset_units(self):
        result = calculate_carbon_offset(1000)
        self.assertEqual(result["co2_reduced_kg"], 820)
        self.assertEqual(result["carbon_credits"], 0.82)

    def test_certificate_digest_is_present(self):
        record = create_certificate_record("TEST-NODE", 10)
        self.assertEqual(len(record["certificate_hash"]), 66)
        self.assertEqual(record["blockchain_status"], "PENDING")

    def test_offline_normal_does_not_call_cloud(self):
        with patch("ai_verifier.requests.post") as post:
            expected, status, reason, confidence = ai_verifier.verify_telemetry(12, 2, 24)
        self.assertEqual((expected, status), (24, "NORMAL"))
        self.assertIn("no cloud provider configured", reason)
        post.assert_not_called()

    def test_moderate_and_severe_mismatch(self):
        self.assertEqual(ai_verifier.verify_telemetry(12, 2, 30)[1], "SUSPECT")
        self.assertEqual(ai_verifier.verify_telemetry(12, 2, 48)[1], "ANOMALY")

    def test_faults_and_zero_generation(self):
        self.assertEqual(ai_verifier.verify_telemetry(-1, 2, -2)[1], "ANOMALY")
        self.assertEqual(ai_verifier.verify_telemetry(31, 2, 62)[1], "ANOMALY")
        self.assertEqual(ai_verifier.verify_telemetry(0, 0, 0)[1], "NORMAL")
        self.assertEqual(ai_verifier.verify_telemetry(0, 0, 10)[1], "ANOMALY")

    def test_cloud_failure_keeps_local_decision(self):
        with patch.object(ai_verifier, "OPENROUTER_API_KEY", "test-only-placeholder"), patch("ai_verifier.requests.post", side_effect=RuntimeError("simulated outage")):
            self.assertEqual(ai_verifier.verify_telemetry(12, 2, 24)[1], "NORMAL")

    def test_configuration_status_is_not_a_connectivity_claim(self):
        status = ai_verifier.check_cloud_ai_api_key()
        self.assertFalse(status["active"])
        self.assertFalse(status["blockchain_signing"])
        self.assertNotIn("key_snippet", status)


class ApiTests(unittest.TestCase):
    def setUp(self):
        database.Base.metadata.drop_all(database.engine)
        database.Base.metadata.create_all(database.engine)
        self.client = TestClient(app)

    def tearDown(self):
        self.client.close()

    def ingest(self, power=24):
        response = self.client.post("/api/sensor-data", json={"device_id": "TEST-NODE", "temperature": 29.4, "humidity": 58, "voltage": 12, "current": 2, "power": power})
        self.assertEqual(response.status_code, 200)
        return response.json()

    def test_ingestion_history_and_prediction(self):
        self.assertEqual(self.client.get("/api/latest").status_code, 404)
        reading = self.ingest()
        self.assertEqual(reading["status"], "NORMAL")
        self.assertEqual(self.client.get("/api/history?device_id=TEST-NODE").json()[0]["id"], reading["id"])
        logs = self.client.get("/api/prediction-logs?device_id=TEST-NODE").json()
        self.assertEqual(logs["total"], 1)
        self.assertEqual(logs["logs"][0]["ai_status"], "NORMAL")

    def test_flagged_power_is_excluded_from_energy(self):
        self.ingest()
        summary = self.client.get("/api/carbon").json()
        self.ingest(48)
        flagged = self.client.get("/api/carbon").json()
        self.assertEqual(flagged["total_energy_kwh"], summary["total_energy_kwh"])
        self.assertEqual(flagged["anomaly_readings"], 1)

    def test_demo_mint_pdf_and_retirement(self):
        self.ingest()
        response = self.client.post("/api/carbon/mint", json={"device_id":"TEST-NODE", "energy_kwh":10})
        self.assertEqual(response.status_code,200)
        cert_id = response.json()["certificate"]["certificate_id"]
        pdf = self.client.get(f"/api/certificates/{cert_id}/download")
        self.assertEqual(pdf.status_code,200)
        self.assertTrue(pdf.content.startswith(b"%PDF-"))
        retired = self.client.post("/api/marketplace/retire", json={"certificate_id":cert_id,"owner_wallet":"demo-owner","retirement_reason":"Unit test"})
        self.assertEqual(retired.status_code,200)
        self.assertTrue(self.client.get(f"/api/certificates/{cert_id}").json()["retired"])

    def test_marketplace_demo_purchase(self):
        listings = self.client.get("/api/marketplace/listings").json()
        self.assertEqual(len(listings),2)
        response = self.client.post("/api/marketplace/buy",json={"listing_id":listings[0]["id"],"buyer_wallet":"demo-buyer"})
        self.assertEqual(response.status_code,200)
        self.assertEqual(len(self.client.get("/api/marketplace/listings").json()),1)

    def test_websocket_broadcast(self):
        with self.client.websocket_connect("/ws/live") as socket:
            reading = self.ingest()
            message = socket.receive_json()
            self.assertEqual(message["type"],"NEW_READING")
            self.assertEqual(message["data"]["id"],reading["id"])


def tearDownModule():
    database.engine.dispose()
    _temp.cleanup()


if __name__ == "__main__":
    unittest.main()
