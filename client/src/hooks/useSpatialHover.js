import { useEffect } from 'react';

// One delegated pointer listener gives every card a light that follows the cursor.
// Small stat cards also tilt a few degrees; large panels only get the light, so forms stay steady.
const SEL = '.stat-card, .glass-panel, .spatial';
export default function useSpatialHover() {
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, last = null;
    const reset = el => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); };
    const move = e => {
      const el = e.target.closest?.(SEL);
      if (last && last !== el) reset(last);
      last = el;
      if (!el || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', `${px * 100}%`);
        el.style.setProperty('--my', `${py * 100}%`);
        if (!still && r.width < 520) {
          el.style.setProperty('--ry', `${(px - 0.5) * 5}deg`);
          el.style.setProperty('--rx', `${(0.5 - py) * 4}deg`);
        }
      });
    };
    document.addEventListener('pointermove', move, { passive: true });
    return () => { document.removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, []);
}
