const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const audit = require('./audit');
const { validateCase, validateProgress } = require('./validate');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
const { authenticateToken, requireSupervisory, JWT_SECRET } = require('./middleware/auth');
const registerAIRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

const DEMO = process.env.DEMO_MODE === 'true';
const HOST = process.env.HOST || '127.0.0.1';          // localhost only unless you opt in
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000').split(',');
const isLoopback = ip => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(ip);

app.use(helmet());
app.use(cors({ origin: (origin, cb) => cb(null, !origin || ALLOWED_ORIGINS.includes(origin)) }));
app.use(express.json({ limit: '100kb' }));

// Audit trail: who called what, and the outcome (including denied requests). Runs before all routes.
app.use('/api', (req, res, next) => {
  res.on('finish', () => {
    if (['/auth/me', '/auth/officers', '/auth/config'].includes(req.path)) return;
    audit.record(req, res.statusCode);
  });
  next();
});

registerAIRoutes(app, authenticateToken);

// -------------------------------------------------------------
// AUTHENTICATION ROUTES
// -------------------------------------------------------------

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' }
});
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser', 12);
const MAX_FAILS = 5, LOCK_MS = 15 * 60 * 1000;

function issueSession(user) {
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, branch: user.branch },
    JWT_SECRET, { expiresIn: '8h', algorithm: 'HS256' }
  );
  return {
    token,
    user: { id: user.id, username: user.username, name: user.name, designation: user.designation, role: user.role, branch: user.branch, unit: user.unit }
  };
}

// POST /api/auth/login - generic errors, timing equalised, per-account lockout, IP rate limit
app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password || username.length > 100 || password.length > 200) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  req.auditUser = username.trim();
  const user = db.prepare('SELECT * FROM users WHERE UPPER(username) = UPPER(?)').get(username.trim());
  const now = Date.now();

  if (user && user.locked_until > now) {
    bcrypt.compareSync(password, DUMMY_HASH);
    return res.status(429).json({ error: 'Too many failed attempts. Try again in 15 minutes.' });
  }

  const ok = bcrypt.compareSync(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !ok) {
    if (user) {
      const fails = (user.failed_attempts || 0) + 1;
      if (fails >= MAX_FAILS) db.prepare('UPDATE users SET failed_attempts = 0, locked_until = ? WHERE id = ?').run(now + LOCK_MS, user.id);
      else db.prepare('UPDATE users SET failed_attempts = ? WHERE id = ?').run(fails, user.id);
    }
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  db.prepare('UPDATE users SET failed_attempts = 0, locked_until = 0 WHERE id = ?').run(user.id);
  req.user = user; // so the audit row records the account
  res.json(issueSession(user));
});

// Demo mode only (DEMO_MODE=true) and only from this machine: password-less officer switcher.
app.get('/api/auth/config', (req, res) => res.json({ demo: DEMO && isLoopback(req.socket.remoteAddress) }));
app.post('/api/auth/demo-login', (req, res) => {
  if (!DEMO || !isLoopback(req.socket.remoteAddress)) return res.status(404).json({ error: 'Not found.' });
  const { username } = req.body || {};
  const user = typeof username === 'string' && db.prepare('SELECT * FROM users WHERE UPPER(username) = UPPER(?)').get(username.trim());
  if (!user) return res.status(404).json({ error: 'Officer not found.' });
  req.user = user;
  res.json(issueSession(user));
});

// POST /api/auth/change-password
app.post('/api/auth/change-password', authenticateToken, (req, res) => {
  const { current_password, new_password } = req.body || {};
  if (typeof current_password !== 'string' || typeof new_password !== 'string') return res.status(400).json({ error: 'Both passwords are required.' });
  const strong = new_password.length >= 12 && new_password.length <= 200 && /[a-z]/.test(new_password) && /[A-Z]/.test(new_password) && /\d/.test(new_password) && /[^A-Za-z0-9]/.test(new_password);
  if (!strong) return res.status(400).json({ error: 'New password needs 12+ characters with upper, lower, a digit and a symbol.' });
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(current_password, row.password_hash)) return res.status(401).json({ error: 'Current password is incorrect.' });
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(new_password, 12), req.user.id);
  res.json({ ok: true });
});

