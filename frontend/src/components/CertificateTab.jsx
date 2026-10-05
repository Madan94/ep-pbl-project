import React from 'react';
import { Award, FileText, Download } from 'lucide-react';

export default function CertificateTab() {
  const handleDownloadPDF = () => {
    window.location.href = 'http://localhost:8000/api/certificates/RCC-2026-88102/download';
  };

  const handlePrintPDF = () => {
    window.open('http://localhost:8000/api/certificates/RCC-2026-88102/render', '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="panel-card rounded-3xl p-8 border-amber-900/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" /> Module 5: Digital Carbon Certificates
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Cryptographically signed certificates generated following AI verification with unique SHA-256 digests.
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDownloadPDF}
            className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-2xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-4 h-4" /> Download PDF File (.pdf)
          </button>

          <button
            onClick={handlePrintPDF}
            className="px-5 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-2xl transition flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4" /> Print / Save PDF View
          </button>
        </div>
      </div>

      <div className="panel-card rounded-3xl p-8 max-w-3xl mx-auto border-emerald-500/30 relative shadow-2xl">
        <div className="text-center border-b border-slate-800 pb-6 mb-6">
          <div className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            🌱 RENEWCRED
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mt-1">
            DIGITAL CARBON CERTIFICATE
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 font-mono text-sm">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-500 uppercase font-sans font-bold">Certificate ID</div>
            <div className="text-white font-bold mt-1">RCC-2026-88102</div>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-500 uppercase font-sans font-bold">Project ID</div>
            <div className="text-white font-bold mt-1">SOLAR-ESP32-001</div>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-500 uppercase font-sans font-bold">Clean Energy Generated</div>
            <div className="text-emerald-400 font-bold mt-1">125.40 kWh</div>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-500 uppercase font-sans font-bold">CO₂ Reduced</div>
            <div className="text-emerald-400 font-bold mt-1">102.83 kg</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-slate-950 p-5 rounded-2xl border border-emerald-500/30 mb-6 text-center">
          <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Carbon Credits Issued</div>
          <div className="text-3xl font-black text-white mt-1">0.10283</div>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 text-center leading-relaxed">
          <strong>⚠️ COMPLIANCE NOTICE:</strong> Prototype certificate generated for academic project demonstration. Not an independently certified Verra/Gold Standard carbon credit.
        </div>
      </div>
    </div>
  );
}
