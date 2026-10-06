import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, onOpenDemoHelper }) {
  const { user, logout, isSupervisory } = useAuth();

  const branchLabel = { CNI: 'Chennai', MDU: 'Madurai', CMB: 'Coimbatore', HQ: 'HQ' };

  const supervisoryTabs = [
    { id: 'dashboard', label: '01 / COMMAND DASHBOARD' },
    { id: 'newCase', label: '02 / CASE REGISTRATION' },
    { id: 'progress', label: '03 / PROGRESS UPDATION' },
  ];

  const officerTabs = [
    { id: 'myCases', label: '01 / MY CASES' },
    { id: 'newCase', label: '02 / NEW CASE ENTRY' },
    { id: 'progress', label: '03 / PROGRESS UPDATE' },
  ];

  const tabs = isSupervisory ? supervisoryTabs : officerTabs;

  return (
    <header className="no-print" style={{ position: 'sticky', top: 0, zIndex: 40, background: 'var(--page-3)', borderBottom: '1px solid var(--border)' }}>
      
      {/* Top strip: classification + system info */}
      <div className="flex items-center justify-between px-4 border-b border-border" style={{ height: 26, background: 'var(--page)' }}>
        <span className="font-mono text-[10.5px] tracking-[0.18em] text-ink-faint uppercase">
          COATS · TN Police ATS · Secure Classification Level-{isSupervisory ? '1' : '2'}
        </span>
        <span className="font-mono text-[10.5px] text-ink-faint uppercase tracking-widest">
          {new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
          &nbsp;·&nbsp;
          <span className="classify-live" style={{ color: 'var(--green-bright)' }}>● LIVE</span>
        </span>
      </div>

      {/* Main nav bar */}
      <div className="flex items-stretch" style={{ height: 44 }}>
        
        {/* Logo */}
        <div className="flex items-center px-5 border-r border-border flex-shrink-0" style={{ minWidth: 180 }}>
          <div>
            <div className="font-display text-2xl tracking-widest text-ink leading-none">COATS</div>
            <div className="font-mono text-[8px] tracking-widest text-ink-dim uppercase">Anti Terrorism Squad</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-stretch flex-1 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`nav-tab ${activeTab === t.id ? 'active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Right: officer info + controls */}
        <div className="flex items-center border-l border-border px-3 gap-3 flex-shrink-0">
          {/* Switch Officer button */}
          <button
            onClick={onOpenDemoHelper}
            className="btn-ghost py-1.5 text-[10.5px]"
          >
            ⇄ SWITCH
          </button>

          {/* Officer info */}
          <div className="hidden lg:block text-right border-l border-border pl-3">
            <div className="font-mono text-[10.5px] text-ats-amber tracking-widest uppercase">{user?.username}</div>
            <div className="font-sans text-[11px] text-ink-dim truncate max-w-[160px]">{user?.name}</div>
          </div>

          {/* Access level badge */}
          <div className={`font-mono text-[10.5px] uppercase tracking-widest px-2 py-0.5 border ${
            isSupervisory
              ? 'border-ats-amber text-ats-amber'
              : 'border-ats-blue text-ats-blue'
          }`} style={{ fontSize: 10 }}>
            LVL {isSupervisory ? '1' : '2'}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="btn-ghost py-1.5 text-[10.5px] text-ats-red border-ats-red"
            style={{ borderColor: 'var(--red-dim)', color: 'var(--red)' }}
          >
            LOGOUT
          </button>
        </div>

      </div>

      {/* Officer designation strip */}
      <div className="flex items-center px-4 border-t border-border" style={{ height: 22, background: 'var(--page)' }}>
        <span className="font-mono text-[10.5px] text-ink-faint">
          {user?.designation} &nbsp;·&nbsp; {branchLabel[user?.branch] || user?.branch} Branch &nbsp;·&nbsp; {user?.unit}
        </span>
      </div>

    </header>
  );
}
