const STAGES = ['Under Investigation', 'Pending Trial', 'Pending Before High Court', 'Pending Before Supreme Court'];
const BRANCHES = ['HQ', 'CNI', 'MDU', 'CMB'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const okStr = (v, max) => v == null || v === '' || (typeof v === 'string' && v.length <= max);
const bad = (res, msg) => res.status(400).json({ error: msg });

function check(res, b, limits, dates) {
  for (const [k, max] of Object.entries(limits)) if (!okStr(b[k], max)) return bad(res, `Field "${k}" is invalid or too long.`);
  for (const k of dates) if (b[k] && !(typeof b[k] === 'string' && DATE.test(b[k]))) return bad(res, `Field "${k}" must be a date (YYYY-MM-DD).`);
  if (b.current_stage && !STAGES.includes(b.current_stage)) return bad(res, 'Invalid case stage.');
  if (b.new_stage && !STAGES.includes(b.new_stage)) return bad(res, 'Invalid case stage.');
  return null;
}

function validateCase(req, res, next) {
  const b = req.body || {};
  if (check(res, b, { ps_limit: 300, crime_number: 100, section_of_law: 500, complainant_name: 300, accused_details: 5000, gist_of_case: 10000, action_to_be_taken: 5000, case_holding_officer_id: 100 }, ['date_of_occurrence', 'date_of_registration', 'date_of_first_updation'])) return;
  if (b.branch && !BRANCHES.includes(b.branch)) return bad(res, 'Invalid branch.');
  next();
}

function validateProgress(req, res, next) {
  const b = req.body || {};
  if (check(res, b, { details_of_progress: 10000, further_action_to_be_taken: 5000, remarks: 5000 }, ['date_of_progress', 'reminder_date'])) return;
  const ids = b.completed_action_ids;
  if (ids != null && !(Array.isArray(ids) && ids.length <= 500 && ids.every(Number.isInteger))) return bad(res, 'completed_action_ids must be a list of integers.');
  next();
}

module.exports = { validateCase, validateProgress };
