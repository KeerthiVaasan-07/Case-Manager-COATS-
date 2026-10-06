import React, { useEffect, useRef } from 'react';

// Dot + ring. The ring eases toward the pointer, snaps toward buttons/links (magnetic),
// grows over cards and hides over text fields. Off on touch devices and with reduced motion.
const ACTION = 'button, a, [role="button"], select, summary, label[for]';
const CARD = '.stat-card, .glass-panel, .spatial, tr';
const TEXT = 'input, textarea';

export default function CustomCursor() {
  const dot = useRef(null), ring = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.classList.add('has-cursor');
    const p = { x: -100, y: -100 }, r = { x: -100, y: -100 };
    let target = null, state = 'idle', raf;

    const setState = s => { if (s !== state) { state = s; ring.current?.setAttribute('data-state', s); dot.current?.setAttribute('data-state', s); } };
    const move = e => {
      p.x = e.clientX; p.y = e.clientY;
      const t = e.target.closest ? e.target : null;
      const act = t?.closest(ACTION);
      target = act || null;
      setState(t?.closest(TEXT) ? 'text' : act ? 'action' : t?.closest(CARD) ? 'card' : 'idle');
    };
    const down = () => ring.current?.classList.add('press');
    const up = () => ring.current?.classList.remove('press');
    const leave = () => { p.x = p.y = -100; };

    const tick = () => {
      let tx = p.x, ty = p.y;
      if (target) { const b = target.getBoundingClientRect(); tx = p.x + (b.left + b.width / 2 - p.x) * 0.3; ty = p.y + (b.top + b.height / 2 - p.y) * 0.3; }
      r.x += (tx - r.x) * 0.18; r.y += (ty - r.y) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${p.x}px,${p.y}px,0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${r.x}px,${r.y}px,0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down); window.addEventListener('pointerup', up);
    document.documentElement.addEventListener('mouseleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up);
      document.documentElement.removeEventListener('mouseleave', leave);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring no-print" aria-hidden="true"><i /></div>
      <div ref={dot} className="cursor-dot no-print" aria-hidden="true"><i /></div>
    </>
  );
}