// GET /api/audit - supervisory only, latest 200 events
app.get('/api/audit', authenticateToken, requireSupervisory, (req, res) => {
  res.json(db.prepare('SELECT ts, username, method, path, status, ip FROM audit_log ORDER BY id DESC LIMIT 200').all());
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// GET /api/auth/officers - directory (no credentials). Login required, except local demo mode.
app.get('/api/auth/officers',
  (req, res, next) => (DEMO && isLoopback(req.socket.remoteAddress)) ? next() : authenticateToken(req, res, next),
  (req, res) => {
    res.json(db.prepare('SELECT id, username, name, designation, role, branch, unit FROM users ORDER BY role DESC, branch ASC, id ASC').all());
  });

// -------------------------------------------------------------
// CASE MANAGEMENT ROUTES
// -------------------------------------------------------------

// Helper to generate Unique Case ID: ATS-[BRANCH]-[YEAR]-[SEQ]
function generateCaseUniqueId(branch) {
  const year = new Date().getFullYear();
  const branchCode = (branch || 'HQ').toUpperCase();
  const prefix = `ATS-${branchCode}-${year}-`;

  const lastCase = db.prepare(`
    SELECT unique_id FROM cases
    WHERE unique_id LIKE ?
    ORDER BY id DESC LIMIT 1
  `).get(`${prefix}%`);

  let nextSeq = 1;
  if (lastCase && lastCase.unique_id) {
    const parts = lastCase.unique_id.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  return `${prefix}${String(nextSeq).padStart(3, '0')}`;
}

// GET /api/cases - List cases with strict role-based access control
app.get('/api/cases', authenticateToken, (req, res) => {
  const { role, username } = req.user;
  const { branch, stage, search, officer } = req.query;

  let query = `
    SELECT 
      c.*,
      (SELECT COUNT(*) FROM action_items a WHERE a.case_id = c.id AND a.is_completed = 0) AS pending_actions_count,
      (SELECT MAX(progress_date) FROM progress_updates p WHERE p.case_id = c.id) AS last_progress_date
    FROM cases c
    WHERE 1=1
  `;
  const params = [];

  // Strict RBAC: Case Holding Officer sees ONLY their own cases
  if (role === 'CASE_HOLDING') {
    query += ` AND UPPER(c.case_holding_officer_id) = UPPER(?)`;
    params.push(username);
  } else if (role === 'SUPERVISORY') {
    // Supervisory can filter by branch or officer if desired
    if (branch && branch !== 'ALL') {
      query += ` AND c.branch = ?`;
      params.push(branch);
    }
    if (officer) {
      query += ` AND UPPER(c.case_holding_officer_id) = UPPER(?)`;
      params.push(officer);
    }
  }

  if (stage && stage !== 'ALL') {
    query += ` AND c.current_stage = ?`;
    params.push(stage);
  }

  if (search) {
    query += ` AND (
      c.unique_id LIKE ? OR 
      c.crime_number LIKE ? OR 
      c.section_of_law LIKE ? OR 
      c.complainant_name LIKE ? OR 
      c.accused_details LIKE ? OR 
      c.ps_limit LIKE ?
    )`;
    const s = `%${search}%`;
    params.push(s, s, s, s, s, s);
  }

  query += ` ORDER BY c.id DESC`;

  const cases = db.prepare(query).all(...params);

  // Attach active action items preview to each case
  const getActiveActions = db.prepare(`
    SELECT id, task_description, created_at, source_type
    FROM action_items
    WHERE case_id = ? AND is_completed = 0
    ORDER BY id ASC
  `);

  const results = cases.map(c => ({
    ...c,
    active_actions: getActiveActions.all(c.id)
  }));

  res.json(results);
});

// GET /api/cases/:id - Single case details with full timeline & checklists
app.get('/api/cases/:id', authenticateToken, (req, res) => {
  const caseId = req.params.id;
  const isNumeric = /^\d+$/.test(caseId);

  const caseStmt = isNumeric
    ? db.prepare('SELECT * FROM cases WHERE id = ?')
    : db.prepare('SELECT * FROM cases WHERE unique_id = ?');

  const c = caseStmt.get(caseId);

  if (!c) {
    return res.status(404).json({ error: 'Case not found in ATS records.' });
  }

  // Strict check for Case Holding Officer
  if (req.user.role === 'CASE_HOLDING' && c.case_holding_officer_id.toUpperCase() !== req.user.username.toUpperCase()) {
    return res.status(403).json({ error: 'Security clearance denied: You are only authorized to view your assigned cases.' });
  }

  // Fetch pending action items
  const activeActions = db.prepare(`
    SELECT id, task_description, created_at, source_type, progress_id
    FROM action_items
    WHERE case_id = ? AND is_completed = 0
    ORDER BY id ASC
  `).all(c.id);

  // Fetch completed action items
  const completedActions = db.prepare(`
    SELECT id, task_description, completed_at, completed_by_officer, source_type
    FROM action_items
    WHERE case_id = ? AND is_completed = 1
    ORDER BY completed_at DESC
  `).all(c.id);

  // Fetch progress timeline
  const progressTimeline = db.prepare(`
    SELECT * FROM progress_updates
    WHERE case_id = ?
    ORDER BY progress_date DESC, id DESC
  `).all(c.id);

  res.json({
    case: c,
    active_actions: activeActions,
    completed_actions: completedActions,
    progress_history: progressTimeline
  });
});

// POST /api/cases - Step 1: Updation of basic case details (First time entry)
app.post('/api/cases', authenticateToken, validateCase, (req, res) => {
  const {
    ps_limit,
    crime_number,
    section_of_law,
    date_of_occurrence,
    date_of_registration,
    complainant_name,
    accused_details,
    gist_of_case,
    current_stage,
    case_holding_officer_id,
    action_to_be_taken,
    date_of_first_updation,
    branch: reqBranch
  } = req.body;

  // Validation
  if (!ps_limit || !crime_number || !section_of_law || !gist_of_case || !current_stage) {
    return res.status(400).json({ error: 'Please fill in all mandatory case fields.' });
  }

  // Determine branch and officer
  let officerId = req.user.username;
  let officerName = req.user.name;
  let branch = req.user.branch || 'HQ';

  // If supervisory officer creates or specifies officer
  if (req.user.role === 'SUPERVISORY' && case_holding_officer_id) {
    const assignedUser = db.prepare('SELECT username, name, branch FROM users WHERE UPPER(username) = UPPER(?)').get(case_holding_officer_id.trim());
    if (assignedUser) {
      officerId = assignedUser.username;
      officerName = assignedUser.name;
      branch = reqBranch || assignedUser.branch;
    }
  } else if (reqBranch && req.user.role === 'SUPERVISORY') {   // case holders cannot file under other branches
    branch = reqBranch;
  }

  // Automatically assign unique internal ID
  const uniqueId = generateCaseUniqueId(branch);
  const firstUpdationDate = date_of_first_updation || new Date().toISOString().split('T')[0];

  try {
    const insertCase = db.prepare(`
      INSERT INTO cases (
        unique_id, ps_limit, crime_number, section_of_law, date_of_occurrence,
        date_of_registration, complainant_name, accused_details, gist_of_case,
        current_stage, case_holding_officer_id, case_holding_officer_name, branch,
        date_of_first_updation, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
    `);

    const result = insertCase.run(
      uniqueId,
      ps_limit.trim(),
      crime_number.trim(),
      section_of_law.trim(),
      date_of_occurrence || firstUpdationDate,
      date_of_registration || firstUpdationDate,
      complainant_name || 'State Special Branch / ATS',
      accused_details || 'Under Interrogation / To be ascertained',
      gist_of_case.trim(),
      current_stage,
      officerId,
      officerName,
      branch,
      firstUpdationDate
    );

    const caseId = Number(result.lastInsertRowid);

    // Initial "Action To be Taken"
    if (action_to_be_taken && action_to_be_taken.trim()) {
      // Support multiple lines or semicolon separation
      const items = action_to_be_taken
        .split(/\r?\n|;/)
        .map(i => i.trim())
        .filter(Boolean);

      const actionInsert = db.prepare(`
        INSERT INTO action_items (
          case_id, case_unique_id, task_description, is_completed, source_type
        ) VALUES (?, ?, ?, 0, 'INITIAL')
      `);

      for (const task of items) {
        actionInsert.run(caseId, uniqueId, task);
      }
    }

    const createdCase = db.prepare('SELECT * FROM cases WHERE id = ?').get(caseId);
    const actions = db.prepare('SELECT * FROM action_items WHERE case_id = ?').all(caseId);

    res.status(201).json({
      message: 'Case successfully registered with assigned Unique ID.',
      case: createdCase,
      active_actions: actions
    });
  } catch (err) {
    console.error('Error creating case:', err);
    res.status(500).json({ error: 'Failed to register case into ATS database.', details: err.message });
  }
});

// POST /api/cases/:id/progress - Step 2: Progress Updation & Dynamic Checklist
app.post('/api/cases/:id/progress', authenticateToken, validateProgress, (req, res) => {
  const caseIdParam = req.params.id;
  const isNumeric = /^\d+$/.test(caseIdParam);

  const c = isNumeric
    ? db.prepare('SELECT * FROM cases WHERE id = ?').get(caseIdParam)
    : db.prepare('SELECT * FROM cases WHERE unique_id = ?').get(caseIdParam);

  if (!c) {
    return res.status(404).json({ error: 'Case not found.' });
  }

  // Case Holding Officers can only update their own case
  if (req.user.role === 'CASE_HOLDING' && c.case_holding_officer_id.toUpperCase() !== req.user.username.toUpperCase()) {
    return res.status(403).json({ error: 'Unauthorized: You can only log progress updates for your assigned cases.' });
  }

  const {
    date_of_progress,
    details_of_progress,
    reminder_date,
    further_action_to_be_taken,
    remarks,
    completed_action_ids, // array of IDs checked off
    new_stage // optional stage transition
  } = req.body;

  if (!date_of_progress || !details_of_progress) {
    return res.status(400).json({ error: 'Date of Progress and Details of Progress are mandatory.' });
  }

  const officerId = req.user.username;
  const officerName = req.user.name;
  const progressDate = date_of_progress;

  try {
    // 1. Insert Progress Record
    const insertProg = db.prepare(`
      INSERT INTO progress_updates (
        case_id, case_unique_id, officer_id, officer_name, progress_date,
        progress_details, reminder_date, further_action, remarks, stage_at_update, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
    `);

    const progResult = insertProg.run(
      c.id,
      c.unique_id,
      officerId,
      officerName,
      progressDate,
      details_of_progress.trim(),
      reminder_date || null,
      further_action_to_be_taken ? further_action_to_be_taken.trim() : null,
      remarks ? remarks.trim() : null,
      new_stage || c.current_stage
    );

    const progressId = Number(progResult.lastInsertRowid);

    // 2. Mark completed action items (checked by officer)
    // "Once this progress is completed, the checkbox may be checked to delete that progress from appearing in the subsequent Progress updations."
    if (Array.isArray(completed_action_ids) && completed_action_ids.length > 0) {
      const updateAction = db.prepare(`
        UPDATE action_items
        SET is_completed = 1, completed_at = datetime('now', 'localtime'), completed_by_officer = ?
        WHERE id = ? AND case_id = ?
      `);

      for (const actId of completed_action_ids) {
        updateAction.run(officerId, actId, c.id);
      }
    }

    // 3. Add Further Action To Be Taken as the NEW active checklist
    // "In the Progress updation tab, there is an entry called Further Action To be Taken. This further Action to be taken will act as the next new checklist for the earlier Action to be Taken tab."
    if (further_action_to_be_taken && further_action_to_be_taken.trim()) {
      const newItems = further_action_to_be_taken
        .split(/\r?\n|;/)
        .map(i => i.trim())
        .filter(Boolean);

      const newActionInsert = db.prepare(`
        INSERT INTO action_items (
          case_id, case_unique_id, task_description, is_completed, source_type, progress_id
        ) VALUES (?, ?, ?, 0, 'PROGRESS_UPDATE', ?)
      `);

      for (const item of newItems) {
        newActionInsert.run(c.id, c.unique_id, item, progressId);
      }
    }

    // 4. Update Case stage and updated_at
    const stageToSet = new_stage || c.current_stage;
    db.prepare(`
      UPDATE cases
      SET current_stage = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(stageToSet, c.id);

    // Fetch refreshed active actions & history
    const refreshedActive = db.prepare(`
      SELECT * FROM action_items WHERE case_id = ? AND is_completed = 0 ORDER BY id ASC
    `).all(c.id);

    const refreshedHistory = db.prepare(`
      SELECT * FROM progress_updates WHERE case_id = ? ORDER BY progress_date DESC, id DESC
    `).all(c.id);

    res.json({
      message: 'Progress update recorded and active action checklist updated.',
      active_actions: refreshedActive,
      progress_history: refreshedHistory
    });
  } catch (err) {
    console.error('Error in progress update:', err);
    res.status(500).json({ error: 'Failed to record progress update.', details: err.message });
  }
});

// -------------------------------------------------------------
// SUPERVISORY OFFICER DASHBOARD ROUTES
// -------------------------------------------------------------

// GET /api/dashboard/metrics
// Supervisory Dashboard with fields:
// 1. Branch Office (filter: ALL, CNI, MDU, CMB, HQ)
// 2. Number of Cases Under Investigation
// 3. Number of Cases Pending Trial
// 4. Number of Cases Pending before High Court
// 5. Number of Cases Pending before Supreme Court
// 6. Date Range (startDate to endDate)
// 7. Progress Details (entries in corresponding time limit)
// 8. Action To be Taken (latest active entries)
app.get('/api/dashboard/metrics', authenticateToken, requireSupervisory, (req, res) => {
  const { branch, startDate, endDate } = req.query;

  const branchFilter = branch && branch !== 'ALL' ? branch : null;

  // Case counts by stage
  let stageQuery = `
    SELECT 
      current_stage,
      COUNT(*) as count
    FROM cases
    WHERE 1=1
  `;
  const stageParams = [];
  if (branchFilter) {
    stageQuery += ` AND branch = ?`;
    stageParams.push(branchFilter);
  }
  stageQuery += ` GROUP BY current_stage`;

  const stageRows = db.prepare(stageQuery).all(...stageParams);

  let uiCount = 0;
  let ptCount = 0;
  let hcCount = 0;
  let scCount = 0;
  let totalCases = 0;

  for (const row of stageRows) {
    totalCases += row.count;
    if (row.current_stage === 'Under Investigation') uiCount = row.count;
    else if (row.current_stage === 'Pending Trial') ptCount = row.count;
    else if (row.current_stage === 'Pending Before High Court') hcCount = row.count;
    else if (row.current_stage === 'Pending Before Supreme Court') scCount = row.count;
  }

  // Branch breakdowns
  const branchBreakdownQuery = `
    SELECT 
      branch,
      COUNT(*) as total,
      SUM(CASE WHEN current_stage = 'Under Investigation' THEN 1 ELSE 0 END) as ui,
      SUM(CASE WHEN current_stage = 'Pending Trial' THEN 1 ELSE 0 END) as pt,
      SUM(CASE WHEN current_stage = 'Pending Before High Court' THEN 1 ELSE 0 END) as hc,
      SUM(CASE WHEN current_stage = 'Pending Before Supreme Court' THEN 1 ELSE 0 END) as sc
    FROM cases
    GROUP BY branch
  `;
  const branchRows = db.prepare(branchBreakdownQuery).all();

  // Progress Details filtered by Date Range and Branch
  let progQuery = `
    SELECT 
      p.*,
      c.crime_number,
      c.branch,
      c.current_stage,
      c.ps_limit,
      c.complainant_name,
      c.accused_details
    FROM progress_updates p
    JOIN cases c ON p.case_id = c.id
    WHERE 1=1
  `;
  const progParams = [];

  if (branchFilter) {
    progQuery += ` AND c.branch = ?`;
    progParams.push(branchFilter);
  }

  if (startDate) {
    progQuery += ` AND p.progress_date >= ?`;
    progParams.push(startDate);
  }

  if (endDate) {
    progQuery += ` AND p.progress_date <= ?`;
    progParams.push(endDate);
  }

  progQuery += ` ORDER BY p.progress_date DESC, p.id DESC`;
  const progressEntries = db.prepare(progQuery).all(...progParams);

  // Active Action To be Taken across matching cases
  let casesActionQuery = `
    SELECT 
      c.id,
      c.unique_id,
      c.crime_number,
      c.branch,
      c.case_holding_officer_id,
      c.case_holding_officer_name,
      c.current_stage,
      c.ps_limit,
      (
        SELECT GROUP_CONCAT(task_description, ' | ')
        FROM action_items a
        WHERE a.case_id = c.id AND a.is_completed = 0
      ) as active_action_to_be_taken,
      (
        SELECT MAX(p.reminder_date)
        FROM progress_updates p
        WHERE p.case_id = c.id AND p.reminder_date IS NOT NULL
      ) as latest_reminder_date
    FROM cases c
    WHERE 1=1
  `;
  const actionParams = [];
  if (branchFilter) {
    casesActionQuery += ` AND c.branch = ?`;
    actionParams.push(branchFilter);
  }
  casesActionQuery += ` ORDER BY c.id DESC`;

  const casesWithActions = db.prepare(casesActionQuery).all(...actionParams);

  // Upcoming reminders alert
  const upcomingReminders = db.prepare(`
    SELECT 
      p.id, p.case_id, p.case_unique_id, p.reminder_date, p.further_action, p.officer_name,
      c.crime_number, c.branch, c.current_stage
    FROM progress_updates p
    JOIN cases c ON p.case_id = c.id
    WHERE p.reminder_date IS NOT NULL AND p.reminder_date >= date('now', 'localtime')
    ORDER BY p.reminder_date ASC
    LIMIT 10
  `).all();

  res.json({
    metrics: {
      total_cases: totalCases,
      under_investigation: uiCount,
      pending_trial: ptCount,
      pending_high_court: hcCount,
      pending_supreme_court: scCount
    },
    branch_breakdown: branchRows,
    progress_details: progressEntries,
    cases_with_actions: casesWithActions,
    upcoming_reminders: upcomingReminders,
    filters_applied: {
      branch: branchFilter || 'ALL',
      startDate: startDate || null,
      endDate: endDate || null
    }
  });
});

app.listen(PORT, HOST, () => {
  console.log(`COATS ATS Backend Server running on http://${HOST}:${PORT}`);
  if (DEMO) console.log('[WARNING] DEMO_MODE is ON: password-less officer switching is enabled (localhost only). Never enable on a real deployment.');
  console.log(`Connected to SQLite database: data/coats.db`);
});
