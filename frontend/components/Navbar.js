'use client';

import { Leaf, Activity, Cpu, Award, ShoppingBag } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="border-b border-slate-800/80 bg-[#0f172a]/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('telemetry')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Leaf className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              RenewCred <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">Next.js App</span>
            </h1>
            <p className="text-xs text-slate-400">ESP32 IoT • AI dMRV • Polygon Smart Contract</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex space-x-1 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
              activeTab === 'telemetry' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" /> IoT Live Telemetry
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
              activeTab === 'ai' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-400" /> AI Verification
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
              activeTab === 'certificates' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" /> Digital Certificates
          </button>

          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
              activeTab === 'marketplace' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-violet-400" /> Marketplace
          </button>
        </nav>

        {/* Status Badges */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-xs bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            <span className="text-slate-400">Chain:</span>
            <span className="font-mono font-semibold text-purple-400">Polygon Amoy</span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Next.js Live Stream</span>
          </div>
        </div>

      </div>
    </header>
  );
}
