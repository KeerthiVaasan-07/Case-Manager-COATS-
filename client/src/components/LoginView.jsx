import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, Eye, EyeOff, Fingerprint, Radar, KeyRound, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CyberBackground from './cyber/CyberBackground';

const features = [
  { icon: Radar, title: 'Unified case intelligence', text: 'Every FIR, stage and court update in one command view.' },
  { icon: KeyRound, title: 'Role-based access control', text: 'Strict supervisory and case-officer permission tiers.' },
  { icon: Activity, title: 'Live investigation tracking', text: 'Checklists, reminders and action matrices in real time.' },
];

export default function LoginView({ onOpenDemoHelper }) {
  const { login } = useAuth();
  const [roleType, setRoleType] = useState('SUPERVISORY');
  const [username, setUsername] = useState('DIG ATS');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRoleToggle = (t) => {
    setRoleType(t);
    setError(null);
    if (t === 'SUPERVISORY') { setUsername('DIG ATS'); setPassword(''); }
    else { setUsername('INS1CNI'); setPassword(''); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try { await login(username, password); }
    catch (err) { setError(err.message || 'Authentication failed'); }
    finally { setLoading(false); }
  };

  const seg = (active) => ({
    flex: 1, padding: '9px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
    fontFamily: "'Geist', sans-serif", fontSize: 12.5, fontWeight: 600,
    color: active ? '#04121a' : 'var(--dim)',
    background: active ? 'var(--grad-brand)' : 'transparent',
    boxShadow: active ? '0 6px 20px -8px rgba(34,211,238,0.7)' : 'none',
    transition: 'all .2s',
  });

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', overflow: 'hidden' }}>
      <CyberBackground />

      {/* Status strip */}
      <div className="no-print" style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 36, zIndex: 20,
        background: 'rgba(5,8,15,0.7)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
      }}>
        <span style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: '0.08em', fontWeight: 500 }}>
          TN POLICE · ANTI TERRORISM SQUAD
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>
          <span style={{ position: 'relative', width: 8, height: 8 }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--green)' }} />
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--green)', animation: 'ring-ping 1.8s infinite' }} />
          </span>
          Encrypted session
        </span>
      </div>

      {/* Hero (left) */}
      <section className="hidden lg:flex" style={{
        flex: 1.15, position: 'relative', zIndex: 10, flexDirection: 'column',
        justifyContent: 'center', padding: '80px 64px 64px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--grad-brand)', boxShadow: '0 12px 40px -10px rgba(34,211,238,0.7)',
          }}>
            <Shield size={26} color="#04121a" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ fontFamily: "'Geist', sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: '0.04em' }}>COATS</div>
            <div style={{ fontSize: 11.5, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Cases of Anti Terrorism Squad</div>
          </div>
        </div>

        <h1 style={{
          fontFamily: "'Geist', sans-serif", fontSize: 54, lineHeight: 1.05, fontWeight: 700,
          letterSpacing: '-0.03em', margin: 0, maxWidth: 620,
        }}>
          Cyber investigation <span className="text-gradient">command center</span> built for speed &amp; security.
        </h1>
        <p style={{ color: 'var(--dim)', fontSize: 16, maxWidth: 520, marginTop: 20, lineHeight: 1.7 }}>
          One secure workspace for case intake, progress tracking and supervisory oversight across all ATS units in Tamil Nadu.
        </p>

        <div style={{ display: 'grid', gap: 14, marginTop: 40, maxWidth: 520 }}>
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="glass-bright" style={{ display: 'flex', gap: 14, padding: '14px 16px', alignItems: 'center' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)',
              }}>
                <Icon size={18} color="var(--cyan)" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
                <div style={{ color: 'var(--dim)', fontSize: 12.5 }}>{text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Login card (right) */}
      <section style={{
        flex: 1, position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '70px 24px 50px',
      }}>
        <div className="glass-panel fade-up" style={{ width: '100%', maxWidth: 440, padding: 36 }}>
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <div className="lg:hidden" style={{
              width: 48, height: 48, borderRadius: 14, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--grad-brand)',
            }}>
              <Shield size={24} color="#04121a" strokeWidth={2.4} />
            </div>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', margin: '0 auto 14px',
              display: 'none', alignItems: 'center', justifyContent: 'center',
            }} />
            <h2 style={{ fontFamily: "'Geist', sans-serif", fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
              Secure sign in
            </h2>
            <p style={{ color: 'var(--dim)', fontSize: 13, margin: '6px 0 0' }}>
              Authenticate to access the command portal
            </p>
          </div>

          <div style={{
            display: 'flex', gap: 4, padding: 4, borderRadius: 14, marginBottom: 22,
            background: 'rgba(5,8,15,0.6)', border: '1px solid var(--border)',
          }}>
            <button type="button" onClick={() => handleRoleToggle('SUPERVISORY')} style={seg(roleType === 'SUPERVISORY')}>Supervisory</button>
            <button type="button" onClick={() => handleRoleToggle('CASE_HOLDING')} style={seg(roleType === 'CASE_HOLDING')}>Case Officer</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="section-title" style={{ display: 'block', marginBottom: 7 }}>Officer User ID</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--dim)' }} />
                <input
                  type="text" value={username} onChange={e => setUsername(e.target.value)} required
                  className="cyber-input" style={{ paddingLeft: 40 }}
                  placeholder={roleType === 'SUPERVISORY' ? 'e.g. DIG ATS' : 'e.g. INS1CNI'}
                />
              </div>
            </div>

            <div>
              <label className="section-title" style={{ display: 'block', marginBottom: 7 }}>Access Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--dim)' }} />
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="cyber-input" style={{ paddingLeft: 40, paddingRight: 42 }}
                />
                <button
                  type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}
                  style={{ position: 'absolute', right: 10, top: 9, background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', padding: 4 }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <div className="cyber-alert">{error}</div>}

            <button type="submit" disabled={loading} className="btn-cyber-solid" style={{ marginTop: 6, padding: '13px 18px', fontSize: 14 }}>
              <Fingerprint size={17} />
              {loading ? 'Authenticating…' : 'Access Command Portal'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button" onClick={onOpenDemoHelper}
              style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', fontSize: 12.5, fontWeight: 600 }}
            >
              ⇄ Browse all 25 officer accounts
            </button>
            <span style={{ fontSize: 11, color: 'var(--faint)' }}>Pre-loaded</span>
          </div>
        </div>
      </section>
    </div>
  );
}
