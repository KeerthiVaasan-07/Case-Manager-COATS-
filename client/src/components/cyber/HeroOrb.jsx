import React, { useEffect, useRef } from 'react';

// Decorative CSS-3D "command core": glowing sphere, three tilted orbit rings, satellites.
// Reacts to the pointer over its parent panel; purely visual (aria-hidden, no data, no layout impact).
export default function HeroOrb() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current, host = el?.parentElement;
    if (!host || window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const move = e => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = host.getBoundingClientRect();
        el.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        el.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
    };
    const leave = () => { el.style.setProperty('--px', 0); el.style.setProperty('--py', 0); };
    host.addEventListener('pointermove', move, { passive: true });
    host.addEventListener('pointerleave', leave);
    return () => { host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={ref} className="hero-orb" aria-hidden="true">
      <div className="orb-scene">
        <i className="orb-core" />
        <i className="orb-ring r1"><b /></i>
        <i className="orb-ring r2"><b /></i>
        <i className="orb-ring r3"><b /></i>
        <i className="orb-grid" />
      </div>
    </div>
  );
}
