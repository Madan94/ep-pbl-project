'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TelemetryTab from '@/components/TelemetryTab';
import AIVerificationTab from '@/components/AIVerificationTab';
import CertificateTab from '@/components/CertificateTab';
import MarketplaceTab from '@/components/MarketplaceTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState('telemetry');
  const [latestPacket, setLatestPacket] = useState(null);
  const [summary, setSummary] = useState(null);
  const [packetLogs, setPacketLogs] = useState([]);
  const [latestCert, setLatestCert] = useState(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//127.0.0.1:8000/ws/live`);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'NEW_READING') {
        setLatestPacket(msg.data);
        setPacketLogs(prev => [msg.data, ...prev.slice(0, 24)]);
      }
    };

    const fetchSummary = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/carbon');
        if (res.ok) setSummary(await res.json());

        const certRes = await fetch('http://127.0.0.1:8000/api/certificates/latest');
        if (certRes.ok) setLatestCert(await certRes.json());
      } catch (e) {}
    };

    fetchSummary();
    const interval = setInterval(fetchSummary, 3000);
    return () => {
      ws.close();
      clearInterval(interval);
    };
  }, []);

  const handleResetSession = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/carbon/reset-session', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(`Telemetry session saved to log file!\nNew calculation window started.`);
        const sumRes = await fetch('http://127.0.0.1:8000/api/carbon');
        if (sumRes.ok) setSummary(await sumRes.json());
      }
    } catch (e) {
      alert('Session reset failed');
    }
  };

  const handleMintCert = async () => {
    try {
      const currentEnergy = summary?.total_energy_kwh ?? 0.0002;
      const res = await fetch('http://127.0.0.1:8000/api/carbon/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: 'ESP32_001', energy_kwh: currentEnergy })
      });
      if (res.ok) {
        const data = await res.json();
        setLatestCert(data.certificate);
        alert(`Minted Digital Certificate ${data.certificate.certificate_id} for ${data.certificate.energy_kwh} kWh on Polygon Amoy Testnet!`);
        setActiveTab('certificates');
      }
    } catch (e) {
      alert('Minting failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'telemetry' && (
          <TelemetryTab
            latestPacket={latestPacket}
            summary={summary}
            packetLogs={packetLogs}
            onMintCert={handleMintCert}
            onResetSession={handleResetSession}
          />
        )}
        {activeTab === 'ai' && <AIVerificationTab summary={summary} />}
        {activeTab === 'certificates' && <CertificateTab cert={latestCert} summary={summary} />}
        {activeTab === 'marketplace' && <MarketplaceTab />}
      </main>

      <footer className="border-t border-slate-800/80 bg-[#0b1120] py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          RenewCred Decarbonization Platform — Next.js 14 React Application
        </div>
      </footer>
    </div>
  );
}
