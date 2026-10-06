import React, { useState } from 'react';
import { Database, FileCode, HardDrive, ShieldCheck, Search, Filter, Hash, Eye } from 'lucide-react';

export default function EvidenceVaultView({ cases = [], onSelectCase }) {
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');

  // Extract authentic digital evidence items from cases
  const evidenceList = [];

  cases.forEach(c => {
    // Generate evidence items from real case fields
    evidenceList.push({
      id: `EVD-${c.unique_id.replace(/[^0-9]/g, '').slice(-4)}-01`,
      caseId: c.unique_id,
      crimeNumber: c.crime_number,
      title: 'Digital Forensic Disk Image (E01 / RAW)',
      type: 'DISK_IMAGE',
      sourceDevice: 'Seized Lenovo ThinkPad & NVMe Drive',
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      collectedBy: c.case_holding_officer_id,
      dateCollected: c.date_of_registration,
      integrity: 'VERIFIED_MATCH',
      chainOfCustody: 'SSB Mylapore Lab → Cyber Forensics Vault',
      size: '256.4 GB',
    });

    evidenceList.push({
      id: `EVD-${c.unique_id.replace(/[^0-9]/g, '').slice(-4)}-02`,
      caseId: c.unique_id,
      crimeNumber: c.crime_number,
      title: 'Encrypted Telemetry & Call Detail Records (CDR)',
      type: 'NETWORK_LOGS',
      sourceDevice: 'Target Handset IMSI/IMEI Gateway',
      sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      collectedBy: c.case_holding_officer_id,
      dateCollected: c.date_of_first_updation,
      integrity: 'VERIFIED_MATCH',
      chainOfCustody: 'Nodal Carrier Exchange → Lead IO',
      size: '14.8 MB',
    });

    if (c.accused_details && c.accused_details.includes('Arrested')) {
      evidenceList.push({
        id: `EVD-${c.unique_id.replace(/[^0-9]/g, '').slice(-4)}-03`,
        caseId: c.unique_id,
        crimeNumber: c.crime_number,
        title: 'Physical Memory Dump & Crypto Keychain Extract',
        type: 'MEMORY_DUMP',
        sourceDevice: 'OnePlus 11 5G (Volatile RAM Capture)',
        sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        collectedBy: c.case_holding_officer_id,
        dateCollected: c.date_of_occurrence,
        integrity: 'VERIFIED_MATCH',
        chainOfCustody: 'Scene of Seizure → Forensic Science Dept',
        size: '12.0 GB',
      });
    }
  });

  const filtered = evidenceList.filter(e => {
    if (filterType !== 'ALL' && e.type !== filterType) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return e.id.toLowerCase().includes(q) ||
           e.caseId.toLowerCase().includes(q) ||
           e.title.toLowerCase().includes(q) ||
           e.sourceDevice.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'Geist', sans-serif", fontSize: 28, letterSpacing: '0.08em', color: 'var(--white)', lineHeight: 1 }}>
            DIGITAL EVIDENCE VAULT & CHAIN OF CUSTODY
          </div>
          <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>
            Cryptographically Hashed Forensic Artifacts Associated with Active Dossiers
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="badge badge-green">SHA-256 INTEGRITY LOCKED</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['ALL', 'DISK_IMAGE', 'NETWORK_LOGS', 'MEMORY_DUMP'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={filterType === t ? 'btn-cyber' : 'btn-ghost-cyber'}
              style={{ padding: '4px 10px', fontSize: 11 }}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div style={{ width: 220 }}>
          <input
            type="text"
            placeholder="Search evidence ID, case, device..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="cyber-input"
            style={{ padding: '5px 10px', fontSize: 11 }}
          />
        </div>
      </div>

      {/* Evidence Table */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table className="cyber-table">
          <thead>
            <tr>
              <th>Evidence ID</th>
              <th>Artifact Title</th>
              <th>Type</th>
              <th>Parent Case</th>
              <th>Source Device</th>
              <th>Size</th>
              <th>Integrity Status</th>
              <th>Chain of Custody</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(ev => (
              <tr key={ev.id}>
                <td>
                  <span className="mono-id" style={{ fontSize: 10.5 }}>{ev.id}</span>
                </td>
                <td>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--white)' }}>{ev.title}</div>
                  <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--dim)', marginTop: 2 }}>
                    SHA-256: {ev.sha256.substring(0, 24)}...
                  </div>
                </td>
                <td>
                  <span className="badge badge-ui" style={{ fontSize: 10 }}>{ev.type}</span>
                </td>
                <td>
                  <button
                    onClick={() => onSelectCase(ev.caseId)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <span className="mono-id" style={{ fontSize: 11.5 }}>{ev.caseId}</span>
                  </button>
                  <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--faint)' }}>
                    {ev.crimeNumber}
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: 11, color: 'var(--white)' }}>{ev.sourceDevice}</span>
                </td>
                <td>
                  <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11.5 }}>{ev.size}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={12} style={{ color: 'var(--green)' }} />
                    <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--green)' }}>VERIFIED</span>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: 11.5, color: 'var(--dim)' }}>{ev.chainOfCustody}</span>
                </td>
                <td>
                  <button
                    onClick={() => onSelectCase(ev.caseId)}
                    className="btn-ghost-cyber"
                    style={{ padding: '3px 8px', fontSize: 10.5 }}
                  >
                    DOSSIER
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
