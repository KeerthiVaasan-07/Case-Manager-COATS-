import React, { useState, useEffect } from 'react';
import HeroOrb from './cyber/HeroOrb';
import {
  FileText,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Layers,
  Search,
  Gavel,
  Scale,
  Landmark,
  Radar,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SupervisoryDashboard({ onSelectCase }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('progress');
  const [search, setSearch] = useState('');

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const d = await api.getDashboardMetrics({
        branch,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setData(d);
    } catch (err) {
      console.error('Metrics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [branch, startDate, endDate]);

  const setPreset = (p) => {
    const today = new Date();
    const fmt = d => d.toISOString().split('T')[0];
    if (p === 'clear') { setStartDate(''); setEndDate(''); }
    else if (p === '7d') { const d = new Date(); d.setDate(today.getDate() - 7); setStartDate(fmt(d)); setEndDate(fmt(today)); }
    else if (p === '30d') { const d = new Date(); d.setDate(today.getDate() - 30); setStartDate(fmt(d)); setEndDate(fmt(today)); }
    else if (p === 'yr') { setStartDate(`${today.getFullYear()}-01-01`); setEndDate(fmt(today)); }
  };

  const stageBadge = (s) => {
    if (s === 'Under Investigation') return 'badge badge-ui';
    if (s === 'Pending Trial') return 'badge badge-pt';
    if (s === 'Pending Before High Court') return 'badge badge-hc';
    return 'badge badge-sc';
  };

  const m = data?.metrics || {};

  const filteredCases = (data?.cases_with_actions || []).filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.unique_id?.toLowerCase().includes(q) ||
           c.crime_number?.toLowerCase().includes(q) ||
           c.case_holding_officer_id?.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Title Banner */}
      <div className="glass-panel hero-panel" style={{ padding: '26px 30px', overflow: 'hidden' }}>
        <HeroOrb />
        <div style={{
          position: 'absolute', right: -60, top: -80, width: 320, height: 320, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(34,211,238,0.22), rgba(139,92,246,0.10) 55%, transparent 72%)',
        }} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)',
            }}>
              <Radar size={26} color="var(--cyan)" />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Geist', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.15 }}>
                Cyber Investigation <span className="text-gradient">Command Center</span>
              </h1>
              <div style={{ fontSize: 13, color: 'var(--dim)', marginTop: 4 }}>
                Real-time intelligence across active terrorism &amp; cyber cases
              </div>
            </div>
          </div>

          {/* Branch filter */}
          <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 14, background: 'rgba(5,8,15,0.55)', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
            {['ALL', 'CNI', 'MDU', 'CMB', 'HQ'].map(b => (
              <button
                key={b}
                onClick={() => setBranch(b)}
                style={{
                  padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontFamily: "'Geist', sans-serif", fontSize: 12.5, fontWeight: 600,
                  color: branch === b ? '#04121a' : 'var(--dim)',
                  background: branch === b ? 'var(--grad-brand)' : 'transparent',
                  boxShadow: branch === b ? '0 6px 18px -8px rgba(34,211,238,0.7)' : 'none',
                  transition: 'all .2s',
                }}
              >
                {b === 'ALL' ? 'All units' : b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div className="stat-card amber">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}><div className="stat-label" style={{ margin: 0 }}>UNDER INVESTIGATION</div><div style={{ width: 36, height: 36, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--amber) 14%, transparent)', border: '1px solid color-mix(in srgb, var(--amber) 35%, transparent)' }}><Search size={17} color="var(--amber)" /></div></div>
          <div className="stat-num" style={{ color: 'var(--amber)' }}>
            {loading ? '-' : m.under_investigation ?? 0}
          </div>
          <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 12, color: 'var(--dim)', marginTop: 6 }}>
            Active field enquiry & forensics
          </div>
        </div>

        <div className="stat-card blue">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}><div className="stat-label" style={{ margin: 0 }}>PENDING TRIAL</div><div style={{ width: 36, height: 36, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--blue) 14%, transparent)', border: '1px solid color-mix(in srgb, var(--blue) 35%, transparent)' }}><Gavel size={17} color="var(--blue)" /></div></div>
          <div className="stat-num" style={{ color: 'var(--blue)' }}>
            {loading ? '-' : m.pending_trial ?? 0}
          </div>
          <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 12, color: 'var(--dim)', marginTop: 6 }}>
            Sessions / Special NIA Court
          </div>
        </div>

        <div className="stat-card violet">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}><div className="stat-label" style={{ margin: 0 }}>HIGH COURT</div><div style={{ width: 36, height: 36, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--violet) 14%, transparent)', border: '1px solid color-mix(in srgb, var(--violet) 35%, transparent)' }}><Scale size={17} color="var(--violet)" /></div></div>
          <div className="stat-num" style={{ color: 'var(--violet)' }}>
            {loading ? '-' : m.pending_high_court ?? 0}
          </div>
          <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 12, color: 'var(--dim)', marginTop: 6 }}>
            Appeals & bail petitions
          </div>
        </div>

        <div className="stat-card red">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}><div className="stat-label" style={{ margin: 0 }}>SUPREME COURT</div><div style={{ width: 36, height: 36, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--red) 14%, transparent)', border: '1px solid color-mix(in srgb, var(--red) 35%, transparent)' }}><Landmark size={17} color="var(--red)" /></div></div>
          <div className="stat-num" style={{ color: 'var(--red)' }}>
            {loading ? '-' : m.pending_supreme_court ?? 0}
          </div>
          <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 12, color: 'var(--dim)', marginTop: 6 }}>
            SLP / Constitutional writs
          </div>
        </div>
      </div>

      {/* Date Filter Strip */}
      <div className="glass-panel" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <span className="section-title">Date Filter:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11.5, color: 'var(--faint)' }}>FROM</span>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="cyber-input"
            style={{ width: 140, padding: '5px 8px', fontSize: 11 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11.5, color: 'var(--faint)' }}>TO</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="cyber-input"
            style={{ width: 140, padding: '5px 8px', fontSize: 11 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['7d', '30d', 'yr', 'clear'].map(p => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className="btn-ghost-cyber"
              style={{ padding: '3px 8px', fontSize: 10.5 }}
            >
              {p === 'clear' ? 'CLEAR' : p.toUpperCase()}
            </button>
          ))}
        </div>
        {(startDate || endDate) && (
          <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, color: 'var(--cyan)', marginLeft: 'auto' }}>
            ● Filter active ({data?.progress_details?.length || 0} results)
          </span>
        )}
      </div>

      {/* Main Data Container */}
      <div className="glass-panel">
        {/* Table Tabs */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)', padding: '0 16px', flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex' }}>
            {[
              { id: 'progress', label: `Progress Logs (${data?.progress_details?.length || 0})` },
              { id: 'actions', label: `Action Matrix (${data?.cases_with_actions?.length || 0})` },
              { id: 'branches', label: 'Branch Breakdown' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  background: 'none', border: 'none',
                  borderBottom: activeTab === t.id ? '2px solid var(--cyan)' : '2px solid transparent',
                  color: activeTab === t.id ? 'var(--cyan)' : 'var(--dim)',
                  fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11.5,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  padding: '12px 16px', cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '8px 0' }}>
            <input
              type="text"
              placeholder="Search table..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="cyber-input"
              style={{ width: 180, padding: '5px 10px', fontSize: 11 }}
            />
          </div>
        </div>

        {/* Tab 1: Progress Logs */}
        {activeTab === 'progress' && (
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, color: 'var(--dim)' }}>
                <div className="cyber-pulse">Loading progress entries...</div>
              </div>
            ) : !data?.progress_details?.length ? (
              <div style={{ padding: 40, textAlign: 'center', fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, color: 'var(--dim)' }}>
                No progress logs match the selected filters.
              </div>
            ) : (
              <table className="cyber-table">
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Branch</th>
                    <th>Date</th>
                    <th>Officer</th>
                    <th>Stage</th>
                    <th style={{ width: '38%' }}>Details of Progress</th>
                    <th>Reminder</th>
                    <th>Action to Take</th>
                  </tr>
                </thead>
                <tbody>
                  {data.progress_details.map(p => (
                    <tr key={p.id} onClick={() => onSelectCase(p.case_unique_id)}>
                      <td>
                        <span className="mono-id">{p.case_unique_id}</span>
                        <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--faint)', marginTop: 2 }}>
                          {p.crime_number}
                        </div>
                      </td>
                      <td><span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11.5, color: 'var(--dim)' }}>{p.branch}</span></td>
                      <td><span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5 }}>{p.progress_date}</span></td>
                      <td><span style={{ fontSize: 11 }}>{p.officer_name || p.officer_id}</span></td>
                      <td><span className={stageBadge(p.stage_at_update)} style={{ fontSize: 10 }}>{p.stage_at_update}</span></td>
                      <td>
                        <div style={{ fontSize: 11.5, color: 'var(--white)', lineHeight: 1.5, maxWidth: 360 }}>
                          {p.progress_details}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11.5, color: p.reminder_date ? 'var(--amber)' : 'var(--faint)' }}>
                          {p.reminder_date || '-'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: 11, color: 'var(--dim)', maxWidth: 220 }}>
                          {p.further_action || '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Action Matrix */}
        {activeTab === 'actions' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Branch</th>
                  <th>Stage</th>
                  <th>Case Officer</th>
                  <th style={{ width: '45%' }}>Active Action To Be Taken</th>
                  <th>Next Reminder</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map(c => (
                  <tr key={c.id}>
                    <td>
                      <span className="mono-id">{c.unique_id}</span>
                      <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--faint)', marginTop: 2 }}>
                        {c.crime_number}
                      </div>
                    </td>
                    <td><span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11.5 }}>{c.branch}</span></td>
                    <td><span className={stageBadge(c.current_stage)} style={{ fontSize: 10 }}>{c.current_stage}</span></td>
                    <td><span style={{ fontSize: 11 }}>{c.case_holding_officer_id}</span></td>
                    <td>
                      {c.active_action_to_be_taken ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {c.active_action_to_be_taken.split(' | ').map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 11, color: 'var(--white)' }}>
                              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--cyan)', marginTop: 5, flexShrink: 0 }} />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11.5, color: 'var(--green)' }}>
                          ✔ All completed
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11.5, color: c.latest_reminder_date ? 'var(--amber)' : 'var(--faint)' }}>
                        {c.latest_reminder_date || '-'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => onSelectCase(c.unique_id)}
                        className="btn-ghost-cyber"
                        style={{ padding: '4px 8px', fontSize: 10.5 }}
                      >
                        VIEW
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Branch Breakdown */}
        {activeTab === 'branches' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Branch Unit</th>
                  <th>Total Cases</th>
                  <th style={{ color: 'var(--amber)' }}>Under Investigation</th>
                  <th style={{ color: 'var(--blue)' }}>Pending Trial</th>
                  <th style={{ color: 'var(--violet)' }}>High Court</th>
                  <th style={{ color: 'var(--red)' }}>Supreme Court</th>
                </tr>
              </thead>
              <tbody>
                {(data?.branch_breakdown || []).map(b => (
                  <tr key={b.branch}>
                    <td>
                      <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 12, fontWeight: 700, color: 'var(--white)' }}>
                        {b.branch === 'CNI' ? 'Chennai' : b.branch === 'MDU' ? 'Madurai' : b.branch === 'CMB' ? 'Coimbatore' : 'Headquarters'}
                      </span>
                      <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--faint)', marginLeft: 6 }}>
                        ({b.branch})
                      </span>
                    </td>
                    <td><span className="stat-num" style={{ fontSize: 32, color: 'var(--white)' }}>{b.total}</span></td>
                    <td><span className="stat-num" style={{ fontSize: 26, color: 'var(--amber)' }}>{b.ui}</span></td>
                    <td><span className="stat-num" style={{ fontSize: 26, color: 'var(--blue)' }}>{b.pt}</span></td>
                    <td><span className="stat-num" style={{ fontSize: 26, color: 'var(--violet)' }}>{b.hc}</span></td>
                    <td><span className="stat-num" style={{ fontSize: 26, color: 'var(--red)' }}>{b.sc}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reminders Banner */}
      {data?.upcoming_reminders?.length > 0 && (
        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '3px solid var(--amber)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <AlertTriangle size={15} style={{ color: 'var(--amber)' }} />
            <span className="section-title" style={{ color: 'var(--amber)' }}>
              Scheduled Hearings & Time-Bound Reminders ({data.upcoming_reminders.length})
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            {data.upcoming_reminders.map(r => (
              <div
                key={r.id}
                onClick={() => onSelectCase(r.case_unique_id)}
                style={{
                  background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.25)',
                  padding: '8px 12px', cursor: 'pointer', borderRadius: 3,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="mono-id" style={{ fontSize: 11.5 }}>{r.case_unique_id}</span>
                  <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11.5, color: 'var(--amber)', fontWeight: 700 }}>
                    {r.reminder_date}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--white)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.further_action || 'No action specified'}
                </div>
                <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--dim)', marginTop: 2 }}>
                  Officer: {r.officer_name} · {r.branch}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
