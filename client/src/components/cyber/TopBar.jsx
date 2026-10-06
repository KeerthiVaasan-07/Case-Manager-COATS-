import React, { useState, useEffect } from 'react';
import { Search, LogOut, ChevronRight, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TopBar({ pageTitle, onOpenSearch, onOpenDemoHelper }) {
  const { user, isSupervisory, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const f = () => setScrolled(window.scrollY > 24); f(); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f); }, []);
  const accent = isSupervisory ? 'var(--cyan)' : 'var(--violet)';

  return (
    <header className={`no-print glass topbar ${scrolled ? 'scrolled' : ''}`} style={{
      position: 'sticky', top: 0, zIndex: 30, height: 68,
      borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr minmax(260px, 520px) 1fr', alignItems: 'center',
      padding: '0 28px', gap: 20,
      background: 'rgba(7,12,24,0.7)',
    }}>
      <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <span style={{ fontSize: 13, color: 'var(--faint)', fontWeight: 500 }}>COATS</span>
        <ChevronRight size={14} style={{ color: 'var(--faint)' }} />
        <span style={{ fontFamily: "'Geist', sans-serif", fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>
          {pageTitle}
        </span>
      </div>

      <button
        onClick={onOpenSearch} className="topbar-search" aria-label="Search cases (Ctrl K)"
        style={{
          width: '100%', minWidth: 0, display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-b)', borderRadius: 12,
          padding: '9px 14px', color: 'var(--dim)', cursor: 'pointer', fontSize: 13, textAlign: 'left',
          transition: 'border-color .2s, background .2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,211,238,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      >
        <Search size={16} />
        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Search cases, crime numbers…</span>
        <kbd style={{
          fontFamily: "'Geist Mono', monospace", fontSize: 10.5, color: 'var(--dim)',
          border: '1px solid var(--border-b)', borderRadius: 6, padding: '2px 7px', background: 'rgba(255,255,255,0.04)',
        }}>Ctrl K</kbd>
      </button>

      <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 16, justifySelf: 'end' }}>
        <div className="badge badge-green" style={{ padding: '4px 12px' }}>Operational</div>

        <button onClick={onOpenDemoHelper} className="btn-ghost-cyber" style={{ padding: '7px 12px' }}>
          <ArrowLeftRight size={14} /> Officer
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderLeft: '1px solid var(--border)', paddingLeft: 16 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isSupervisory ? 'linear-gradient(135deg,#22d3ee,#3b82f6)' : 'linear-gradient(135deg,#a78bfa,#6366f1)',
            color: '#04121a', fontWeight: 800, fontSize: 15, flexShrink: 0,
            boxShadow: `0 8px 22px -8px ${isSupervisory ? 'rgba(34,211,238,0.7)' : 'rgba(167,139,250,0.7)'}`,
          }}>
            {user?.username?.[0] || 'O'}
          </div>
          <div className="hidden lg:block" style={{ lineHeight: 1.25 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: accent }}>{user?.username}</div>
            <div style={{ fontSize: 11.5, color: 'var(--dim)', maxWidth: 190, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.designation}
            </div>
          </div>
          <button
            onClick={logout} title="Logout" aria-label="Logout"
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-b)', borderRadius: 10,
              cursor: 'pointer', padding: 8, color: 'var(--dim)', display: 'flex', transition: 'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--dim)'; e.currentTarget.style.borderColor = ''; }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
