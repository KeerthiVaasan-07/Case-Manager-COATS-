import React from 'react';
import { Cpu, HardDrive, ShieldCheck, Search, Activity, FileCheck, ArrowRight } from 'lucide-react';

export default function ForensicsView({ cases = [] }) {
  const steps = [
    { name: '1. ACQUISITION', desc: 'Bitstream disk mirroring (E01/DD), write-blocker isolation', status: 'ACTIVE' },
    { name: '2. VERIFICATION', desc: 'SHA-256 / MD5 cryptographic digest cross-verification', status: 'STANDBY' },
    { name: '3. ANALYSIS', desc: 'File carving, registry timeline, encrypted keys extraction', status: 'IN_PROGRESS' },
    { name: '4. CORRELATION', desc: 'Multi-device telephony cross-referencing & CDR analysis', status: 'STANDBY' },
    { name: '5. REPORTING', desc: 'Forensic Science Dept expert certification Sec 65B IEA', status: 'READY' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ fontFamily: "'Geist', sans-serif", fontSize: 28, letterSpacing: '0.08em', color: 'var(--white)', lineHeight: 1 }}>
          DIGITAL FORENSICS LAB & INVESTIGATION PIPELINE
        </div>
        <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>
          Live Forensic Processing Framework (Tamil Nadu ATS Cyber Division)
        </div>
      </div>

      {/* Pipeline Visualizer */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div className="section-cyan" style={{ marginBottom: 16 }}>
          Standard Cyber Forensic Pipeline
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {steps.map((s, idx) => (
            <div
              key={s.name}
              style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                padding: 14, position: 'relative', borderRadius: 10 }}
            >
              <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11.5, fontWeight: 700, color: 'var(--cyan)' }}>
                {s.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 6, lineHeight: 1.4 }}>
                {s.desc}
              </div>
              <div style={{ marginTop: 10 }}>
                <span className="badge badge-active" style={{ fontSize: 10 }}>{s.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Lab Processing Units */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        <div className="glass-panel" style={{ padding: 20 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Active Forensic Workstations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['ATS-WS-01 (Mylapore)', 'FTK Imager 4.7 & Volatility Framework 3.0', 'ONLINE - 48 Cores / 128GB RAM'],
              ['ATS-WS-02 (Coimbatore)', 'Cellebrite UFED Physical Analyzer v7.68', 'BUSY - Handset Telemetry Extract'],
              ['ATS-WS-03 (Madurai)', 'EnCase Forensic v22 / Magnet AXIOM', 'ONLINE - Ready for image ingest'],
            ].map(([ws, sw, st]) => (
              <div key={ws} style={{ padding: '8px 12px', background: 'rgba(6,11,20,0.6)', border: '1px solid var(--border)', borderRadius: 10 }}>
                <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, fontWeight: 700, color: 'var(--white)' }}>{ws}</div>
                <div style={{ fontSize: 10.5, color: 'var(--dim)', marginTop: 2 }}>{sw}</div>
                <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--green)', marginTop: 2 }}>● {st}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 20 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Forensic Evidence Backlog</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cases.slice(0, 3).map(c => (
              <div key={c.unique_id} style={{ padding: '8px 12px', background: 'rgba(6,11,20,0.6)', border: '1px solid var(--border)', borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="mono-id" style={{ fontSize: 10.5 }}>{c.unique_id}</span>
                  <span className="badge badge-ui" style={{ fontSize: 9.5 }}>{c.current_stage}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--white)', marginTop: 4 }}>{c.section_of_law}</div>
                <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>Officer: {c.case_holding_officer_id}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
