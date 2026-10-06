import React, { useState, useEffect } from 'react';
import { Brain, ArrowRight, ShieldAlert, CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AIAssistant() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pipelineStep, setPipelineStep] = useState(0);

  const steps = [
    'COLLECTING CASE DOSSIER',
    'ANALYZING EVIDENCE & PROGRESS',
    'CORRELATING TIMELINES',
    'IDENTIFYING RISK FACTORS',
    'GENERATING INVESTIGATION INSIGHTS',
  ];

  useEffect(() => {
    async function load() {
      try {
        const cs = await api.getCases();
        setCases(cs);
        if (cs.length > 0) setSelectedCaseId(cs[0].unique_id);
      } catch (err) { setError(err.message); }
    }
    load();
  }, []);

  const runAnalysis = async () => {
    if (!selectedCaseId) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setPipelineStep(0);

    const stepTimer = setInterval(() => {
      setPipelineStep(s => (s < steps.length - 1 ? s + 1 : s));
    }, 450);

    try {
      const token = localStorage.getItem('coats_token');
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ case_id: selectedCaseId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'AI analysis request failed');
      setAnalysis(json);
    } catch (err) {
      setError(err.message);
    } finally {
      clearInterval(stepTimer);
      setLoading(false);
    }
  };

  const riskColor = (lvl) => {
    if (lvl === 'CRITICAL') return 'var(--red)';
    if (lvl === 'HIGH') return 'var(--amber)';
    if (lvl === 'MEDIUM') return 'var(--blue)';
    return 'var(--green)';
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 6,
            background: 'rgba(0,212,255,0.12)',
            border: '1px solid var(--cyan)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain size={20} style={{ color: 'var(--cyan)' }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Geist', sans-serif", fontSize: 26, letterSpacing: '0.08em', color: 'var(--white)' }}>
              COATS AI INVESTIGATION ENGINE
            </div>
            <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Deterministic Case Analysis & Action Prioritization
            </div>
          </div>
        </div>

        {/* Case Selector + Action */}
        <div style={{ display: 'flex', gap: 12, marginTop: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <select
              value={selectedCaseId}
              onChange={e => setSelectedCaseId(e.target.value)}
              className="cyber-select"
            >
              {cases.map(c => (
                <option key={c.unique_id} value={c.unique_id}>
                  {c.unique_id} - {c.crime_number} ({c.current_stage})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={runAnalysis}
            disabled={loading || !selectedCaseId}
            className="btn-cyber-solid"
          >
            {loading ? 'ANALYZING...' : 'RUN AI ANALYSIS'} <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Loading Pipeline Animation */}
      {loading && (
        <div className="glass-panel" style={{ padding: '24px 28px' }}>
          <div className="section-cyan" style={{ marginBottom: 14 }}>
            Executing Investigation Pipeline
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {steps.map((stepLabel, idx) => {
              const isCurrent = idx === pipelineStep;
              const isDone = idx < pipelineStep;
              return (
                <div key={stepLabel} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: `1.5px solid ${isDone ? 'var(--green)' : isCurrent ? 'var(--cyan)' : 'var(--faint)'}`,
                    background: isDone ? 'rgba(34,197,94,0.2)' : isCurrent ? 'rgba(0,212,255,0.2)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {isDone && <CheckCircle2 size={11} style={{ color: 'var(--green)' }} />}
                    {isCurrent && <div className="cyber-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)' }} />}
                  </div>
                  <span style={{
                    fontFamily: "'Geist', system-ui, sans-serif",
                    fontSize: 11.5,
                    fontWeight: isCurrent ? 700 : 500,
                    letterSpacing: '0.1em',
                    color: isDone ? 'var(--dim)' : isCurrent ? 'var(--cyan)' : 'var(--faint)',
                  }}>
                    {stepLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && <div className="cyber-alert">{error}</div>}

      {/* Results */}
      {analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Top Summary + Risk Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <div className="stat-card" style={{ borderTopColor: riskColor(analysis.risk_level) }}>
              <div className="stat-label">ASSESSED RISK LEVEL</div>
              <div className="stat-num" style={{ color: riskColor(analysis.risk_level), fontSize: 44 }}>
                {analysis.risk_level}
              </div>
              <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--dim)', marginTop: 4 }}>
                Based on stage + progress cadence
              </div>
            </div>

            <div className="stat-card amber">
              <div className="stat-label">PENDING ACTION BACKLOG</div>
              <div className="stat-num" style={{ fontSize: 44 }}>
                {analysis.pending_actions.length}
              </div>
              <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--dim)', marginTop: 4 }}>
                {analysis.completed_actions_count} tasks archived
              </div>
            </div>

            <div className="stat-card cyan">
              <div className="stat-label">TOTAL PROGRESS ENTRIES</div>
              <div className="stat-num" style={{ fontSize: 44 }}>
                {analysis.progress_entries_count}
              </div>
              <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--dim)', marginTop: 4 }}>
                {analysis.days_since_last_progress !== null
                  ? `${analysis.days_since_last_progress} days since last update`
                  : 'Initial stage'}
              </div>
            </div>
          </div>

          {/* Narrative Summary */}
          <div className="glass-panel" style={{ padding: 18 }}>
            <div className="section-title">Case Narrative Synthesis</div>
            <p style={{ marginTop: 8, fontSize: 13, color: 'var(--white)', lineHeight: 1.6, margin: 0 }}>
              {analysis.summary}
            </p>
            {analysis.stage_info && (
              <div style={{ marginTop: 10, fontFamily: "'Geist', system-ui, sans-serif", fontSize: 11, color: 'var(--cyan)' }}>
                Stage Context: {analysis.stage_info}
              </div>
            )}
          </div>

          {/* Risk Factors */}
          {analysis.risk_factors.length > 0 && (
            <div className="glass-panel" style={{ padding: 18 }}>
              <div className="section-title" style={{ color: 'var(--amber)' }}>
                Identified Risk Factors ({analysis.risk_factors.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                {analysis.risk_factors.map((rf, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <AlertTriangle size={14} style={{ color: 'var(--amber)', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 12, color: 'var(--white)' }}>{rf}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Recommendations */}
          <div className="glass-panel" style={{ padding: 18 }}>
            <div className="section-cyan">
              Recommended Next Investigative Steps
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {analysis.recommendations.map((rec, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 3,
                    background: 'rgba(0,212,255,0.1)',
                    border: '1px solid var(--cyan)',
                    fontFamily: "'Geist', system-ui, sans-serif",
                    fontSize: 10.5, fontWeight: 700,
                    color: 'var(--cyan)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 1,
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 12.5, color: 'var(--white)' }}>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sources */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 8px' }}>
            <Layers size={12} style={{ color: 'var(--faint)' }} />
            <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Data Sources: {analysis.data_sources.join(' · ')} · Analyzed at {new Date(analysis.analyzed_at).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
