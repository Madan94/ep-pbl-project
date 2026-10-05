'use client';

import { Sparkles, Thermometer, Zap, Sprout, Activity, TrendingUp, Terminal, RotateCcw, Cpu, ShieldCheck, Award } from 'lucide-react';

function formatLocalTime(tsStr) {
  if (!tsStr) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  let str = String(tsStr).replace(' ', 'T');
  if (!str.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(str)) {
    str += 'Z';
  }
  const d = new Date(str);
  if (isNaN(d.getTime())) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

function formatLocalDate(tsStr) {
  if (!tsStr) return new Date().toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  let str = String(tsStr).replace(' ', 'T');
  if (!str.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(str)) {
    str += 'Z';
  }
  const d = new Date(str);
  if (isNaN(d.getTime())) return new Date().toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
}

function CarbonEngineDiagram({ summary, latestPacket }) {
  const p = latestPacket || { voltage: 12.4, current: 1.85, power: 22.9, expected_power: 22.9, status: 'NORMAL' };
  const s = summary || { total_energy_kwh: 0.0325, total_co2_reduced_kg: 0.0266, total_carbon_credits: 0.0000266 };

  return (
    <div className="glass-card rounded-3xl p-6 border-emerald-500/30 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot"></span> Decarbonization Pipeline Architecture
          </div>
          <h3 className="text-xl font-black text-white tracking-tight mt-1">
            🌱 Carbon Engine & Calculation Diagram
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            End-to-End Data Lifecycle: IoT Sensing $\rightarrow$ AI Validation $\rightarrow$ Carbon Accounting $\rightarrow$ Polygon Blockchain
          </p>
        </div>

        <div className="bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800 text-right">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Session Calculation Window</div>
          <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
            {formatLocalDate(s.session_start_time)} • {formatLocalTime(s.session_start_time)} ➔ {formatLocalTime(s.session_end_time || p.timestamp)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-950/90 rounded-2xl p-4 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
              1. IoT SENSING
            </span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <h4 className="font-bold text-white text-sm">ESP32 Solar Node</h4>
          <p className="text-[11px] text-slate-400">Continuous voltage, current & power ingestion.</p>
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 font-mono text-xs space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Voltage:</span> <span className="text-amber-400 font-bold">{p.voltage.toFixed(2)} V</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Current:</span> <span class="text-amber-400 font-bold">{p.current.toFixed(2)} A</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Power:</span> <span className="text-white font-bold">{p.power.toFixed(1)} W</span>
            </div>
          </div>
          <div className="text-[10px] text-amber-400/80 font-mono">Formula: P = V × I</div>
        </div>

        <div className="bg-slate-950/90 rounded-2xl p-4 border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
              2. AI dMRV CHECK
            </span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <h4 className="font-bold text-white text-sm">Physical Law Check</h4>
          <p className="text-[11px] text-slate-400">Rejects anomalous data violating physics.</p>
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 font-mono text-xs space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Expected:</span> <span className="text-cyan-400 font-bold">{p.expected_power.toFixed(1)} W</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Verdict:</span>
              <span className={p.status === 'ANOMALY' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {p.status === 'ANOMALY' ? '⚠ ANOMALY' : '✓ VERIFIED'}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-cyan-400/80 font-mono">Rule: |P_rep - P_exp| ≤ 15%</div>
        </div>

        <div className="bg-slate-950/90 rounded-2xl p-4 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
              3. CARBON ENGINE
            </span>
            <Sprout className="w-4 h-4 text-emerald-400" />
          </div>
          <h4 className="font-bold text-white text-sm">Session Carbon Math</h4>
          <p className="text-[11px] text-slate-400">Calculates energy & avoided CO₂ emissions.</p>
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 font-mono text-xs space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Energy:</span> <span className="text-blue-400 font-bold">{s.total_energy_kwh.toFixed(4)} kWh</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>CO₂ Avoided:</span> <span className="text-emerald-400 font-bold">{s.total_co2_reduced_kg.toFixed(4)} kg</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Credits:</span> <span className="text-teal-300 font-bold">{s.total_carbon_credits.toFixed(7)}</span>
            </div>
          </div>
          <div className="text-[10px] text-emerald-400/80 font-mono">Math: CO₂ = E × 0.82 kg/kWh</div>
        </div>

        <div className="bg-slate-950/90 rounded-2xl p-4 border border-purple-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded-full">
              4. BLOCKCHAIN
            </span>
            <Award className="w-4 h-4 text-purple-300" />
          </div>
          <h4 className="font-bold text-white text-sm">Polygon Registry</h4>
          <p className="text-[11px] text-slate-400">Generates certificate & logs calculations to file.</p>
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 font-mono text-xs space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Chain:</span> <span className="text-purple-300 font-bold">Polygon Amoy</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Log File:</span> <span className="text-emerald-400 font-bold text-[10px]">Saved .json</span>
            </div>
          </div>
          <div className="text-[10px] text-purple-300/80 font-mono">Digest: SHA-256 Hash</div>
        </div>
      </div>
    </div>
  );
}

export default function TelemetryTab({ latestPacket, summary, packetLogs, onMintCert, onResetSession }) {
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
      {/* Active ESP32 Session Banner */}
      <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 pulse-dot"></span>
            ACTIVE ESP32 TELEMETRY CALCULATION SESSION
          </div>
          <div className="text-sm font-extrabold text-white flex flex-wrap items-center gap-2">
            <span>📅 Date: <span className="text-emerald-300 font-mono">{formatLocalDate(s.session_start_time)}</span></span>
            <span className="text-slate-600">•</span>
            <span>⏰ Active Time Window: <span className="text-cyan-300 font-mono">{formatLocalTime(s.session_start_time)} ➔ {formatLocalTime(s.session_end_time || p.timestamp)}</span></span>
          </div>
          <div className="text-[11px] text-slate-400">
            Saved File Log: <span className="font-mono text-emerald-400 font-bold">carbon_calculation_sessions.json</span> • Session Packets: <span className="font-bold text-white">{s.total_readings || 0}</span>
          </div>
        </div>

        {onResetSession && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onResetSession}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" /> Save Session to File & Start New Window
            </button>
          </div>
        )}
      </div>

      {/* Carbon Pipeline Architecture Diagram */}
      <CarbonEngineDiagram summary={s} latestPacket={p} />

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1: Environment */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                <Thermometer className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-100">Environment</h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                p.status === 'ANOMALY'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 anomaly-pulse'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {p.status === 'ANOMALY' ? '⚠ ANOMALY DETECTED' : '✓ NORMAL'}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Temperature</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-slate-100">{p.temperature.toFixed(1)}</span>
                <span className="text-xs text-slate-400 ml-1">°C</span>
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min((p.temperature / 50) * 100, 100)}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-slate-400">Humidity</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-slate-100">
                  {p.humidity ? p.humidity.toFixed(1) : '61.2'}
                </span>
                <span className="text-xs text-slate-400 ml-1">%</span>
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${p.humidity || 61.2}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 2: Energy */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-100">Energy</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Solar DC</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Voltage</div>
              <div className="text-xl font-bold text-slate-100 mt-1">
                {p.voltage.toFixed(2)} <span className="text-xs text-blue-400">V</span>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Current</div>
              <div className="text-xl font-bold text-slate-100 mt-1">
                {p.current.toFixed(2)} <span className="text-xs text-blue-400">A</span>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Power</div>
              <div className="text-xl font-bold text-slate-100 mt-1">
                {p.power.toFixed(1)} <span className="text-xs text-amber-400">W</span>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Session Energy</div>
              <div className="text-xl font-bold text-slate-100 mt-1">
                {s.total_energy_kwh.toFixed(4)} <span className="text-xs text-emerald-400">kWh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Carbon */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <Sprout className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-100">Carbon</h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              0.82 kg/kWh
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="bg-gradient-to-br from-emerald-950/50 to-slate-950 p-4 rounded-xl border border-emerald-500/20">
              <div className="text-xs text-emerald-400 uppercase tracking-wider font-semibold">CO₂ Reduced</div>
              <div className="text-3xl font-extrabold text-white mt-1">
                {s.total_co2_reduced_kg.toFixed(4)} <span className="text-sm font-normal text-emerald-400">kg</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-950/50 to-slate-950 p-4 rounded-xl border border-teal-500/20">
              <div className="text-xs text-teal-400 uppercase tracking-wider font-semibold">Carbon Credits</div>
              <div className="text-3xl font-extrabold text-white mt-1">
                {s.total_carbon_credits.toFixed(7)} <span className="text-sm font-normal text-teal-400">credits</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Packet Inspector Table */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-bold text-lg text-slate-100 mb-4 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" /> Real-Time Packet Stream
        </h3>

        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950 custom-scrollbar max-h-64">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 text-slate-400 uppercase sticky top-0 border-b border-slate-800">
              <tr>
                <th className="px-4 py-2.5">Time</th>
                <th className="px-4 py-2.5">Node</th>
                <th className="px-4 py-2.5">Temp/Hum</th>
                <th className="px-4 py-2.5">V / A</th>
                <th className="px-4 py-2.5">Reported P</th>
                <th className="px-4 py-2.5">Expected P</th>
                <th className="px-4 py-2.5">AI Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {packetLogs.map((item, idx) => (
                <tr
                  key={idx}
                  className={item.status === 'ANOMALY' ? 'bg-rose-950/30 text-rose-200' : 'hover:bg-slate-900/50'}
                >
                  <td className="px-4 py-2 text-slate-400">
                    {formatLocalTime(item.timestamp)}
                  </td>
                  <td className="px-4 py-2 text-emerald-400 font-semibold">{item.device_id}</td>
                  <td className="px-4 py-2">
                    {item.temperature.toFixed(1)}°C / {item.humidity ? item.humidity.toFixed(1) : '61.2'}%
                  </td>
                  <td className="px-4 py-2">
                    {item.voltage.toFixed(1)}V / {item.current.toFixed(2)}A
                  </td>
                  <td className="px-4 py-2 font-bold">{item.power.toFixed(1)}W</td>
                  <td className="px-4 py-2 text-slate-400">{item.expected_power.toFixed(1)}W</td>
                  <td className="px-4 py-2">
                    {item.status === 'ANOMALY' ? (
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded">
                        ⚠ Anomaly
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded">
                        ✓ Verified
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

