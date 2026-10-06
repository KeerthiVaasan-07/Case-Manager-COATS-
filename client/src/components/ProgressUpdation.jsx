import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProgressUpdation({ initialCaseId, onUpdateSuccess }) {
  const { user, isSupervisory } = useAuth();
  const [casesList, setCasesList] = useState([]);
  const [selectedId, setSelectedId] = useState(initialCaseId || '');
  const [details, setDetails] = useState(null);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [progressDate, setProgressDate] = useState(new Date().toISOString().split('T')[0]);
  const [progressText, setProgressText] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [furtherAction, setFurtherAction] = useState('');
  const [remarks, setRemarks] = useState('');
  const [newStage, setNewStage] = useState('');
  const [checkedIds, setCheckedIds] = useState([]);

  useEffect(() => {
    async function load() {
      setLoadingCases(true);
      try {
        const cs = await api.getCases();
        setCasesList(cs);
        if (initialCaseId) setSelectedId(initialCaseId);
        else if (cs.length > 0) setSelectedId(cs[0].unique_id);
      } catch (err) { setError(err.message); }
      finally { setLoadingCases(false); }
    }
    load();
  }, [user]);

  useEffect(() => {
    if (!selectedId) return;
    async function loadCase() {
      setLoadingDetails(true);
      setError(null);
      try {
        const d = await api.getCaseById(selectedId);
        setDetails(d);
        setNewStage(d.case.current_stage);
        setCheckedIds([]);
      } catch (err) { setError(err.message); }
      finally { setLoadingDetails(false); }
    }
    loadCase();
  }, [selectedId]);

  const toggleCheck = (id) => {
    setCheckedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await api.updateProgress(details.case.id, {
        date_of_progress: progressDate,
        details_of_progress: progressText,
        reminder_date: reminderDate || null,
        further_action_to_be_taken: furtherAction || null,
        remarks: remarks || null,
        completed_action_ids: checkedIds,
        new_stage: newStage !== details.case.current_stage ? newStage : null,
      });

      setSuccess('Progress recorded. Checked items archived. New action items queued.');
      setProgressText('');
      setFurtherAction('');
      setRemarks('');
      setReminderDate('');
      setCheckedIds([]);

      const fresh = await api.getCaseById(details.case.id);
      setDetails(fresh);
      if (onUpdateSuccess) onUpdateSuccess(fresh);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const stages = [
    'Under Investigation',
    'Pending Trial',
    'Pending Before High Court',
    'Pending Before Supreme Court',
  ];

  const stageBadge = (s) => {
    if (s === 'Under Investigation') return 'badge badge-ui';
    if (s === 'Pending Trial') return 'badge badge-pt';
    if (s === 'Pending Before High Court') return 'badge badge-hc';
    return 'badge badge-sc';
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header + Selector */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: "'Geist', sans-serif", fontSize: 26, letterSpacing: '0.08em', color: 'var(--white)', lineHeight: 1 }}>
              STEP 2: PROGRESS UPDATION & DYNAMIC CHECKLIST
            </div>
            <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--cyan)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3 }}>
              {isSupervisory ? 'Supervisory Audit Session' : `Officer Session: ${user?.username}`}
            </div>
          </div>
          <span className="badge badge-active">ACTIVE SESSION</span>
        </div>

        {/* Case selector */}
        <div>
          <div className="section-title" style={{ marginBottom: 6 }}>Select Case ID *</div>
          {loadingCases ? (
            <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, color: 'var(--dim)' }}>
              Loading cases...
            </div>
          ) : casesList.length === 0 ? (
            <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, color: 'var(--dim)' }}>
              No cases available.
            </div>
          ) : (
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="cyber-select"
            >
              {casesList.map(c => (
                <option key={c.unique_id} value={c.unique_id}>
                  {c.unique_id} - {c.crime_number} ({c.ps_limit}) [{c.current_stage}]
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Case summary strip */}
        {details && (
          <div style={{
            marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)',
            display: 'flex', gap: 16, flexWrap: 'wrap',
            fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11.5,
          }}>
            <span>Crime No: <strong style={{ color: 'var(--white)' }}>{details.case.crime_number}</strong></span>
            <span>PS: <strong style={{ color: 'var(--white)' }}>{details.case.ps_limit}</strong></span>
            <span>Stage: <span className={stageBadge(details.case.current_stage)} style={{ fontSize: 10 }}>{details.case.current_stage}</span></span>
            <span>Officer: <strong style={{ color: 'var(--cyan)' }}>{details.case.case_holding_officer_id}</strong></span>
          </div>
        )}
      </div>

      {error && <div className="cyber-alert">{error}</div>}
      {success && <div className="cyber-success">✔ {success}</div>}

      {details && (
        <>
          {/* Active Checklist */}
          <div className="glass-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <span className="section-cyan">Pending Action Checklist</span>
                <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--dim)', marginLeft: 8 }}>
                  ({details.active_actions.length} pending · Check items completed to archive on submit)
                </span>
              </div>
              {checkedIds.length > 0 && (
                <span className="badge badge-green">{checkedIds.length} marked for completion</span>
              )}
            </div>

            {details.active_actions.length === 0 ? (
              <div style={{ padding: 16, background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--green)', borderRadius: 10 }}>
                ✔ No pending action items for this case. Define new items under "Further Action" below.
              </div>
            ) : (
              <div style={{ border: '1px solid var(--border)', borderRadius: 10 }}>
                {details.active_actions.map(action => {
                  const isChecked = checkedIds.includes(action.id);
                  return (
                    <div
                      key={action.id}
                      className={`checklist-item ${isChecked ? 'done' : ''}`}
                      onClick={() => toggleCheck(action.id)}
                    >
                      <div className={`check-box ${isChecked ? 'checked' : ''}`}>
                        {isChecked && <span style={{ color: 'var(--cyan)', fontSize: 11.5, fontWeight: 700 }}>✓</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: 'var(--white)', textDecoration: isChecked ? 'line-through' : 'none' }}>
                          {action.task_description}
                        </div>
                        <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--faint)', marginTop: 2 }}>
                          Origin: {action.source_type} · Added: {action.created_at?.split(' ')[0]}
                        </div>
                      </div>
                      {isChecked && (
                        <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--green)', textTransform: 'uppercase' }}>
                          WILL ARCHIVE
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Progress Entry Form */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <div className="section-title" style={{ marginBottom: 16 }}>Record Progress Entry</div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div className="section-title" style={{ marginBottom: 6 }}>10 · Date of Progress *</div>
                <input
                  type="date"
                  value={progressDate}
                  onChange={e => setProgressDate(e.target.value)}
                  required
                  className="cyber-input"
                />
              </div>

              <div>
                <div className="section-title" style={{ marginBottom: 6 }}>11 · Details of Progress *</div>
                <textarea
                  value={progressText}
                  onChange={e => setProgressText(e.target.value)}
                  required
                  rows={4}
                  placeholder="Investigation narrative, forensic analysis results, court proceedings, remand orders..."
                  className="cyber-textarea"
                />
              </div>

              <div>
                <div className="section-title" style={{ marginBottom: 6 }}>12 · Next Reminder / Hearing Date</div>
                <input
                  type="date"
                  value={reminderDate}
                  onChange={e => setReminderDate(e.target.value)}
                  className="cyber-input"
                />
              </div>

              <div style={{ background: 'rgba(0,212,255,0.02)', border: '1px solid var(--cyan-dim)', padding: 14, borderRadius: 10 }}>
                <div className="section-cyan" style={{ marginBottom: 6 }}>
                  13 · Further Action To Be Taken (New Checklist Engine)
                </div>
                <textarea
                  value={furtherAction}
                  onChange={e => setFurtherAction(e.target.value)}
                  rows={3}
                  placeholder="Tasks entered here will automatically become the active checklist for subsequent updates:&#10;Await FSL report on hard disk image&#10;File response to High Court bail petition"
                  className="cyber-textarea"
                />
                <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--cyan)', marginTop: 4 }}>
                  ↑ Dynamic rollover: this entry automatically populates the next pending checklist.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div>
                  <div className="section-title" style={{ marginBottom: 6 }}>14 · Remarks</div>
                  <input
                    type="text"
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    placeholder="Confidential notes, inter-unit coordination..."
                    className="cyber-input"
                  />
                </div>
                <div>
                  <div className="section-title" style={{ marginBottom: 6 }}>Update Stage (Optional)</div>
                  <select
                    value={newStage}
                    onChange={e => setNewStage(e.target.value)}
                    className="cyber-select"
                  >
                    {stages.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--dim)' }}>
                  {checkedIds.length > 0 && `${checkedIds.length} task(s) marked for archival.`}
                </div>
                <button type="submit" disabled={submitting} className="btn-cyber-solid">
                  {submitting ? 'SUBMITTING...' : 'SUBMIT PROGRESS DATA'} <ArrowRight size={13} />
                </button>
              </div>
            </form>
          </div>

          {/* Historical Timeline */}
          {details.progress_history?.length > 0 && (
            <div className="glass-panel" style={{ padding: 24 }}>
              <div className="section-title" style={{ marginBottom: 16 }}>
                Investigation Audit Trail ({details.progress_history.length} entries)
              </div>
              <div>
                {details.progress_history.map(ph => (
                  <div key={ph.id} className="timeline-node">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, fontWeight: 700, color: 'var(--amber)' }}>
                        {ph.progress_date}
                      </span>
                      <span className={stageBadge(ph.stage_at_update)} style={{ fontSize: 10 }}>{ph.stage_at_update}</span>
                      <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--dim)' }}>
                        IO: {ph.officer_name || ph.officer_id}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--white)', lineHeight: 1.5, margin: '4px 0 6px' }}>
                      {ph.progress_details}
                    </p>
                    {ph.further_action && (
                      <div style={{ background: 'rgba(0,212,255,0.03)', borderLeft: '2px solid var(--cyan)', padding: '5px 10px', marginTop: 4 }}>
                        <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--cyan)' }}>Action Queued: </span>
                        <span style={{ fontSize: 11, color: 'var(--white)' }}>{ph.further_action}</span>
                      </div>
                    )}
                    {ph.reminder_date && (
                      <div style={{ marginTop: 4, fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--amber)' }}>
                        Scheduled: {ph.reminder_date}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
