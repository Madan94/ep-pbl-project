'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function MarketplaceTab() {
  const [listings, setListings] = useState([
    { id: '1', certificate_id: 'RCC-2026-88102', project_name: 'Rooftop Solar Generation', credits_amount: 0.10283, co2_kg: 102.83, price_per_credit_inr: 1250.0, total_price_inr: 128.53 },
    { id: '2', certificate_id: 'RCC-2026-44019', project_name: 'EV Clean Charging Station', credits_amount: 0.25010, co2_kg: 250.10, price_per_credit_inr: 1400.0, total_price_inr: 350.14 }
  ]);

  const buyCredit = (id) => {
    alert('Credit purchased successfully!');
    setListings(listings.filter(l => l.id !== id));
  };

  const retireCredit = () => {
    const reason = prompt('Enter retirement reason:', 'Offsetting Annual Scope 2 Emissions');
    if (reason) alert('Carbon credit permanently retired on Polygon blockchain!');
  };

  return (
    <div className="space-y-8">
      <div className="glass-card rounded-2xl p-6 border-violet-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Module 6 & 7: Carbon Marketplace & Credit Registry
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Trade AI-verified carbon credits on Polygon Amoy smart contract.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <span className="text-slate-400">Wallet Balance:</span>
          <span className="font-bold text-emerald-400 ml-1">₹ 25,000.00</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg text-slate-100">Active Marketplace Credit Listings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.map(item => (
            <div key={item.id} className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-mono text-xs text-emerald-400 font-bold">{item.certificate_id}</span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">Polygon Verified</span>
              </div>
              <div>
                <h4 className="font-bold text-white text-base">{item.project_name}</h4>
                <div className="text-xs text-slate-400 mt-1">{item.co2_kg.toFixed(2)} kg CO₂ Avoided</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500 uppercase">Available Credits</div>
                  <div className="text-lg font-extrabold text-white">{item.credits_amount}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-500 uppercase">Price per Credit</div>
                  <div className="text-lg font-extrabold text-emerald-400">₹ {item.price_per_credit_inr}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => buyCredit(item.id)} className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition">
                  BUY CREDIT (₹ {item.total_price_inr})
                </button>
                <button onClick={() => window.open(`http://localhost:8000/api/certificates/${item.certificate_id}/render`, '_blank')} className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl border border-slate-700 transition">
                  VIEW CERTIFICATE
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-bold text-lg text-slate-100 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> My Portfolio & Credit Retirement
        </h3>
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="font-bold text-white text-sm">RCC-2026-88102 (Rooftop Solar Project)</div>
            <div className="text-xs text-slate-400 mt-0.5">0.1028 Carbon Credits • Verified ✓</div>
          </div>
          <button onClick={retireCredit} className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold rounded-xl transition">
            RETIRE CREDIT
          </button>
        </div>
      </div>
    </div>
  );
}
