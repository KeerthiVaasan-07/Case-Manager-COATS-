import HeroOrb from './cyber/HeroOrb';
import React, { useState, useEffect } from 'react';
import { PlusCircle, FileText, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MyAssignedCases({ onNavigateToNewCase, onNavigateToProgress, onSelectCase }) {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const d = await api.getCases();
        setCases(d);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const stageBadge = (s) => {
    if (s === 'Under Investigation') return 'badge badge-ui';
    if (s === 'Pending Trial') return 'badge badge-pt';
    if (s === 'Pending Before High Court') return 'badge badge-hc';
    return 'badge badge-sc';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="glass-panel hero-panel" style={{ padding: '20px 24px', overflow: 'hidden', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <HeroOrb />
        <div>
          <div style={{ fontFamily: "'Geist', sans-serif", fontSize: 28, letterSpacing: '0.08em', color: 'var(--white)', lineHeight: 1 }}>
            MY ASSIGNED CASE DOSSIERS
          </div>
          <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>
            Officer: {user?.username} ({user?.name}) · {user?.branch} Branch · RBAC Isolation Active
          </div>
        </div>

        <button onClick={onNavigateToNewCase} className="btn-cyber-solid">
          <PlusCircle size={13} /> NEW CASE INTAKE (STEP 1)
        </button>
      </div>

      {error && <div className="cyber-alert">{error}</div>}

      {/* Case Table */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, color: 'var(--dim)' }}>
            <div className="cyber-pulse">Loading assigned cases...</div>
          </div>
        ) : cases.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <FileText size={32} style={{ color: 'var(--faint)', margin: '0 auto 12px' }} />
            <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, color: 'var(--dim)' }}>
              No cases are currently assigned to {user?.username}.
            </div>
            <button
              onClick={onNavigateToNewCase}
              className="btn-cyber"
              style={{ marginTop: 14 }}
            >
              Register First Case →
            </button>
          </div>
        ) : (
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Crime Number</th>
                <th>PS Limit</th>
                <th>Section of Law</th>
                <th>Current Stage</th>
                <th>Active Actions</th>
                <th>Last Update</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cases.map(c => (
                <tr key={c.id}>
                  <td>
                    <button
                      onClick={() => onSelectCase(c.unique_id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                    >
                      <span className="mono-id">{c.unique_id}</span>
                    </button>
                  </td>
                  <td><span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5 }}>{c.crime_number}</span></td>
                  <td><span style={{ fontSize: 11, color: 'var(--dim)' }}>{c.ps_limit}</span></td>
                  <td>
                    <div style={{ fontSize: 11, color: 'var(--dim)', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.section_of_law}
                    </div>
                  </td>
                  <td><span className={stageBadge(c.current_stage)} style={{ fontSize: 10 }}>{c.current_stage}</span></td>
                  <td>
                    {c.active_actions?.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {c.active_actions.slice(0, 2).map(a => (
                          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: 'var(--white)' }}>
                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--cyan)', flexShrink: 0 }} />
                            <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {a.task_description}
                            </span>
                          </div>
                        ))}
                        {c.active_actions.length > 2 && (
                          <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--faint)' }}>
                            +{c.active_actions.length - 2} more tasks
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, color: 'var(--green)' }}>
                        ✔ Completed
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11.5, color: 'var(--dim)' }}>
                      {c.last_progress_date || 'Never'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => onSelectCase(c.unique_id)}
                        className="btn-ghost-cyber"
                        style={{ padding: '4px 8px', fontSize: 10.5 }}
                      >
                        VIEW
                      </button>
                      <button
                        onClick={() => onNavigateToProgress(c.unique_id)}
                        className="btn-cyber"
                        style={{ padding: '4px 10px', fontSize: 10.5 }}
                      >
                        UPDATE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
