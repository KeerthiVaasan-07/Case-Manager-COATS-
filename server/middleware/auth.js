const jwt = require('jsonwebtoken');
const db = require('../db');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// No hardcoded secret. Use JWT_SECRET if set (min 32 chars); otherwise generate a unique
// random secret for this installation once and keep it in server/data/jwt.secret.
function loadSecret() {
  if (process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters.');
    return process.env.JWT_SECRET;
  }
  const file = path.join(__dirname, '..', 'data', 'jwt.secret');
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8').trim();
  const secret = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(file, secret, { mode: 0o600 });
  return secret;
}
const JWT_SECRET = loadSecret();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    const stmt = db.prepare('SELECT id, username, name, designation, role, branch, unit FROM users WHERE id = ?');
    const user = stmt.get(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User session invalid or expired.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

function requireSupervisory(req, res, next) {
  if (req.user.role !== 'SUPERVISORY') {
    return res.status(403).json({ error: 'Access restricted to Supervisory Officers only.' });
  }
  next();
}

module.exports = {
  authenticateToken,
  requireSupervisory,
  JWT_SECRET
};
