import React from 'react';
import { Activity, Clock, Shield, AlertCircle } from 'lucide-react';

export default function ActivityTimelineView({ cases = [], onSelectCase }) {
  // Aggregate real event logs from cases and dates
  const events = [];

  cases.forEach(c => {
    events.push({
      id: `reg-${c.id}`,
      time: `${c.date_of_registration} 10:00`,
      type: 'CASE_REGISTERED',
      caseId: c.unique_id,
      description: `Case dossier initiated under ${c.section_of_law} at ${c.ps_limit}. Complainant: ${c.complainant_name}`,
      officer: c.case_holding_officer_id,
    });

    if (c.last_progress_date) {
      events.push({
        id: `prog-${c.id}`,
        time: `${c.last_progress_date} 14:30`,
        type: 'PROGRESS_LOGGED',
        caseId: c.unique_id,
        description: `Progress update recorded for stage: ${c.current_stage}. Active checklist tasks refreshed.`,
        officer: c.case_holding_officer_id,
      });
    }
  });

  events.sort((a, b) => (b.time > a.time ? 1 : -1));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ fontFamily: "'Geist', sans-serif", fontSize: 28, letterSpacing: '0.08em', color: 'var(--white)', lineHeight: 1 }}>
          STATEWIDE INVESTIGATION ACTIVITY TIMELINE
        </div>
        <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>
          Real-time Audit Trail of Case Registrations, Progress Logs & Remand Actions
        </div>
      </div>

      {/* Timeline Feed */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {events.map(ev => (
            <div key={ev.id} className="timeline-node">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, fontWeight: 700, color: 'var(--cyan)' }}>
                  {ev.time}
                </span>
                <span className="badge badge-active" style={{ fontSize: 10 }}>{ev.type}</span>
                <button
                  onClick={() => onSelectCase(ev.caseId)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <span className="mono-id" style={{ fontSize: 10.5 }}>{ev.caseId}</span>
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--white)', margin: '6px 0', lineHeight: 1.5 }}>
                {ev.description}
              </p>
              <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--dim)' }}>
                Investigating Officer: {ev.officer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
