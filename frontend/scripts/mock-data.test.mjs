import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSeedData, generateNextPacket, initialSummary } from '../src/utils/mockDataGenerator.js';

test('seed history is newest first across four simulated nodes', () => {
  const rows = generateSeedData(80);
  assert.equal(rows.length, 80);
  assert.equal(new Set(rows.map(row => row.device_id)).size, 4);
  assert.equal(new Set(rows.map(row => row.id)).size, 80);
  for (let i = 1; i < rows.length; i++) {
    assert.ok(Date.parse(rows[i - 1].timestamp) > Date.parse(rows[i].timestamp));
    assert.ok(rows[i - 1].energy_kwh >= rows[i].energy_kwh);
  }
});

test('normal packets obey physical power and IDs do not depend on hidden state', () => {
  const previous = generateSeedData(80)[0];
  const next = generateNextPacket(previous);
  assert.equal(next.expected_power, Number((next.voltage * next.current).toFixed(2)));
  assert.equal(next.power, next.expected_power);
  assert.equal(next.status, 'NORMAL');
  assert.equal(next.id, previous.id + 1);
  assert.equal(generateNextPacket(previous).id, next.id);
});

test('forced and scheduled anomalies report a physical mismatch', () => {
  const previous = generateSeedData(80)[0];
  assert.equal(generateNextPacket(previous, true).status, 'ANOMALY');
  const scheduled = generateNextPacket({id: 1046});
  assert.equal(scheduled.status, 'ANOMALY');
  assert.ok(scheduled.power > scheduled.expected_power * 1.8);
});

test('summary and seeded carbon units remain internally consistent', () => {
  assert.equal(initialSummary.total_readings, initialSummary.verified_readings + initialSummary.anomaly_readings);
  assert.equal(initialSummary.total_co2_reduced_kg, initialSummary.total_energy_kwh * 0.82);
  assert.equal(initialSummary.total_carbon_credits, initialSummary.total_co2_reduced_kg / 1000);
  const latest = generateSeedData(80)[0];
  assert.equal(latest.energy_kwh, initialSummary.total_energy_kwh);
  assert.equal(latest.co2_kg, latest.energy_kwh * 0.82);
});
