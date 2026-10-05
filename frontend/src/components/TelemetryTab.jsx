import React from 'react';
import { Sparkles, Thermometer, Zap, Sprout, Activity, TrendingUp, Terminal } from 'lucide-react';

export default function TelemetryTab({ latestPacket, summary, packetLogs, onMintCert }) {
  const p = latestPacket || {
    temperature: 29.4,
    humidity: 61.2,
    voltage: 12.5,
    current: 1.8,
    power: 22.5,
    expected_power: 22.5,
    status: 'NORMAL',
  };

  const s = summary || {
    total_energy_kwh: 0.0225,
    total_co2_reduced_kg: 0.0185,
    total_carbon_credits: 0.0000185,
  };

  return (
    <div className="space-y-8">
      
      {/* Top KPI Header Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="panel-card panel-card-hover rounded-2xl p-5 border-l-4 border-l-amber-500">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Solar Power Output</div>
          <div className="text-3xl font-black text-white mt-1 font-mono tracking-tight">
            {p.power.toFixed(1)} <span className="text-xs font-sans font-semibold text-amber-400">W</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cross-check: {p.expected_power.toFixed(1)} W</div>
        </div>

        <div className="panel-card panel-card-hover rounded-2xl p-5 border-l-4 border-l-blue-500">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cumulative Clean Energy</div>
          <div className="text-3xl font-black text-white mt-1 font-mono tracking-tight">
            {s.total_energy_kwh.toFixed(4)} <span className="text-xs font-sans font-semibold text-blue-400">kWh</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">From Node ESP32_001</div>
        </div>

        <div className="panel-card panel-card-hover rounded-2xl p-5 border-l-4 border-l-emerald-500">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avoided CO₂ Emissions</div>
          <div className="text-3xl font-black text-emerald-400 mt-1 font-mono tracking-tight">
            {s.total_co2_reduced_kg.toFixed(4)} <span className="text-xs font-sans font-semibold text-emerald-300">kg</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Grid Factor: 0.82 kg/kWh</div>
        </div>

        <div className="panel-card panel-card-hover rounded-2xl p-5 border-l-4 border-l-purple-500">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Carbon Credits Earned</div>
          <div className="text-3xl font-black text-purple-300 mt-1 font-mono tracking-tight">
            {s.total_carbon_credits.toFixed(7)}
          </div>
          <div className="text-[11px] text-purple-400/80 mt-1">1 Credit = 1000 kg CO₂e</div>
        </div>

      </div>

      {/* Banner */}
      <div className="panel-card rounded-3xl p-8 border border-emerald-500/20 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot"></span> React Web3 IoT Pipeline
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Live Sensor Telemetry Ingestion & Verification
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Raw packets are ingested from ESP32, cross-verified by AI physical law validation ($P = V \times I$), and minted as verified digital carbon credits on Polygon blockchain.
          </p>
        </div>

        <button
          onClick={onMintCert}
          className="px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition duration-300 cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 mr-2 inline text-slate-950" />
          Mint Digital Certificate
        </button>
      </div>

      {/* 3 Detailed Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1: Environment */}
        <div className="panel-card panel-card-hover rounded-3xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">Environment</h3>
                <p className="text-[11px] text-slate-400">DHT22 Micro Sensor</p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                p.status === 'ANOMALY'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {p.status === 'ANOMALY' ? '⚠ ANOMALY' : '✓ NORMAL'}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Temperature</span>
                <span className="font-mono font-bold text-amber-400">{p.temperature.toFixed(1)} °C</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((p.temperature / 50) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Humidity</span>
                <span className="font-mono font-bold text-cyan-400">{p.humidity ? p.humidity.toFixed(1) : '61.2'} %</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${p.humidity || 61.2}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Energy */}
        <div className="panel-card panel-card-hover rounded-3xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">Electrical Sensing</h3>
                <p className="text-[11px] text-slate-400">ACS712 Sensor</p>
              </div>
            </div>
            <span className="font-mono text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">12V DC</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Voltage</div>
              <div className="text-base font-mono font-bold text-white mt-0.5">
                {p.voltage.toFixed(2)} <span className="text-xs text-blue-400">V</span>
              </div>
            </div>

            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Current</div>
              <div className="text-base font-mono font-bold text-white mt-0.5">
                {p.current.toFixed(2)} <span className="text-xs text-blue-400">A</span>
              </div>
            </div>

            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Power Output</div>
              <div className="text-base font-mono font-bold text-amber-400 mt-0.5">
                {p.power.toFixed(1)} <span className="text-xs text-slate-400">W</span>
              </div>
            </div>

            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Total Energy</div>
              <div className="text-base font-mono font-bold text-emerald-400 mt-0.5">
                {s.total_energy_kwh.toFixed(4)} <span className="text-xs text-slate-400">kWh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Carbon */}
        <div className="panel-card panel-card-hover rounded-3xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">Carbon Accounting</h3>
                <p className="text-[11px] text-slate-400">Module 5 Engine</p>
              </div>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              0.82 kg/kWh
            </span>
          </div>

          <div className="mt-6 space-y-3">
            <div className="bg-gradient-to-br from-emerald-950/40 to-slate-950 p-3.5 rounded-xl border border-emerald-500/20">
              <div className="text-[10px] uppercase font-bold text-emerald-400">CO₂ Avoided Emissions</div>
              <div className="text-2xl font-black text-white mt-0.5">
                {s.total_co2_reduced_kg.toFixed(4)} <span className="text-xs font-normal text-emerald-400">kg</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-950/40 to-slate-950 p-3.5 rounded-xl border border-teal-500/20">
              <div className="text-[10px] uppercase font-bold text-teal-400">Carbon Credits Earned</div>
              <div className="text-2xl font-black text-white mt-0.5">
                {s.total_carbon_credits.toFixed(7)} <span className="text-xs font-normal text-teal-400">credits</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Packet Stream Log Table */}
      <div className="panel-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" /> Real-Time Packet Stream
            </h3>
            <p className="text-xs text-slate-400">Live HTTP POST telemetry evaluated by AI dMRV Engine</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950 custom-scrollbar max-h-72">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 uppercase sticky top-0 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Node</th>
                <th className="px-4 py-3">Temp / Hum</th>
                <th className="px-4 py-3">Voltage / Current</th>
                <th className="px-4 py-3">Reported Power</th>
                <th className="px-4 py-3">Expected (V×I)</th>
                <th className="px-4 py-3">AI Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {packetLogs.map((item, idx) => (
                <tr key={idx} className={item.status === 'ANOMALY' ? 'bg-rose-950/30 text-rose-200' : 'hover:bg-slate-900/50'}>
                  <td className="px-4 py-2.5 text-slate-400">{new Date(item.timestamp || Date.now()).toLocaleTimeString()}</td>
                  <td className="px-4 py-2.5 text-emerald-400 font-bold">{item.device_id}</td>
                  <td className="px-4 py-2.5">{item.temperature.toFixed(1)}°C / {item.humidity ? item.humidity.toFixed(1) : '61.2'}%</td>
                  <td className="px-4 py-2.5">{item.voltage.toFixed(1)}V / {item.current.toFixed(2)}A</td>
                  <td className="px-4 py-2.5 font-bold">{item.power.toFixed(1)} W</td>
                  <td className="px-4 py-2.5 text-slate-400">{item.expected_power.toFixed(1)} W</td>
                  <td className="px-4 py-2.5">
                    {item.status === 'ANOMALY' ? (
                      <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded font-bold">
                        ⚠ ANOMALY
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded font-bold">
                        ✓ VERIFIED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
