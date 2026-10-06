const db = require('./db');

const insert = db.prepare(
  'INSERT INTO audit_log (ts, user_id, username, method, path, status, ip) VALUES (?, ?, ?, ?, ?, ?, ?)'
);

// Records who called what and with what outcome. Query strings and bodies are never stored.
function record(req, status) {
  try {
    insert.run(
      new Date().toISOString(),
      req.user ? req.user.id : null,
      req.user ? req.user.username : (req.auditUser || null),
      req.method,
      `${req.baseUrl}${req.path}`.slice(0, 200),
      status,
      req.socket.remoteAddress || null
    );
  } catch (e) { console.error('Audit write failed:', e.message); }
}

module.exports = { record };
