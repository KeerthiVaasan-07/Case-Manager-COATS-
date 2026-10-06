import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';

export default function GlobalSearch({ isOpen, onClose, onSelectCase }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQ(''); setResults([]); setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  useEffect(() => {
    clearTimeout(timer.current);
    if (!q.trim()) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.getCases({ search: q.trim() });
        setResults(data.slice(0, 8));
        setSelected(0);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 250);
  }, [q]);

  if (!isOpen) return null;

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') setSelected(s => Math.min(s + 1, results.length - 1));
    else if (e.key === 'ArrowUp') setSelected(s => Math.max(s - 1, 0));
    else if (e.key === 'Enter' && results[selected]) { onSelectCase(results[selected].unique_id); onClose(); }
    else if (e.key === 'Escape') onClose();
  };

  const stageBadge = (s) => {
    if (s === 'Under Investigation') return 'badge badge-ui';
    if (s === 'Pending Trial') return 'badge badge-pt';
    if (s === 'Pending Before High Court') return 'badge badge-hc';
    return 'badge badge-sc';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 no-print"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass-panel w-full" style={{ maxWidth: 620 }}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <Search size={14} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search cases by ID, crime number, PS limit, accused..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--white)', fontFamily: "'Geist', system-ui, sans-serif", fontSize: 13,
            }}
          />
          {loading && <div className="cyber-pulse w-2.5 h-2.5 rounded-full" style={{ background: 'var(--cyan)' }} />}
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </div>

        {results.length > 0 && (
          <div>
            <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="section-title">{results.length} Case{results.length !== 1 ? 's' : ''} Found</span>
            </div>
            {results.map((c, i) => (
              <div
                key={c.unique_id}
                onClick={() => { onSelectCase(c.unique_id); onClose(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                  borderBottom: '1px solid var(--border)',
                  background: i === selected ? 'rgba(0,212,255,0.06)' : 'transparent',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setSelected(i)}
              >
                <FileText size={13} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mono-id" style={{ fontSize: 11 }}>{c.unique_id}</div>
                  <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 1 }}>{c.crime_number} · {c.ps_limit}</div>
                </div>
                <span className={stageBadge(c.current_stage)} style={{ fontSize: 10.5 }}>{c.current_stage}</span>
                <ChevronRight size={12} style={{ color: 'var(--faint)' }} />
              </div>
            ))}
          </div>
        )}

        {q && !loading && results.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--dim)', fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11 }}>
            No cases match "{q}"
          </div>
        )}

        <div style={{ padding: '8px 16px', display: 'flex', gap: 14, borderTop: results.length ? '1px solid var(--border)' : 'none' }}>
          {[['Up/Down', 'Navigate'], ['Enter', 'Open'], ['Esc', 'Close']].map(([key, label]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--dim)', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', border: '1px solid var(--border-b)', borderRadius: 10 }}>{key}</span>
              <span style={{ fontSize: 11.5, color: 'var(--faint)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
