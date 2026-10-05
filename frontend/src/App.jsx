import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import DashboardView from './components/DashboardView';
import AIVerificationView from './components/AIVerificationView';
import CertificateView from './components/CertificateView';
import MarketplaceView from './components/MarketplaceView';
import PredictionLogsView from './components/PredictionLogsView';
import { generateSeedData, generateNextPacket, initialSummary } from './utils/mockDataGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isStreaming, setIsStreaming] = useState(true);
  const [state, setState] = useState(() => ({ logs: generateSeedData(80), summary: initialSummary }));
  const [forceAnomaly, setForceAnomaly] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [ownedCredits, setOwnedCredits] = useState([]);
  const [retiredCredits, setRetiredCredits] = useState([]);
  const [toast, setToast] = useState('');
  const notify = message => setToast(message);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 4000); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => {
    if (!isStreaming) return;
    const timer = setInterval(() => {
      setState(previous => {
        const packet = generateNextPacket(previous.logs[0], forceAnomaly);
        const verified = packet.status !== 'ANOMALY';
        const energy = previous.summary.total_energy_kwh + (verified ? packet.power / 1000 * 1.5 / 3600 : 0);
        const summary = { ...previous.summary, total_energy_kwh: energy, total_co2_reduced_kg: energy * .82, total_carbon_credits: energy * .82 / 1000, total_readings: previous.summary.total_readings + 1, verified_readings: previous.summary.verified_readings + Number(verified), anomaly_readings: previous.summary.anomaly_readings + Number(!verified) };
        return { summary, logs: [{ ...packet, energy_kwh: energy, co2_kg: energy * .82, carbon_credits: energy * .82 / 1000 }, ...previous.logs].slice(0, 200) };
      });
      setForceAnomaly(false);
    }, 1500);
    return () => clearInterval(timer);
  }, [isStreaming, forceAnomaly]);
  const mint = () => {
    setCertificates(items => [{ id: `RCC-DEMO-${Date.now().toString().slice(-7)}`, energy: state.summary.total_energy_kwh, credits: state.summary.total_carbon_credits, timestamp: new Date().toISOString() }, ...items]);
    setActiveTab('certificates'); notify('Demo certificate created and added to your library.');
  };
  return <div className="app-shell">
    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isStreaming={isStreaming} />
    <div className="workspace"><TopNav activeTab={activeTab} isStreaming={isStreaming} onToggleStreaming={() => setIsStreaming(value => !value)} />
      <main className="main-content">
        {activeTab === 'dashboard' && <DashboardView latestPacket={state.logs[0]} summary={state.summary} packetLogs={state.logs} onMintCert={mint} setActiveTab={setActiveTab} isStreaming={isStreaming} />}
        {activeTab === 'ai' && <AIVerificationView summary={state.summary} packetLogs={state.logs} onTriggerAnomaly={() => { setForceAnomaly(true); setIsStreaming(true); notify('Test anomaly queued for the next telemetry update.'); }} />}
        {activeTab === 'certificates' && <CertificateView certificates={certificates} summary={state.summary} onMintCert={mint} notify={notify} />}
        {activeTab === 'marketplace' && <MarketplaceView notify={notify} isStreaming={isStreaming} owned={ownedCredits} setOwned={setOwnedCredits} retired={retiredCredits} setRetired={setRetiredCredits} />}
        {activeTab === 'prediction-logs' && <PredictionLogsView packetLogs={state.logs} />}
      </main><footer className="workspace-footer"><span>RenewCred workspace</span><span>Simulated data · Updates every 1.5 seconds</span></footer>
    </div>{toast && <div className="toast" role="status">{toast}</div>}
  </div>;
}


