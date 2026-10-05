import React from 'react';
import { Cpu, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AIVerificationTab({ summary }) {
  const s = summary || { total_readings: 15, verified_readings: 12, anomaly_readings: 3 };

  return (
    <div className="space-y-8">
      <div className="panel-card rounded-3xl p-8 border-cyan-900/30">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Cpu className="w-6 h-6 text-cyan-400" /> Module 4: AI Telemetry Verification (dMRV Engine)
        </h2>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          Evaluates raw ESP32 telemetry against physical conservation laws ($P = V \times I$) and flags anomalies before data is admitted into the carbon engine or smart contract.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="panel-card panel-card-hover rounded-3xl p-6 text-center">
          <div className="text-xs uppercase text-slate-400 font-bold tracking-wider">Total Evaluated Packets</div>
          <div className="text-4xl font-black text-white mt-2">{s.total_readings}</div>
          <div className="text-xs text-slate-500 mt-1">Processed by AI Verification Layer</div>
        </div>

        <div className="panel-card panel-card-hover rounded-3xl p-6 text-center">
          <div className="text-xs uppercase text-emerald-400 font-bold tracking-wider">AI Verified (Passed)</div>
          <div className="text-4xl font-black text-emerald-400 mt-2">{s.verified_readings}</div>
          <div className="text-xs text-emerald-500/80 mt-1">Passed Physical Law Cross-Checks</div>
        </div>

        <div className="panel-card panel-card-hover rounded-3xl p-6 text-center">
          <div className="text-xs uppercase text-rose-400 font-bold tracking-wider">Anomalies Quarantined</div>
          <div className="text-4xl font-black text-rose-400 mt-2">{s.anomaly_readings}</div>
          <div className="text-xs text-rose-500/80 mt-1">Blocked from Smart Contract Minting</div>
        </div>
      </div>
    </div>
  );
}
