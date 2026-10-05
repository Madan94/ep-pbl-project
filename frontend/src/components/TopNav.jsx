import React from 'react';
import { ChevronRight, Pause, Play, FlaskConical } from 'lucide-react';
export default function TopNav({activeTab, isStreaming, onToggleStreaming}) {
 const titles = { dashboard: 'Overview', ai: 'Verification', certificates: 'Certificates', marketplace: 'Marketplace', 'prediction-logs': 'Telemetry logs' };
 return <header className="topnav"><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14}/><strong>{titles[activeTab]}</strong></div><div className="topnav-actions"><span className="demo-badge"><FlaskConical size={13}/> Demo mode</span><button className="stream-button" onClick={onToggleStreaming}><i className={isStreaming ? 'status-dot' : 'status-dot paused'}/>{isStreaming ? 'Live stream' : 'Stream paused'}{isStreaming ? <Pause size={13}/> : <Play size={13}/>}</button><span className="top-avatar">JD</span></div></header>;
}

