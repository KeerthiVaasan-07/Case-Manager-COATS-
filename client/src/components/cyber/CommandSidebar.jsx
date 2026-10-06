import React from 'react';
import {
  LayoutDashboard, FolderOpen, PlusCircle, RefreshCw, Brain,
  ChevronLeft, ChevronRight, Shield, ShieldCheck,
} from 'lucide-react';

export default function CommandSidebar({ activeTab, setActiveTab, isSupervisory, collapsed, setCollapsed }) {
  const supervisoryItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'newCase', label: 'Case Intake (Step 1)', icon: PlusCircle },
    { id: 'progress', label: 'Progress Update', icon: RefreshCw },
    { id: 'ai', label: 'COATS AI Engine', icon: Brain },
  ];
  const officerItems = [
    { id: 'myCases', label: 'My Cases', icon: FolderOpen },
    { id: 'newCase', label: 'New Case (Step 1)', icon: PlusCircle },
    { id: 'progress', label: 'Progress Update', icon: RefreshCw },
    { id: 'ai', label: 'COATS AI Engine', icon: Brain },
  ];
  const items = isSupervisory ? supervisoryItems : officerItems;

  return (
    <>
    <aside
      className="no-print glass cmd-sidebar"
      style={{
        width: collapsed ? 76 : 248,
        transition: 'width .25s cubic-bezier(.4,0,.2,1)',
        height: '100vh', position: 'sticky', top: 0, zIndex: 40,
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(12,19,36,0.9), rgba(6,10,20,0.9))',
      }}
    >
      {/* Brand */}
      <div style={{
        height: 68, padding: collapsed ? '0 16px' : '0 20px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px -8px rgba(34,211,238,0.7)',
        }}>
          <Shield size={20} color="#04121a" strokeWidth={2.4} />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: "'Geist', sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: '0.05em', lineHeight: 1.1 }}>COATS</div>
            <div style={{ fontSize: 10.5, color: 'var(--cyan)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Cyber Command</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '18px 12px', overflowY: 'auto' }}>
        {!collapsed && <div className="section-title" style={{ padding: '0 14px 10px' }}>Operations</div>}
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
              style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
            >
              <Icon size={18} style={{ flexShrink: 0, color: isActive ? 'var(--cyan)' : 'inherit' }} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {!collapsed && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12,
            background: isSupervisory ? 'rgba(34,211,238,0.08)' : 'rgba(167,139,250,0.08)',
            border: `1px solid ${isSupervisory ? 'rgba(34,211,238,0.25)' : 'rgba(167,139,250,0.25)'}`,
          }}>
            <ShieldCheck size={18} color={isSupervisory ? 'var(--cyan)' : 'var(--violet)'} />
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: isSupervisory ? 'var(--cyan)' : 'var(--violet)' }}>
                {isSupervisory ? 'Level 1' : 'Level 2'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--dim)' }}>{isSupervisory ? 'Supervisory access' : 'Case officer access'}</div>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn-ghost-cyber"
          style={{ width: '100%', justifyContent: collapsed ? 'center' : 'space-between', padding: '8px 12px' }}
        >
          {!collapsed && <span>Collapse</span>}
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
    <nav className="mobile-dock no-print" aria-label="Primary">
      {items.map(item => { const Icon = item.icon; return (
        <button key={item.id} onClick={() => setActiveTab(item.id)} aria-label={item.label}
          aria-current={activeTab === item.id ? 'page' : undefined} className={activeTab === item.id ? 'on' : ''}>
          <Icon size={19} /><span>{item.label.split(' (')[0].replace('COATS ', '')}</span>
        </button>); })}
    </nav>
    </>
  );
}
