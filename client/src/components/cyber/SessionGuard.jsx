import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck, Clock, LogOut, ShieldAlert } from 'lucide-react';

// Idle-timeout policy: sign out after IDLE_MS of no input, warn for the last WARN_MS.
// Deadline is a timestamp (not a counter) so background tabs can't overrun it, and a
// sign-out in another tab signs this one out too.
const IDLE_MS = (Number(import.meta.env.VITE_IDLE_MINUTES) || 15) * 60 * 1000;
const WARN_MS = 60 * 1000;
const NOTICE_KEY = 'coats_notice';
const fmt = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

export function useIdleSession(active, logout) {
  const deadline = useRef(Date.now() + IDLE_MS);
  const [left, setLeft] = useState(IDLE_MS);

  const touch = useCallback(() => { if (deadline.current - Date.now() > WARN_MS) deadline.current = Date.now() + IDLE_MS; }, []);
  const extend = useCallback(() => { deadline.current = Date.now() + IDLE_MS; setLeft(IDLE_MS); }, []);
  const signOut = useCallback((reason) => { if (reason) sessionStorage.setItem(NOTICE_KEY, reason); logout(); }, [logout]);

  useEffect(() => {
    if (!active) return;
    deadline.current = Date.now() + IDLE_MS;
    let last = 0;
    const onInput = () => { const n = Date.now(); if (n - last > 1000) { last = n; touch(); } };
    const evts = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    evts.forEach(e => window.addEventListener(e, onInput, { passive: true }));
    const onStorage = e => { if (e.key === 'coats_token' && !e.newValue) logout(); };
    window.addEventListener('storage', onStorage);
    const tick = setInterval(() => {
      const ms = deadline.current - Date.now();
      setLeft(ms);
      if (ms <= 0) signOut('Signed out after ' + IDLE_MS / 60000 + ' minutes of inactivity.');
    }, 1000);
    return () => { evts.forEach(e => window.removeEventListener(e, onInput)); window.removeEventListener('storage', onStorage); clearInterval(tick); };
  }, [active, touch, signOut, logout]);

  return { left, warning: active && left <= WARN_MS, extend, signOut };
}

export function SecurityBanner({ left }) {
  const low = left <= 5 * 60 * 1000;
  return (
    <div className="sec-banner no-print" role="note">
      <span><ShieldCheck size={13} aria-hidden="true" /> RESTRICTED · Authorised personnel only · All activity is logged</span>
      <span className={low ? 'sec-timer low' : 'sec-timer'} title="Automatic sign-out when idle">
        <Clock size={12} aria-hidden="true" /> Auto sign-out in {fmt(left)}
      </span>
    </div>
  );
}

export function IdleWarning({ open, left, onStay, onLeave }) {
  const reduce = useReducedMotion();
  const stay = useRef(null);
  useEffect(() => { if (open) stay.current?.focus(); }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="idle-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div role="alertdialog" aria-modal="true" aria-labelledby="idle-t" aria-describedby="idle-d" className="idle-card glass"
            initial={reduce ? false : { opacity: 0, scale: 0.94, y: 18, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.97 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            onKeyDown={e => { if (e.key === 'Escape') onStay(); }}>
            <ShieldAlert size={26} color="var(--amber)" aria-hidden="true" />
            <h2 id="idle-t">Still there?</h2>
            <p id="idle-d">For security, this session will end due to inactivity.</p>
            <div className="idle-count" aria-live="polite" aria-atomic="true">{fmt(left)}</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button ref={stay} className="btn-cyber-solid" onClick={onStay}>Stay signed in</button>
              <button className="btn-ghost-cyber" onClick={onLeave}><LogOut size={14} aria-hidden="true" /> Sign out now</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SessionNotice() {
  const [msg] = useState(() => { const m = sessionStorage.getItem(NOTICE_KEY); sessionStorage.removeItem(NOTICE_KEY); return m; });
  if (!msg) return null;
  return <div className="session-notice" role="status"><ShieldCheck size={15} aria-hidden="true" /> {msg}</div>;
}
