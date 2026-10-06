import React, { useState } from 'react';
import { X, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DemoLoginHelper({ isOpen, onClose }) {
  const { allOfficers, quickSwitch, user } = useAuth();
  const [switching, setSwitching] = useState(null);

  if (!isOpen) return null;

  const handleSelect = async (o) => {
    setSwitching(o.username);
    try {
      await quickSwitch(o);
      onClose();
    } catch (err) {
      alert('Switch error: ' + err.message);
    } finally {
      setSwitching(null);
    }
  };

  const supervisory = allOfficers.filter(o => o.role === 'SUPERVISORY');
  const cni = allOfficers.filter(o => o.role === 'CASE_HOLDING' && o.branch === 'CNI');
  const mdu = allOfficers.filter(o => o.role === 'CASE_HOLDING' && o.branch === 'MDU');
  const cmb = allOfficers.filter(o => o.role === 'CASE_HOLDING' && o.branch === 'CMB');
  const hq = allOfficers.filter(o => o.role === 'CASE_HOLDING' && o.branch === 'HQ');

  const OfficerCard = ({ o }) => {
    const isCurrent = user?.username === o.username;
    return (
      <button
        type="button"
        onClick={() => handleSelect(o)}
        disabled={!!switching}
        style={{
          background: isCurrent ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${isCurrent ? 'var(--cyan)' : 'var(--border)'}`,
          padding: '8px 10px',
          textAlign: 'left',
          cursor: 'pointer',
          borderRadius: 3,
        }}
      >
        <div style={{
          fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, fontWeight: 700,
          color: o.role === 'SUPERVISORY' ? 'var(--cyan)' : 'var(--violet)',
        }}>
          {o.username}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--dim)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {o.name}
        </div>
        {switching === o.username && (
          <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--amber)', marginTop: 2 }}>
            switching...
          </div>
        )}
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass-panel w-full" style={{ maxWidth: 860, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <span className="section-cyan">Officer Directory & Quick Role Switcher</span>
            <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, color: 'var(--faint)', marginTop: 2 }}>
              Active Officer: <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{user?.username || 'None'}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {/* Credentials info */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
            padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 24, flexWrap: 'wrap',
            fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11.5, color: 'var(--dim)', borderRadius: 10 }}>
            <span>Demo mode: click an officer to sign in without a password.</span>
            <span>Real passwords: <strong style={{ color: 'var(--cyan)' }}>server/data/INITIAL_CREDENTIALS.txt</strong></span>
          </div>

          {/* Groups */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div className="section-title" style={{ marginBottom: 8, color: 'var(--cyan)' }}>
                Level 1 Supervisory Command (Global Dashboard)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                {supervisory.map(o => <OfficerCard key={o.id} o={o} />)}
              </div>
            </div>

            <div>
              <div className="section-title" style={{ marginBottom: 8 }}>
                Chennai Branch (CNI) - Level 2 Case Officers
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                {cni.map(o => <OfficerCard key={o.id} o={o} />)}
              </div>
            </div>

            <div>
              <div className="section-title" style={{ marginBottom: 8 }}>
                Madurai Branch (MDU) - Level 2 Case Officers
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                {mdu.map(o => <OfficerCard key={o.id} o={o} />)}
              </div>
            </div>

            <div>
              <div className="section-title" style={{ marginBottom: 8 }}>
                Coimbatore Branch (CMB) - Level 2 Case Officers
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                {cmb.map(o => <OfficerCard key={o.id} o={o} />)}
              </div>
            </div>

            {hq.length > 0 && (
              <div>
                <div className="section-title" style={{ marginBottom: 8 }}>
                  Headquarters (HQ) Case Officers
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                  {hq.map(o => <OfficerCard key={o.id} o={o} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
