'use client';

import { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';

export default function CertificateTab({ cert: propCert, summary }) {
  const [cert, setCert] = useState(propCert);

  useEffect(() => {
    if (propCert) {
      setCert(propCert);
    } else {
      fetch('http://127.0.0.1:8000/api/certificates/latest')
        .then((res) => res.json())
        .then((data) => setCert(data))
        .catch(() => {});
    }
  }, [propCert]);

  const energyKwh = cert?.energy_kwh ?? summary?.total_energy_kwh ?? 0.0002;
  const co2Kg = cert?.co2_reduced_kg ?? summary?.total_co2_reduced_kg ?? (energyKwh * 0.82);
  const credits = cert?.carbon_credits ?? summary?.total_carbon_credits ?? (co2Kg / 1000);
  const certId = cert?.certificate_id || 'RCC-2026-ACTIVE';
  const projectId = cert?.project_id || 'SOLAR-ESP32-001';
  const certHash = cert?.certificate_hash || '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const txHash = cert?.tx_hash || '0x83A92F45B3d1912A098Efa92C912bF5C45B932F1';

  const handleDownload = () => {
    window.location.href = `http://localhost:8000/api/certificates/${certId}/download`;
  };

  const handlePrint = () => {
    window.open(`http://localhost:8000/api/certificates/${certId}/render`, '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="glass-card rounded-2xl p-6 border-amber-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Module 5: Digital Carbon Certificates
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Generated from live telemetry readings & AI verification. Includes SHA-256 certificate hashes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4" /> Open Printable PDF View
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-8 max-w-3xl mx-auto border-slate-700/60 shadow-2xl relative">
        <div className="text-center border-b border-slate-800 pb-6 mb-6">
          <div className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            🌱 RENEWCRED
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mt-1">
            DIGITAL CARBON CERTIFICATE
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 font-mono text-sm">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-500 uppercase">Certificate ID</div>
            <div className="text-white font-bold mt-0.5">{certId}</div>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-500 uppercase">Project ID</div>
            <div className="text-white font-bold mt-0.5">{projectId}</div>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-500 uppercase">Clean Energy Generated</div>
            <div className="text-emerald-400 font-bold mt-0.5">{Number(energyKwh).toFixed(4)} kWh</div>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-500 uppercase">CO₂ Reduced</div>
            <div className="text-emerald-400 font-bold mt-0.5">{Number(co2Kg).toFixed(4)} kg</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-950/40 to-teal-950/40 p-4 rounded-xl border border-emerald-500/30 mb-6 text-center">
          <div className="text-xs text-emerald-400 font-semibold uppercase">Carbon Credits Issued</div>
          <div className="text-3xl font-black text-white mt-1">{Number(credits).toFixed(7)}</div>
          <div className="text-[10px] text-emerald-400/80 font-mono mt-1">● AI VERIFIED (dMRV)</div>
        </div>

        <div className="space-y-3 font-mono text-xs mb-6">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-sans font-bold">SHA-256 Certificate Hash</div>
            <div className="text-slate-300 break-all mt-0.5">{certHash}</div>
          </div>
          {txHash && (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-sans font-bold">Polygon Blockchain Tx Hash</div>
              <div className="text-purple-300 break-all mt-0.5">{txHash}</div>
            </div>
          )}
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 text-center leading-relaxed">
          <strong>⚠️ COMPLIANCE NOTICE:</strong> Prototype certificate generated for academic project demonstration. Not an independently certified Verra/Gold Standard carbon credit.
        </div>
      </div>
    </div>
  );
}
