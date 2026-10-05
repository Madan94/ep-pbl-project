import React from 'react';
import { Leaf, Activity, Cpu, Award, ShoppingBag, Wallet } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, walletAddress, onConnectWallet }) {
  return (
    <header className="border-b border-slate-800/80 bg-[#080c18]/90 backdrop-blur-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3.5 cursor-pointer" onClick={() => setActiveTab('telemetry')}>
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl blur-sm opacity-70"></div>
            <div className="relative w-11 h-11 rounded-2xl bg-slate-950 flex items-center justify-center border border-emerald-500/40">
              <Leaf className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">RenewCred</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider">
                React Web3 App
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">IoT Sensor Telemetry • AI dMRV • Polygon Smart Contract</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center p-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'telemetry'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Activity className="w-4 h-4" /> Live Telemetry
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-lg shadow-teal-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Cpu className="w-4 h-4" /> AI dMRV Center
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'certificates'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Award className="w-4 h-4" /> Digital Certificates
          </button>

          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'marketplace'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Carbon Marketplace
          </button>
        </nav>

        {/* Web3 Wallet Connect Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onConnectWallet}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-xs text-purple-300 font-bold transition shadow-sm cursor-pointer"
          >
            <Wallet className="w-4 h-4 text-purple-400" />
            <span className="font-mono">{walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
