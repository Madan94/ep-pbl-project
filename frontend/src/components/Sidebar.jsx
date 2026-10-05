import React from 'react';
import { LayoutDashboard, ShieldCheck, FileText, ArrowRightLeft, Database, ChevronDown, ArrowUpRight, Leaf, Radio } from 'lucide-react';
const items = [{ id: 'dashboard', label: 'Overview', icon: LayoutDashboard }, { id: 'ai', label: 'Verification', icon: ShieldCheck }, { id: 'certificates', label: 'Certificates', icon: FileText }, { id: 'marketplace', label: 'Marketplace', icon: ArrowRightLeft }, { id: 'prediction-logs', label: 'Telemetry logs', icon: Database }];
export default function Sidebar({ activeTab, setActiveTab, isStreaming }) {
  return <aside className="sidebar"><a className="brand" href="#" onClick={event => { event.preventDefault(); setActiveTab('dashboard'); }}><span className="brand-mark"><Leaf size={21} /></span>RenewCred<span className="brand-dot">.</span></a>
    <div className="workspace-selector"><span className="workspace-avatar">R</span><div><strong>RenewCred Studio</strong><small>Demo workspace</small></div><ChevronDown size={15} /></div>
    <div className="nav-label">WORKSPACE</div><nav aria-label="Main navigation">{items.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)} aria-current={activeTab === id ? 'page' : undefined}><Icon size={18} /><span>{label}</span>{id === 'ai' && <span className="nav-badge">AI</span>}</button>)}</nav>
    <div className="sidebar-bottom"><div className="impact-note"><span className="tiny-icon"><Leaf size={18}/></span><strong>Small signals. Real impact.</strong><p>Turn clean energy into measurable climate progress.</p><button onClick={() => setActiveTab('certificates')}>Explore your impact <ArrowUpRight size={14}/></button></div><div className="node-status"><Radio size={15}/><span>4 simulated nodes</span><i className={isStreaming ? 'status-dot' : 'status-dot paused'} /></div><div className="user-card"><span className="user-avatar">JD</span><div><strong>Demo account</strong><small>Professional workspace</small></div></div></div>
  </aside>;
}

