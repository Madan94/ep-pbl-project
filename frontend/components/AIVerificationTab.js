'use client';

import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function AIVerificationTab({ summary }) {
  const s = summary || { total_readings: 15, verified_readings: 12, anomaly_readings: 3 };

  return (
    <div className="space-y-8">
      <div className="glass-card rounded-2xl p-6 border-cyan-900/30">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          Module 4: AI Telemetry Verification (dMRV Engine)
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Cross-checks physical energy laws ($P = V \times I$) and flags anomalies before data is admitted into the carbon engine or smart contract.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Total Evaluated Packets</div>
          <div className="text-4xl font-extrabold text-white mt-2">{s.total_readings}</div>
          <div className="text-xs text-slate-500 mt-1">Evaluated by AI Engine</div>
        </div>

        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-xs uppercase text-emerald-400 font-semibold tracking-wider">AI Verified (Normal)</div>
          <div className="text-4xl font-extrabold text-emerald-400 mt-2">{s.verified_readings}</div>
          <div className="text-xs text-emerald-500/80 mt-1">Passed Physical Law Cross-Check</div>
        </div>

        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-xs uppercase text-rose-400 font-semibold tracking-wider">Anomalies Blocked</div>
          <div className="text-4xl font-extrabold text-rose-400 mt-2">{s.anomaly_readings}</div>
          <div className="text-xs text-rose-500/80 mt-1">Blocked from Blockchain Minting</div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-bold text-lg text-slate-100 mb-4">Detailed Anomaly Detection Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="font-semibold text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Rule 1: Power Cross-Check (P = V × I)
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Verifies reported power against physical product of voltage and current within 15% tolerance. Catches fake wattage reporting.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="font-semibold text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Rule 2: Out-Of-Bounds Detection
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ensures voltage and current do not exceed maximum hardware rating (0V–30V, 0A–10A). Rejects sensor disconnect glitches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
