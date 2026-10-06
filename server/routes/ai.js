const db = require('../db');

module.exports = function registerAIRoutes(app, authenticateToken) {
  /**
   * POST /api/ai/analyze
   * Analyzes a real case from the DB and returns structured insights.
   * No external AI API needed - deterministic logic from real data.
   */
  app.post('/api/ai/analyze', authenticateToken, (req, res) => {
    const { case_id } = req.body;
    if (!case_id) return res.status(400).json({ error: 'case_id is required' });

    const isNumeric = /^\d+$/.test(String(case_id));
    const c = isNumeric
      ? db.prepare('SELECT * FROM cases WHERE id = ?').get(case_id)
      : db.prepare('SELECT * FROM cases WHERE unique_id = ?').get(case_id);

    if (!c) return res.status(404).json({ error: 'Case not found' });

    if (req.user.role === 'CASE_HOLDING' &&
        c.case_holding_officer_id.toUpperCase() !== req.user.username.toUpperCase()) {
      return res.status(403).json({ error: 'Access denied: not your case' });
    }

    const activeActions = db.prepare(
      'SELECT * FROM action_items WHERE case_id = ? AND is_completed = 0 ORDER BY id ASC'
    ).all(c.id);

    const completedActions = db.prepare(
      'SELECT * FROM action_items WHERE case_id = ? AND is_completed = 1 ORDER BY completed_at DESC'
    ).all(c.id);

    const progressHistory = db.prepare(
      'SELECT * FROM progress_updates WHERE case_id = ? ORDER BY progress_date DESC, id DESC'
    ).all(c.id);

    const now = new Date();
    const lastProgressDate = progressHistory.length > 0 ? new Date(progressHistory[0].progress_date) : null;
    const daysSinceProgress = lastProgressDate
      ? Math.floor((now - lastProgressDate) / (1000 * 60 * 60 * 24))
      : null;

    let riskLevel = 'MEDIUM';
    const riskFactors = [];

    if (c.current_stage === 'Pending Before Supreme Court') {
      riskLevel = 'CRITICAL';
      riskFactors.push('Case has escalated to Supreme Court - requires immediate legal attention');
    } else if (c.current_stage === 'Pending Before High Court') {
      riskLevel = 'HIGH';
      riskFactors.push('High Court proceedings ongoing - bail/appeal monitoring required');
    } else if (c.current_stage === 'Pending Trial') {
      riskLevel = 'MEDIUM';
      riskFactors.push('Trial stage - witness schedule and charge-sheet filings must be tracked');
    } else {
      riskLevel = 'LOW';
      riskFactors.push('Active investigation phase - evidence collection is primary priority');
    }

    if (daysSinceProgress !== null && daysSinceProgress > 30) {
      if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
      if (riskLevel === 'MEDIUM') riskLevel = 'HIGH';
      riskFactors.push(`No progress logged in ${daysSinceProgress} days - case may be stalled`);
    }

    if (activeActions.length > 5) {
      riskFactors.push(`${activeActions.length} pending action items - high task backlog`);
    }

    const upcomingReminders = progressHistory
      .filter(p => p.reminder_date && new Date(p.reminder_date) >= now)
      .sort((a, b) => new Date(a.reminder_date) - new Date(b.reminder_date));

    if (upcomingReminders.length > 0) {
      riskFactors.push(`Next court/reminder date: ${upcomingReminders[0].reminder_date}`);
    }

    const recommendations = [];

    if (activeActions.length === 0) {
      recommendations.push('All prior action items completed. Log the next Progress Updation and define new action items.');
    } else {
      recommendations.push(`Complete ${activeActions.length} pending action item(s) before next progress cycle.`);
      if (activeActions[0]) recommendations.push(`Highest priority: "${activeActions[0].task_description}"`);
    }

    if (daysSinceProgress === null) {
      recommendations.push('No progress has been logged yet. Begin with an initial progress entry detailing current investigation status.');
    } else if (daysSinceProgress > 14) {
      recommendations.push(`Last progress entry was ${daysSinceProgress} days ago. Update the investigation log.`);
    }

    if (upcomingReminders.length > 0) {
      recommendations.push(`Prepare for scheduled event on ${upcomingReminders[0].reminder_date}: ${upcomingReminders[0].further_action || 'details in progress log'}`);
    }

    if (c.current_stage === 'Under Investigation') {
      recommendations.push('Ensure forensic evidence is being documented. Cross-verify accused details with intelligence inputs.');
    } else if (c.current_stage === 'Pending Trial') {
      recommendations.push('Coordinate with the prosecution wing. Ensure witnesses are adequately protected and scheduled.');
    } else if (c.current_stage === 'Pending Before High Court') {
      recommendations.push('Monitor bail hearings and legal motions. Government Advocate must be briefed on current status.');
    } else if (c.current_stage === 'Pending Before Supreme Court') {
      recommendations.push('Engage Senior Government Advocate. Prepare comprehensive case summary for Solicitor General.');
    }

    const stageInfo = {
      'Under Investigation': 'Active field investigation. Evidence collection, arrests, charge-sheet preparation.',
      'Pending Trial': 'Case committed to Sessions/NIA Court. Trial proceedings underway.',
      'Pending Before High Court': 'Appeal or bail petition pending before the High Court of Madras.',
      'Pending Before Supreme Court': 'Constitutional challenge or SLP pending before the Supreme Court of India.',
    };

    const summary = [
      `Case ${c.unique_id} was registered under ${c.section_of_law}.`,
      `Filed at ${c.ps_limit} on ${c.date_of_registration}.`,
      progressHistory.length > 0
        ? `${progressHistory.length} progress update(s) recorded. Last update on ${progressHistory[0].progress_date}.`
        : 'No progress updates recorded yet.',
      `${activeActions.length} action item(s) pending, ${completedActions.length} completed.`,
    ].join(' ');

    res.json({
      case_id: c.unique_id,
      summary,
      current_stage: c.current_stage,
      stage_info: stageInfo[c.current_stage] || '',
      risk_level: riskLevel,
      risk_factors: riskFactors,
      pending_actions: activeActions.map(a => a.task_description),
      completed_actions_count: completedActions.length,
      progress_entries_count: progressHistory.length,
      days_since_last_progress: daysSinceProgress,
      upcoming_reminders: upcomingReminders.slice(0, 3).map(r => ({
        date: r.reminder_date,
        action: r.further_action,
      })),
      recommendations,
      data_sources: ['Case Details', 'Action Items', 'Progress History', 'Reminder Schedule'],
      analyzed_at: new Date().toISOString(),
    });
  });

  /**
   * POST /api/ai/query
   * Real interrogation query against case data
   */
  app.post('/api/ai/query', authenticateToken, (req, res) => {
    const { case_id, question } = req.body;
    if (!case_id || !question) {
      return res.status(400).json({ error: 'case_id and question are required' });
    }

    const isNumeric = /^\d+$/.test(String(case_id));
    const c = isNumeric
      ? db.prepare('SELECT * FROM cases WHERE id = ?').get(case_id)
      : db.prepare('SELECT * FROM cases WHERE unique_id = ?').get(case_id);

    if (!c) return res.status(404).json({ error: 'Case not found' });

    if (req.user.role === 'CASE_HOLDING' &&
        c.case_holding_officer_id.toUpperCase() !== req.user.username.toUpperCase()) {
      return res.status(403).json({ error: 'Access denied: not your case' });
    }

    const activeActions = db.prepare('SELECT * FROM action_items WHERE case_id = ? AND is_completed = 0').all(c.id);
    const progressHistory = db.prepare('SELECT * FROM progress_updates WHERE case_id = ? ORDER BY progress_date DESC').all(c.id);

    const qLower = question.toLowerCase();
    let answer = '';
    let category = 'GENERAL_ANALYSIS';
    let references = [`Case ID: ${c.unique_id}`];

    if (qLower.includes('summar') || qLower.includes('overview') || qLower.includes('brief')) {
      category = 'CASE_SUMMARY';
      answer = `Case ${c.unique_id} (${c.crime_number}) was registered at ${c.ps_limit} on ${c.date_of_registration} under ${c.section_of_law}. Complainant: ${c.complainant_name}. Current status is "${c.current_stage}". Accused details: ${c.accused_details.replace(/\n/g, '; ')}. Summary of offence: ${c.gist_of_case}`;
      references.push('FIR Intake Gist', 'Accused Records');
    } else if (qLower.includes('missing') || qLower.includes('gap') || qLower.includes('contradict')) {
      category = 'FORENSIC_GAPS';
      const gaps = [];
      if (!c.accused_details || c.accused_details.includes('To be ascertained')) {
        gaps.push('Full identity credentials of absconding/transit co-conspirators still unverified');
      }
      if (progressHistory.length === 0) {
        gaps.push('No formal progress log entries recorded post-registration');
      }
      if (activeActions.length > 0) {
        gaps.push(`${activeActions.length} registered operational task(s) currently unfulfilled in action matrix`);
      }
      answer = gaps.length > 0
        ? `Identified investigative and evidentiary gaps:\n- ${gaps.join('\n- ')}`
        : 'No critical evidence gaps detected based on available case entries. Continuing routine trial/inquiry tracking.';
      references.push('Action Matrix Audit', 'Progress History');
    } else if (qLower.includes('timeline') || qLower.includes('chronolog') || qLower.includes('sequence')) {
      category = 'TIMELINE_ANALYSIS';
      const events = [
        `[${c.date_of_occurrence}] Incident occurrence`,
        `[${c.date_of_registration}] FIR registration at ${c.ps_limit}`,
        `[${c.date_of_first_updation}] Initial case repository setup`
      ];
      progressHistory.forEach(p => {
        events.push(`[${p.progress_date}] ${p.progress_details} (IO: ${p.officer_name || p.officer_id})`);
      });
      answer = `Chronological Case Sequence:\n${events.join('\n')}`;
      references.push('FIR Registration Dates', 'Progress Logs');
    } else if (qLower.includes('next') || qLower.includes('step') || qLower.includes('action') || qLower.includes('examine')) {
      category = 'ACTION_PRIORITIZATION';
      if (activeActions.length > 0) {
        answer = `Priority tasks for investigating officers:\n${activeActions.map((a, i) => `${i + 1}. ${a.task_description} (${a.source_type})`).join('\n')}`;
      } else {
        answer = `All pending tasks logged for ${c.unique_id} have been completed. Next recommended action is filing progress update for stage transition consideration.`;
      }
      references.push('Action Items DB');
    } else if (qLower.includes('attack') || qLower.includes('technique') || qLower.includes('mitre') || qLower.includes('tactics')) {
      category = 'THREAT_INTEL';
      answer = `Correlated Threat Tactics for ${c.section_of_law}:\n- T1566 (Phishing / Clandestine Outreach)\n- T1071 (Standard Application Layer Encrypted Protocols)\n- T1078 (Valid Accounts / Forged Identifications)\n- T1005 (Data from Local System / Handset Telemetry)`;
      references.push('Statutory Classification', 'MITRE ATT&CK Mapping');
    } else {
      category = 'CASE_QUERY';
      answer = `Case ${c.unique_id}: Status is ${c.current_stage}. Registered under ${c.section_of_law}. ${activeActions.length} active tasks, ${progressHistory.length} progress logs. Accused: ${c.accused_details.split('\n')[0]}. Gist: ${c.gist_of_case}`;
      references.push('Case Master Records');
    }

    res.json({
      case_id: c.unique_id,
      question,
      answer,
      category,
      references,
      timestamp: new Date().toISOString()
    });
  });
};
