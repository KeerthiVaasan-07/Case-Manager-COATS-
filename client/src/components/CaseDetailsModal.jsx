import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function CaseDetailsModal({ caseUniqueId, onClose, onUpdateProgress }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!caseUniqueId) return;
    async function load() {
      setLoading(true);
      try { setData(await api.getCaseById(caseUniqueId)); }
      catch (e) { setError(e.message); }
      finally { setLoading(false); }
    }
    load();
  }, [caseUniqueId]);

  if (!caseUniqueId) return null;

  const stageClass = (s) => {
    if (s === 'Under Investigation') return 'stamp-amber';
    if (s === 'Pending Trial') return 'stamp-blue';
    if (s === 'Pending Before High Court') return 'stamp-purple';
    if (s === 'Pending Before Supreme Court') return 'stamp-red';
    return 'stamp-amber';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}>
      <div className="section-block w-full" style={{ maxWidth: 860, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Modal Header */}
        <div className="section-header flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl tracking-widest text-ats-amber">{caseUniqueId}</span>
            <span className="stamp stamp-red" style={{ fontSize: 10 }}>TOP SECRET // ATS RESTRICTED</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="btn-ghost py-1 text-[10.5px]">⎙ Print Dossier</button>
            {onUpdateProgress && data && (
              <button onClick={() => { onClose(); onUpdateProgress(data.case.unique_id); }}
                className="btn-primary py-1 text-[10.5px]">
                Open in Progress Updation →
              </button>
            )}
            <button onClick={onClose} className="btn-ghost py-1 text-[10.5px]">× CLOSE</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-0">
          {loading ? (
            <div className="p-8 font-mono text-[11px] text-ink-faint">Loading police dossier…</div>
          ) : error ? (
            <div className="alert-box m-4">{error}</div>
          ) : data ? (
            <>
              {/* Official letterhead */}
              <div className="bg-page-3 border-b border-border p-4 text-center">
                <div className="font-mono text-[10.5px] tracking-[0.14em] text-ink-dim uppercase">
                  Government of Tamil Nadu · Police Department · Anti Terrorism Squad
                </div>
                <div className="font-mono text-[10.5px] tracking-[0.14em] text-ink-dim uppercase mt-0.5">
                  Official Classified Case Dossier — Internal Record
                </div>
              </div>

              {/* Fields */}
              {[
                ['Unique Case ID', <span className="case-id">{data.case.unique_id}</span>],
                ['Crime Number', data.case.crime_number],
                ['PS Limit', data.case.ps_limit],
                ['Section of Law', data.case.section_of_law],
                ['Date of Occurrence', data.case.date_of_occurrence],
                ['Date of Registration', data.case.date_of_registration],
                ['First Updation', data.case.date_of_first_updation],
                ['Complainant', data.case.complainant_name],
                ['Current Stage', <span className={`stamp ${stageClass(data.case.current_stage)}`}>{data.case.current_stage}</span>],
                ['Case Holding Officer', `${data.case.case_holding_officer_id} — ${data.case.case_holding_officer_name}`],
                ['Branch', data.case.branch],
                ['Details of Accused', <pre className="whitespace-pre-wrap font-sans text-[12px]">{data.case.accused_details}</pre>],
                ['Gist of Case', <p className="leading-relaxed text-[12.5px]">{data.case.gist_of_case}</p>],
              ].map(([label, val]) => (
                <div className="field-row" key={label}>
                  <div className="field-label">{label}</div>
                  <div className="field-value">{val}</div>
                </div>
              ))}

              {/* Active actions */}
              <div className="field-row" style={{ gridTemplateColumns: '160px 1fr' }}>
                <div className="field-label">Active Checklist</div>
                <div className="field-value p-0">
                  {data.active_actions.length === 0 ? (
                    <div className="p-3 font-mono text-[11px]" style={{ color: 'var(--green-bright)' }}>✔ No pending actions.</div>
                  ) : (
                    data.active_actions.map(a => (
                      <div key={a.id} className="flex items-start gap-2 px-3 py-2 border-b border-border text-[12px]">
                        <span className="mt-1 w-1.5 h-1.5 flex-shrink-0" style={{ background: 'var(--amber-dim)' }} />
                        <span>{a.task_description}</span>
                        <span className="ml-auto font-mono text-[10.5px] text-ink-faint">{a.source_type}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Progress History */}
              {data.progress_history.length > 0 && (
                <div>
                  <div className="section-header border-t border-border">
                    <span className="section-title">Progress Audit Trail ({data.progress_history.length} entries)</span>
                  </div>
                  <div className="p-4 space-y-4">
                    {data.progress_history.map(p => (
                      <div key={p.id} className="progress-entry relative">
                        <div className="font-mono text-[11px] flex items-center gap-3 mb-1">
                          <strong className="text-ats-amber">{p.progress_date}</strong>
                          <span className={`stamp ${stageClass(p.stage_at_update)}`}>{p.stage_at_update}</span>
                          <span className="text-ink-dim">IO: {p.officer_name || p.officer_id}</span>
                        </div>
                        <p className="text-[12.5px] leading-relaxed mb-1.5">{p.progress_details}</p>
                        {p.further_action && (
                          <div className="font-mono text-[11px] text-ink-dim mb-1">
                            <strong className="text-ats-amber">Further Action: </strong>{p.further_action}
                          </div>
                        )}
                        <div className="font-mono text-[10.5px] text-ink-faint flex gap-4">
                          {p.reminder_date && <span>Reminder: <strong style={{ color: 'var(--amber)' }}>{p.reminder_date}</strong></span>}
                          {p.remarks && <span>Remarks: {p.remarks}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-page-3 flex-shrink-0">
          <span className="font-mono text-[10.5px] text-ink-faint">INTERNAL ATS CONFIDENTIAL — DO NOT CIRCULATE</span>
          <button onClick={onClose} className="btn-ghost py-1 text-[10.5px]">Close</button>
        </div>
      </div>
    </div>
  );
}
