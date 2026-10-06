import React, { useRef, useEffect, useState } from 'react';
import { Network, ZoomIn, ZoomOut, RotateCcw, Shield } from 'lucide-react';

export default function NetworkGraph({ cases = [], onSelectCase }) {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [hoveredNode, setHoveredNode] = useState(null);
  const animFrame = useRef(null);

  // Generate deterministic entity nodes from real case records
  const nodes = [];
  const links = [];

  cases.forEach((c, idx) => {
    const angle = (idx / (cases.length || 1)) * Math.PI * 2;
    const radius = 160;
    const caseNodeId = `case-${c.id}`;

    // Case primary node
    nodes.push({
      id: caseNodeId,
      type: 'CASE',
      label: c.unique_id,
      subtitle: c.crime_number,
      stage: c.current_stage,
      branch: c.branch,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      radius: 20,
      color: '#00d4ff',
      raw: c,
    });

    // Officer entity node
    const officerNodeId = `officer-${c.case_holding_officer_id}`;
    if (!nodes.find(n => n.id === officerNodeId)) {
      nodes.push({
        id: officerNodeId,
        type: 'OFFICER',
        label: c.case_holding_officer_id,
        subtitle: c.case_holding_officer_name || 'Case Officer',
        x: Math.cos(angle + 0.3) * (radius * 0.5),
        y: Math.sin(angle + 0.3) * (radius * 0.5),
        radius: 14,
        color: '#a855f7',
      });
    }
    links.push({ source: caseNodeId, target: officerNodeId, type: 'ASSIGNED_TO' });

    // Accused entity node (from real text)
    if (c.accused_details) {
      const firstAccused = c.accused_details.split('\n')[0].substring(0, 24);
      const accNodeId = `acc-${c.id}`;
      nodes.push({
        id: accNodeId,
        type: 'SUSPECT',
        label: firstAccused,
        subtitle: 'Accused Party',
        x: Math.cos(angle - 0.25) * (radius * 1.5),
        y: Math.sin(angle - 0.25) * (radius * 1.5),
        radius: 12,
        color: '#ef4444',
      });
      links.push({ source: caseNodeId, target: accNodeId, type: 'IMPLICATED' });
    }

    // Police Station / Branch node
    const psNodeId = `ps-${c.branch}`;
    if (!nodes.find(n => n.id === psNodeId)) {
      nodes.push({
        id: psNodeId,
        type: 'UNIT',
        label: `${c.branch} Command`,
        subtitle: 'Jurisdiction',
        x: 0,
        y: 0,
        radius: 22,
        color: '#3b82f6',
      });
    }
    links.push({ source: caseNodeId, target: psNodeId, type: 'JURISDICTION' });
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let rotation = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(zoom, zoom);

      rotation += 0.0008;

      // Draw links
      links.forEach(l => {
        const s = nodes.find(n => n.id === l.source);
        const t = nodes.find(n => n.id === l.target);
        if (!s || !t) return;

        // Apply slight orbital rotation
        const sx = s.x * Math.cos(rotation) - s.y * Math.sin(rotation);
        const sy = s.x * Math.sin(rotation) + s.y * Math.cos(rotation);
        const tx = t.x * Math.cos(rotation) - t.y * Math.sin(rotation);
        const ty = t.x * Math.sin(rotation) + t.y * Math.cos(rotation);

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Animated pulse along link
        const pulse = (Date.now() % 3000) / 3000;
        const px = sx + (tx - sx) * pulse;
        const py = sy + (ty - sy) * pulse;
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#00d4ff';
        ctx.fill();
      });

      // Draw nodes
      nodes.forEach(n => {
        const nx = n.x * Math.cos(rotation) - n.y * Math.sin(rotation);
        const ny = n.x * Math.sin(rotation) + n.y * Math.cos(rotation);

        n.screenX = cx + nx * zoom;
        n.screenY = cy + ny * zoom;

        // Outer glow
        const isHovered = hoveredNode?.id === n.id;
        const isSel = selectedNode?.id === n.id;

        ctx.beginPath();
        ctx.arc(nx, ny, n.radius + (isHovered ? 6 : 2), 0, Math.PI * 2);
        ctx.fillStyle = isSel ? 'rgba(0,212,255,0.4)' : isHovered ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.03)';
        ctx.fill();

        // Node core
        ctx.beginPath();
        ctx.arc(nx, ny, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#0a1120';
        ctx.fill();
        ctx.lineWidth = isSel ? 2.5 : 1.5;
        ctx.strokeStyle = n.color;
        ctx.stroke();

        // Label
        ctx.font = "9px 'Geist', system-ui, sans-serif";
        ctx.fillStyle = isHovered ? '#00d4ff' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, nx, ny + n.radius + 12);
      });

      ctx.restore();
      animFrame.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame.current);
  }, [nodes, links, zoom, hoveredNode, selectedNode]);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const hit = nodes.find(n => {
      if (!n.screenX) return false;
      const dx = mx - n.screenX;
      const dy = my - n.screenY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    setHoveredNode(hit || null);
  };

  const handleClick = () => {
    if (hoveredNode) {
      setSelectedNode(hoveredNode);
      if (hoveredNode.type === 'CASE' && hoveredNode.raw && onSelectCase) {
        onSelectCase(hoveredNode.raw.unique_id);
      }
    }
  };

  return (
    <div className="glass-panel" style={{ padding: 18, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Network size={16} style={{ color: 'var(--cyan)' }} />
          <div>
            <span className="section-cyan">Live Investigation Network</span>
            <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--dim)' }}>
              Interactive entity relationship matrix (Cases · Officers · Accused · Jurisdictions)
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setZoom(z => Math.min(z + 0.15, 1.8))} className="btn-ghost-cyber" style={{ padding: '3px 8px' }}>
            <ZoomIn size={12} />
          </button>
          <button onClick={() => setZoom(z => Math.max(z - 0.15, 0.6))} className="btn-ghost-cyber" style={{ padding: '3px 8px' }}>
            <ZoomOut size={12} />
          </button>
          <button onClick={() => { setZoom(1); setSelectedNode(null); }} className="btn-ghost-cyber" style={{ padding: '3px 8px' }}>
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ position: 'relative', width: '100%', height: 380, background: 'rgba(6,11,20,0.6)', border: '1px solid var(--border)', overflow: 'hidden', borderRadius: 10 }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={380}
          style={{ width: '100%', height: '100%', cursor: hoveredNode ? 'pointer' : 'crosshair' }}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        />

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 10, left: 10,
          background: 'rgba(6,11,20,0.85)', border: '1px solid var(--border)',
          padding: '6px 12px', display: 'flex', gap: 12,
          fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, borderRadius: 10 }}>
          <span><strong style={{ color: '#00d4ff' }}>●</strong> CASE</span>
          <span><strong style={{ color: '#a855f7' }}>●</strong> OFFICER</span>
          <span><strong style={{ color: '#ef4444' }}>●</strong> ACCUSED</span>
          <span><strong style={{ color: '#3b82f6' }}>●</strong> UNIT</span>
        </div>

        {/* Hover / Selection Card */}
        {selectedNode && (
          <div style={{
            position: 'absolute', top: 12, right: 12, width: 220,
            background: 'rgba(10,17,32,0.95)', border: '1px solid var(--cyan)',
            padding: 12, boxShadow: 'var(--glow-sm)', borderRadius: 10 }}>
            <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 10.5, color: 'var(--cyan)', textTransform: 'uppercase' }}>
              {selectedNode.type} ENTITY
            </div>
            <div style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 12, fontWeight: 700, color: 'var(--white)', marginTop: 2 }}>
              {selectedNode.label}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--dim)', marginTop: 2 }}>
              {selectedNode.subtitle}
            </div>
            {selectedNode.type === 'CASE' && (
              <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid var(--border)' }}>
                <span className="badge badge-ui" style={{ fontSize: 10 }}>{selectedNode.stage}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
