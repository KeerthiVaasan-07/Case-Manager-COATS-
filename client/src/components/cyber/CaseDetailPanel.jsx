import React, { useState, useEffect } from 'react';
import { X, Printer, ArrowRight, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { api } from '../../services/api';

export default function CaseDetailPanel({ caseUniqueId, onClose, onUpdateProgress }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (!caseUniqueId) return;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const d = await api.getCaseById(caseUniqueId);
        setData(d);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    }
    load();
  }, [caseUniqueId]);

  if (!caseUniqueId) return null;

  const stageBadge = (s) => {
    if (s === 'Under Investigation') return 'badge badge-ui';
    if (s === 'Pending Trial') return 'badge badge-pt';
    if (s === 'Pending Before High Court') return 'badge badge-hc';
    return 'badge badge-sc';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end no-print"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%', maxWidth: 840,
          height: '100vh',
          display: 'flex', flexDirection: 'column',
          borderLeft: '1px solid var(--border)',
          borderRadius: 0,
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12,
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: "'Geist', sans-serif", fontSize: 26, letterSpacing: '0.08em', color: 'var(--cyan)' }}>
                {caseUniqueId}
              </span>
              {data && <span className={stageBadge(data.case.current_stage)}>{data.case.current_stage}</span>}
            </div>
            {data && (
              <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11.5, color: 'var(--dim)', marginTop: 2 }}>
                {data.case.crime_number} · {data.case.ps_limit} · {data.case.branch} Unit
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => window.print()} className="btn-ghost-cyber" style={{ padding: '5px 10px', fontSize: 11.5 }}>
              <Printer size={12} /> Print
            </button>
            {onUpdateProgress && data && (
              <button
                onClick={() => { onClose(); onUpdateProgress(data.case.unique_id); }}
                className="btn-cyber"
                style={{ padding: '5px 12px', fontSize: 11.5 }}
              >
                Update <ArrowRight size={12} />
              </button>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', padding: 4 }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'timeline', label: `Timeline (${data?.progress_history?.length || 0})` },
            { id: 'actions', label: `Actions (${data?.active_actions?.length || 0} active)` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: 'none', border: 'none',
                borderBottom: tab === t.id ? '2px solid var(--cyan)' : '2px solid transparent',
                color: tab === t.id ? 'var(--cyan)' : 'var(--dim)',
                fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11.5,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                padding: '10px 16px', cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, color: 'var(--dim)' }}>
              <div className="cyber-pulse">Loading dossier...</div>
            </div>
          ) : error ? (
            <div className="cyber-alert">{error}</div>
          ) : data ? (
            <>
              {tab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    {[
                      ['Crime Number', data.case.crime_number],
                      ['PS Limit', data.case.ps_limit],
                      ['Date of Occurrence', data.case.date_of_occurrence],
                      ['Date of Registration', data.case.date_of_registration],
                      ['Case Officer', `${data.case.case_holding_officer_id} (${data.case.case_holding_officer_name || ''})`],
                      ['Branch Unit', data.case.branch],
                    ].map(([label, val]) => (
                      <div key={label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: 10 }}>
                        <div className="section-title">{label}</div>
                        <div style={{ marginTop: 4, fontFamily: "'Geist', system-ui, sans-serif", fontSize: 12, color: 'var(--white)' }}>
                          {val || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: 14, borderRadius: 10 }}>
                    <div className="section-title">Section of Law</div>
                    <div style={{ marginTop: 6, fontFamily: "'Geist', system-ui, sans-serif", fontSize: 12, color: 'var(--cyan)' }}>
                      {data.case.section_of_law}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: 14, borderRadius: 10 }}>
                    <div className="section-title">Complainant</div>
                    <div style={{ marginTop: 6, fontSize: 12, color: 'var(--white)' }}>{data.case.complainant_name}</div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: 14, borderRadius: 10 }}>
                    <div className="section-title">Details of Accused</div>
                    <pre style={{ marginTop: 6, fontFamily: "'Geist', sans-serif", fontSize: 12, color: 'var(--white)', whiteSpace: 'pre-wrap', margin: 0 }}>
                      {data.case.accused_details}
                    </pre>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: 14, borderRadius: 10 }}>
                    <div className="section-title">Gist of Case</div>
                    <p style={{ marginTop: 6, fontSize: 12.5, color: 'var(--white)', lineHeight: 1.6, margin: 0 }}>
                      {data.case.gist_of_case}
                    </p>
                  </div>
                </div>
              )}

              {tab === 'timeline' && (
                <div>
                  {data.progress_history.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, color: 'var(--dim)' }}>
                      No progress entries logged yet.
                    </div>
                  ) : (
                    <div>
                      {data.progress_history.map(p => (
                        <div key={p.id} className="timeline-node">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, fontWeight: 700, color: 'var(--amber)' }}>
                              {p.progress_date}
                            </span>
                            <span className={stageBadge(p.stage_at_update)} style={{ fontSize: 10 }}>{p.stage_at_update}</span>
                            <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--dim)' }}>
                              by {p.officer_id}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--white)', lineHeight: 1.5, margin: '4px 0 6px' }}>
                            {p.progress_details}
                          </p>
                          {p.further_action && (
                            <div style={{ background: 'rgba(0,212,255,0.04)', borderLeft: '2px solid var(--cyan)', padding: '6px 10px', marginTop: 4 }}>
                              <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Next Action: </span>
                              <span style={{ fontSize: 11, color: 'var(--white)' }}>{p.further_action}</span>
                            </div>
                          )}
                          {p.reminder_date && (
                            <div style={{ marginTop: 4, fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--amber)' }}>
                              Reminder / Hearing: {p.reminder_date}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === 'actions' && (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <div className="section-title" style={{ marginBottom: 8 }}>Active Action Items</div>
                    {data.active_actions.length === 0 ? (
                      <div className="cyber-success">All registered action items have been completed.</div>
                    ) : (
                      <div style={{ border: '1px solid var(--border)', borderRadius: 10 }}>
                        {data.active_actions.map(a => (
                          <div key={a.id} className="checklist-item">
                            <div className="check-box" />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, color: 'var(--white)' }}>{a.task_description}</div>
                              <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--faint)', marginTop: 2 }}>
                                Source: {a.source_type} · Added: {a.created_at?.split(' ')[0]}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {data.completed_actions.length > 0 && (
                    <div>
                      <div className="section-title" style={{ marginBottom: 8 }}>Archived / Completed Tasks ({data.completed_actions.length})</div>
                      <div style={{ border: '1px solid var(--border)', opacity: 0.6, borderRadius: 10 }}>
                        {data.completed_actions.map(a => (
                          <div key={a.id} className="checklist-item done">
                            <div className="check-box checked">
                              <CheckCircle size={10} style={{ color: 'var(--cyan)' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, textDecoration: 'line-through' }}>{a.task_description}</div>
                              <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--faint)', marginTop: 2 }}>
                                Completed by {a.completed_by_officer} on {a.completed_at?.split(' ')[0]}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
