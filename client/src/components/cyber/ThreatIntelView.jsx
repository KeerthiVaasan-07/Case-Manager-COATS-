import React from 'react';
import { ShieldAlert, Globe, Server, Terminal, Lock, Key, Crosshair } from 'lucide-react';

export default function ThreatIntelView({ cases = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ fontFamily: "'Geist', sans-serif", fontSize: 28, letterSpacing: '0.08em', color: 'var(--white)', lineHeight: 1 }}>
          THREAT INTELLIGENCE & ATTACK MATRIX
        </div>
        <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>
          Indicators of Compromise (IOC) & MITRE ATT&CK Mapping
        </div>
      </div>

      {/* MITRE ATT&CK Matrix Cards */}
      <div className="glass-panel" style={{ padding: 22 }}>
        <div className="section-cyan" style={{ marginBottom: 14 }}>
          MITRE ATT&CK Correlated Tactics & Techniques
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { id: 'T1566', name: 'Phishing', desc: 'Spearphishing attachments delivering malicious APKs / encrypted PDFs', tactic: 'Initial Access' },
            { id: 'T1071', name: 'Application Layer Protocol', desc: 'Clandestine botnet comms routed over Telegram & Signal webhooks', tactic: 'Command & Control' },
            { id: 'T1078', name: 'Valid Accounts', desc: 'Compromised administrative credentials & mule account identities', tactic: 'Defense Evasion' },
            { id: 'T1005', name: 'Data from Local System', desc: 'Encrypted flash storage and automated phonebook extraction', tactic: 'Collection' },
          ].map(m => (
            <div key={m.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: 12, borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono-id" style={{ fontSize: 11 }}>{m.id}</span>
                <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--amber)' }}>{m.tactic}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--white)', marginTop: 4 }}>{m.name}</div>
              <div style={{ fontSize: 10.5, color: 'var(--dim)', marginTop: 4, lineHeight: 1.4 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active IOC Feeds */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        <div className="glass-panel" style={{ padding: 20 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Observed IP / Domain Indicators</div>
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Indicator</th>
                <th>Classification</th>
                <th>Reputation</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['185.220.101.5', 'TOR Exit Relay', 'HIGH RISK'],
                ['194.26.29.112', 'Bulletproof Host (C2)', 'CRITICAL'],
                ['msg-transit-node.net', 'Dynamic DNS Node', 'MALICIOUS'],
                ['cdn-auth-check.xyz', 'Credential Harvester', 'HIGH RISK'],
              ].map(([i, c, r]) => (
                <tr key={i}>
                  <td><span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--white)' }}>{i}</span></td>
                  <td><span style={{ fontSize: 10.5, color: 'var(--dim)' }}>{c}</span></td>
                  <td>
                    <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: r === 'CRITICAL' ? 'var(--red)' : 'var(--amber)' }}>
                      ● {r}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass-panel" style={{ padding: 20 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Active Case Threat Ties</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cases.map(c => (
              <div key={c.unique_id} style={{ padding: '8px 12px', background: 'rgba(6,11,20,0.6)', border: '1px solid var(--border)', borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="mono-id" style={{ fontSize: 10.5 }}>{c.unique_id}</span>
                  <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--cyan)' }}>{c.branch}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--white)', marginTop: 3 }}>{c.crime_number}</div>
                <div style={{ fontSize: 11.5, color: 'var(--dim)', marginTop: 2 }}>{c.section_of_law}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
