import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CaseRegistration({ onSuccess, onCancel }) {
  const { user, isSupervisory, allOfficers } = useAuth();

  const [form, setForm] = useState({
    ps_limit: '',
    crime_number: '',
    section_of_law: '',
    date_of_occurrence: '',
    date_of_registration: '',
    complainant_name: '',
    accused_details: '',
    gist_of_case: '',
    current_stage: 'Under Investigation',
    case_holding_officer_id: user?.username || '',
    action_to_be_taken: '',
    date_of_first_updation: new Date().toISOString().split('T')[0],
    branch: user?.branch || 'CNI',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const stages = [
    'Under Investigation',
    'Pending Trial',
    'Pending Before High Court',
    'Pending Before Supreme Court',
  ];

  const presets = [
    'Sec 16, 18, 20 UAPA r/w 120B IPC',
    'Sec 15, 16 UAPA & Explosive Substances Act',
    'Sec 18, 38, 39 UAPA & Sec 153A IPC',
    'Sec 17, 18, 40 UAPA (Terror Financing)',
    'Sec 16, 18 UAPA & Sec 25(1AA) Arms Act',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.createCase(form);
      setResult(res);
      if (onSuccess) onSuccess(res.case);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="glass-panel" style={{ maxWidth: 700, margin: '0 auto', padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <CheckCircle2 size={24} style={{ color: 'var(--green)' }} />
          <span className="section-cyan">Case Successfully Registered</span>
        </div>

        <div style={{ fontFamily: "'Geist', sans-serif", fontSize: 56, letterSpacing: '0.08em', color: 'var(--cyan)' }}>
          {result.case.unique_id}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: 16, margin: '20px 0', display: 'flex', flexDirection: 'column', gap: 8, borderRadius: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="section-title">Crime Number</span>
            <span style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>{result.case.crime_number}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="section-title">Police Station</span>
            <span>{result.case.ps_limit}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="section-title">Assigned Officer</span>
            <span style={{ color: 'var(--cyan)' }}>{result.case.case_holding_officer_id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="section-title">Initial Tasks</span>
            <span>{result.active_actions?.length || 0} registered</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => {
              setResult(null);
              setForm({
                ps_limit: '', crime_number: '', section_of_law: '',
                date_of_occurrence: '', date_of_registration: '', complainant_name: '',
                accused_details: '', gist_of_case: '', current_stage: 'Under Investigation',
                case_holding_officer_id: user?.username || '', action_to_be_taken: '',
                date_of_first_updation: new Date().toISOString().split('T')[0],
                branch: user?.branch || 'CNI',
              });
            }}
            className="btn-ghost-cyber"
          >
            Register Another Case
          </button>
          <button
            onClick={() => { if (onSuccess) onSuccess(result.case); }}
            className="btn-cyber-solid"
          >
            Proceed to Step 2: Progress Updation <ArrowRight size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Geist', sans-serif", fontSize: 26, letterSpacing: '0.08em', color: 'var(--white)', lineHeight: 1 }}>
              STEP 1: BASIC CASE REGISTRATION
            </div>
            <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--cyan)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3 }}>
              First-time case intake · Unique ATS ID will be auto-generated
            </div>
          </div>
          <span className="badge badge-ui">NEW FIR</span>
        </div>

        {error && <div className="cyber-alert" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* PS Limit & Crime Number */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div>
              <div className="section-title" style={{ marginBottom: 6 }}>01 · PS Limit *</div>
              <input
                type="text"
                value={form.ps_limit}
                onChange={e => set('ps_limit', e.target.value)}
                required
                placeholder="e.g. B-1 North Beach PS / ATS Chennai"
                className="cyber-input"
              />
            </div>
            <div>
              <div className="section-title" style={{ marginBottom: 6 }}>02 · Crime Number *</div>
              <input
                type="text"
                value={form.crime_number}
                onChange={e => set('crime_number', e.target.value)}
                required
                placeholder="e.g. Cr. No. 05/2026"
                className="cyber-input"
              />
            </div>
          </div>

          {/* Section of Law */}
          <div>
            <div className="section-title" style={{ marginBottom: 6 }}>03 · Section of Law *</div>
            <input
              type="text"
              value={form.section_of_law}
              onChange={e => set('section_of_law', e.target.value)}
              required
              placeholder="e.g. Sec 16, 18, 20 UAPA r/w 120B IPC"
              className="cyber-input"
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {presets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => set('section_of_law', form.section_of_law ? `${form.section_of_law}; ${p}` : p)}
                  style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                    color: 'var(--dim)', padding: '2px 8px', fontSize: 10.5,
                    fontFamily: "'Geist', system-ui, sans-serif", cursor: 'pointer', borderRadius: 10 }}
                >
                  + {p}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <div>
              <div className="section-title" style={{ marginBottom: 6 }}>04 · Occurrence Date</div>
              <input
                type="date"
                value={form.date_of_occurrence}
                onChange={e => set('date_of_occurrence', e.target.value)}
                className="cyber-input"
              />
            </div>
            <div>
              <div className="section-title" style={{ marginBottom: 6 }}>05 · Registration Date</div>
              <input
                type="date"
                value={form.date_of_registration}
                onChange={e => set('date_of_registration', e.target.value)}
                className="cyber-input"
              />
            </div>
            <div>
              <div className="section-title" style={{ marginBottom: 6 }}>11 · First Updation Date</div>
              <input
                type="date"
                value={form.date_of_first_updation}
                onChange={e => set('date_of_first_updation', e.target.value)}
                className="cyber-input"
              />
            </div>
          </div>

          {/* Complainant */}
          <div>
            <div className="section-title" style={{ marginBottom: 6 }}>06 · Complainant Name</div>
            <input
              type="text"
              value={form.complainant_name}
              onChange={e => set('complainant_name', e.target.value)}
              placeholder="e.g. SI Special Intelligence Wing"
              className="cyber-input"
            />
          </div>

          {/* Accused */}
          <div>
            <div className="section-title" style={{ marginBottom: 6 }}>07 · Details of Accused</div>
            <textarea
              value={form.accused_details}
              onChange={e => set('accused_details', e.target.value)}
              rows={2}
              placeholder="A1: Name (Remanded)&#10;A2: Name (Absconding)"
              className="cyber-textarea"
            />
          </div>

          {/* Gist */}
          <div>
            <div className="section-title" style={{ marginBottom: 6 }}>08 · Gist of Case *</div>
            <textarea
              value={form.gist_of_case}
              onChange={e => set('gist_of_case', e.target.value)}
              required
              rows={3}
              placeholder="Brief summary of conspiracy, seized digital evidence, modus operandi..."
              className="cyber-textarea"
            />
          </div>

          {/* Stage, Officer, Branch */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div>
              <div className="section-title" style={{ marginBottom: 6 }}>09 · Current Stage *</div>
              <select
                value={form.current_stage}
                onChange={e => set('current_stage', e.target.value)}
                className="cyber-select"
              >
                {stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <div className="section-title" style={{ marginBottom: 6 }}>10 · Case Holding Officer *</div>
              {isSupervisory ? (
                <select
                  value={form.case_holding_officer_id}
                  onChange={e => set('case_holding_officer_id', e.target.value)}
                  className="cyber-select"
                >
                  {allOfficers.filter(o => o.role === 'CASE_HOLDING').map(o => (
                    <option key={o.username} value={o.username}>
                      {o.username} - {o.name} ({o.branch})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  readOnly
                  value={`${user?.username} - ${user?.name}`}
                  className="cyber-input"
                />
              )}
            </div>

            <div>
              <div className="section-title" style={{ marginBottom: 6 }}>Branch / Unit</div>
              <select
                value={form.branch}
                onChange={e => set('branch', e.target.value)}
                disabled={!isSupervisory}
                className="cyber-select"
              >
                <option value="CNI">Chennai (CNI)</option>
                <option value="MDU">Madurai (MDU)</option>
                <option value="CMB">Coimbatore (CMB)</option>
                <option value="HQ">Headquarters (HQ)</option>
              </select>
            </div>
          </div>

          {/* Action To Be Taken */}
          <div>
            <div className="section-title" style={{ marginBottom: 6 }}>12 · Action To Be Taken (Initial Checklist)</div>
            <textarea
              value={form.action_to_be_taken}
              onChange={e => set('action_to_be_taken', e.target.value)}
              rows={3}
              placeholder="Enter tasks separated by new lines or semicolons:&#10;Analyze seized mobile handsets&#10;File remand extension application"
              className="cyber-textarea"
            />
            <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--faint)', marginTop: 4 }}>
              These tasks will populate the active Action Checklist for Step 2: Progress Updation.
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            {onCancel && (
              <button type="button" onClick={onCancel} className="btn-ghost-cyber">
                Cancel
              </button>
            )}
            <div style={{ marginLeft: 'auto' }}>
              <button type="submit" disabled={loading} className="btn-cyber-solid">
                {loading ? 'RECORDING...' : 'REGISTER CASE IN DATABASE'} <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
