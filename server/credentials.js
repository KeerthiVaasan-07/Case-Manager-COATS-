const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const FILE = path.join(__dirname, 'data', 'INITIAL_CREDENTIALS.txt');
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

// 14 random characters + a symbol + two digits, from a CSPRNG.
function genPassword() {
  let p = '';
  for (let i = 0; i < 14; i++) p += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return `${p.slice(0, 7)}@${p.slice(7)}${crypto.randomInt(10, 100)}`;
}

function writeCredentialsFile(list) {
  const lines = [
    'COATS - INITIAL CREDENTIALS (generated ' + new Date().toISOString() + ')',
    'Keep this file private. Hand each officer their own password, then delete this file.',
    'Passwords are stored only as bcrypt hashes; this file is the only plaintext copy.',
    '',
    ...list.map(c => `${c.username.padEnd(12)} ${c.password}`),
    ''
  ];
  fs.writeFileSync(FILE, lines.join('\r\n'), { mode: 0o600 });
  return FILE;
}

// Used for databases created before password hardening: every account gets a new random password.
function rotateAll(db) {
  const users = db.prepare('SELECT id, username FROM users').all();
  const upd = db.prepare('UPDATE users SET password_hash = ?, failed_attempts = 0, locked_until = 0 WHERE id = ?');
  const list = users.map(u => ({ username: u.username, password: genPassword(), id: u.id }));
  for (const c of list) upd.run(bcrypt.hashSync(c.password, 12), c.id);
  return writeCredentialsFile(list);
}

module.exports = { genPassword, writeCredentialsFile, rotateAll, FILE };
