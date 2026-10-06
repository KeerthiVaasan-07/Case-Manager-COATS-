const db = require('./db');
const bcrypt = require('bcryptjs');

const { genPassword, writeCredentialsFile } = require('./credentials');

const users = [
  // Supervisory Officers
  { id: 'dig_ats', username: 'DIG ATS', name: 'Dr. K. Jayanth Murali IPS', designation: 'Deputy Inspector General of Police, ATS', role: 'SUPERVISORY', branch: 'HQ', unit: 'Headquarters' },
  { id: 'sp_ats_hq', username: 'SP ATS HQ', name: 'Thiru V. Balakrishnan IPS', designation: 'Superintendent of Police, ATS HQ', role: 'SUPERVISORY', branch: 'HQ', unit: 'Headquarters' },
  { id: 'sp_ats_cni', username: 'SP ATS CNI', name: 'Tmt. S. Mallikha IPS', designation: 'Superintendent of Police, ATS Chennai', role: 'SUPERVISORY', branch: 'CNI', unit: 'Chennai Branch' },
  { id: 'sp_ats_mdu', username: 'SP ATS MDU', name: 'Thiru R. Senthil Kumar IPS', designation: 'Superintendent of Police, ATS Madurai', role: 'SUPERVISORY', branch: 'MDU', unit: 'Madurai Branch' },
  { id: 'sp_ats_cmb', username: 'SP ATS CMB', name: 'Thiru M. Durai IPS', designation: 'Superintendent of Police, ATS Coimbatore', role: 'SUPERVISORY', branch: 'CMB', unit: 'Coimbatore Branch' },

  // Case Holding Officers - Headquarters
  { id: 'adsp_hq', username: 'ADSP HQ', name: 'Thiru G. Venkatesan', designation: 'Additional Superintendent of Police, ATS HQ', role: 'CASE_HOLDING', branch: 'HQ', unit: 'Headquarters' },
  { id: 'ins_admin', username: 'INSADMIN', name: 'Insp. K. Saravanan', designation: 'Inspector of Police (Admin & Special Wing), ATS HQ', role: 'CASE_HOLDING', branch: 'HQ', unit: 'Headquarters' },

  // Case Holding Officers - Chennai
  { id: 'adsp_cni', username: 'ADSP CNI', name: 'Thiru P. Ramanathan', designation: 'Additional Superintendent of Police, ATS Chennai', role: 'CASE_HOLDING', branch: 'CNI', unit: 'Chennai Branch' },
  { id: 'dsp_cni', username: 'DSP CNI', name: 'Thiru S. Murugesan', designation: 'Deputy Superintendent of Police, ATS Chennai', role: 'CASE_HOLDING', branch: 'CNI', unit: 'Chennai Branch' },
  { id: 'ins1_cni', username: 'INS1CNI', name: 'Insp. M. Rajan', designation: 'Inspector of Police, Unit 1, ATS Chennai', role: 'CASE_HOLDING', branch: 'CNI', unit: 'Chennai Branch' },
  { id: 'ins2_cni', username: 'INS2CNI', name: 'Insp. D. Selvam', designation: 'Inspector of Police, Unit 2, ATS Chennai', role: 'CASE_HOLDING', branch: 'CNI', unit: 'Chennai Branch' },
  { id: 'ins3_cni', username: 'INS3CNI', name: 'Insp. A. Vijayakumar', designation: 'Inspector of Police, Unit 3, ATS Chennai', role: 'CASE_HOLDING', branch: 'CNI', unit: 'Chennai Branch' },
  { id: 'ins4_cni', username: 'INS4CNI', name: 'Insp. R. Anandhan', designation: 'Inspector of Police, Unit 4, ATS Chennai', role: 'CASE_HOLDING', branch: 'CNI', unit: 'Chennai Branch' },

  // Case Holding Officers - Madurai
  { id: 'adsp_mdu', username: 'ADSP MDU', name: 'Thiru T. Pandian', designation: 'Additional Superintendent of Police, ATS Madurai', role: 'CASE_HOLDING', branch: 'MDU', unit: 'Madurai Branch' },
  { id: 'dsp_mdu', username: 'DSP MDU', name: 'Thiru V. Alagarsamy', designation: 'Deputy Superintendent of Police, ATS Madurai', role: 'CASE_HOLDING', branch: 'MDU', unit: 'Madurai Branch' },
  { id: 'ins1_mdu', username: 'INS1MDU', name: 'Insp. C. Manikandan', designation: 'Inspector of Police, Unit 1, ATS Madurai', role: 'CASE_HOLDING', branch: 'MDU', unit: 'Madurai Branch' },
  { id: 'ins2_mdu', username: 'INS2MDU', name: 'Insp. K. Muthuraman', designation: 'Inspector of Police, Unit 2, ATS Madurai', role: 'CASE_HOLDING', branch: 'MDU', unit: 'Madurai Branch' },
  { id: 'ins3_mdu', username: 'INS3MDU', name: 'Insp. S. Senthilvel', designation: 'Inspector of Police, Unit 3, ATS Madurai', role: 'CASE_HOLDING', branch: 'MDU', unit: 'Madurai Branch' },
  { id: 'ins4_mdu', username: 'INS4MDU', name: 'Insp. P. Ganesan', designation: 'Inspector of Police, Unit 4, ATS Madurai', role: 'CASE_HOLDING', branch: 'MDU', unit: 'Madurai Branch' },

  // Case Holding Officers - Coimbatore
  { id: 'adsp_cmd', username: 'ADSP CMD', name: 'Thiru B. Chandrasekar', designation: 'Additional Superintendent of Police, ATS Coimbatore', role: 'CASE_HOLDING', branch: 'CMB', unit: 'Coimbatore Branch' },
  { id: 'dsp_cmb', username: 'DSP CMB', name: 'Thiru N. Gunasekaran', designation: 'Deputy Superintendent of Police, ATS Coimbatore', role: 'CASE_HOLDING', branch: 'CMB', unit: 'Coimbatore Branch' },
  { id: 'ins1_cmb', username: 'INS1CMB', name: 'Insp. E. Karthikeyan', designation: 'Inspector of Police, Unit 1, ATS Coimbatore', role: 'CASE_HOLDING', branch: 'CMB', unit: 'Coimbatore Branch' },
  { id: 'ins2_cmb', username: 'INS2CMB', name: 'Insp. J. Thangavel', designation: 'Inspector of Police, Unit 2, ATS Coimbatore', role: 'CASE_HOLDING', branch: 'CMB', unit: 'Coimbatore Branch' },
  { id: 'ins3_cmb', username: 'INS3CMB', name: 'Insp. M. Suresh', designation: 'Inspector of Police, Unit 3, ATS Coimbatore', role: 'CASE_HOLDING', branch: 'CMB', unit: 'Coimbatore Branch' },
  { id: 'ins4_cmb', username: 'INS4CMB', name: 'Insp. S. Ravichandran', designation: 'Inspector of Police, Unit 4, ATS Coimbatore', role: 'CASE_HOLDING', branch: 'CMB', unit: 'Coimbatore Branch' }
];

// Every officer gets a unique random password; hashes only go into the database.
for (const u of users) { u.password = genPassword(); u.password_hash = bcrypt.hashSync(u.password, 12); }

function seedDatabase() {
  console.log('Seeding COATS database...');

  // Reset Tables
  db.exec('DELETE FROM action_items;');
  db.exec('DELETE FROM progress_updates;');
  db.exec('DELETE FROM cases;');
  db.exec('DELETE FROM users;');

  // Insert Users
  const userInsert = db.prepare(`
    INSERT INTO users (id, username, password_hash, name, designation, role, branch, unit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of users) {
    userInsert.run(u.id, u.username, u.password_hash, u.name, u.designation, u.role, u.branch, u.unit);
  }
  const credFile = writeCredentialsFile(users);
  console.log(`Seeded ${users.length} officers. Unique passwords written to: ${credFile}`);

  // Insert Authentic Initial Cases
  const sampleCases = [
    {
      unique_id: 'ATS-CNI-2026-001',
      ps_limit: 'B-1 North Beach PS / ATS Chennai',
      crime_number: 'Cr. No. 04/2026',
      section_of_law: 'Sec 16, 18, 20 UAPA r/w 120B IPC',
      date_of_occurrence: '2026-01-14',
      date_of_registration: '2026-01-18',
      complainant_name: 'Sub-Inspector Intelligence Wing, State Special Branch',
      accused_details: 'A1: Mohammed Rafiq @ Zubair (Arrested, Central Prison Puzhal)\nA2: Salman Faris (Absconding, suspected overseas transit)\nA3: Haris K. (Interrogated on transit remand)',
      gist_of_case: 'Intercepted sleeper module orchestrating clandestine terror funding transit via hawala routes and encrypted communication matrix. Primary conspirator intercepted in possession of forged travel documents and high-grade cryptographic keys.',
      current_stage: 'Under Investigation',
      case_holding_officer_id: 'INS1CNI',
      case_holding_officer_name: 'Insp. M. Rajan',
      branch: 'CNI',
      date_of_first_updation: '2026-01-20',
      initial_actions: [
        'Secure CDR and IPDR dump of 4 mobile devices seized from A1',
        'Issue Blue Corner Notice request via Interpol NCB for absconding accused A2',
        'Submit digital forensics seizure requisition before Hon\\\'ble Special NIA/ATS Court, Poonamallee'
      ],
      progress_history: [
        {
          progress_date: '2026-02-05',
          progress_details: 'Forensic extraction of primary phone completed by Cyber Forensics Lab, Chennai. Found 14 encrypted chats detailing dead-drop locations. A3 taken on 5-day police custody remand.',
          reminder_date: '2026-03-20',
          further_action: 'Examine bank remittance logs of suspected hawala intermediary in Mannady; Verify biometric details with UIDAI database',
          remarks: 'Remand extended till 20th March 2026. Confidential dossier shared with NIA Chennai wing.',
          completed_tasks: ['Secure CDR and IPDR dump of 4 mobile devices seized from A1']
        }
      ]
    },
    {
      unique_id: 'ATS-CNI-2026-002',
      ps_limit: 'H-1 Washermanpet PS / ATS Chennai',
      crime_number: 'Cr. No. 11/2025',
      section_of_law: 'Sec 15, 16 UAPA & Sec 4, 5 Explosive Substances Act 1908',
      date_of_occurrence: '2025-10-08',
      date_of_registration: '2025-10-10',
      complainant_name: 'Special Task Force Lead / ATS CNI',
      accused_details: 'A1: K. Nawaz (In Custody)\nA2: Bilal Ahmed (In Custody)',
      gist_of_case: 'Recovery of tactical timer circuits, 12 kg potassium chlorate mixture, and galvanized iron pipes concealed in a rented godown near Royapuram. Pre-emptive strike prevented planned sabotage of transit infrastructure.',
      current_stage: 'Pending Trial',
      case_holding_officer_id: 'INS2CNI',
      case_holding_officer_name: 'Insp. D. Selvam',
      branch: 'CNI',
      date_of_first_updation: '2025-10-15',
      initial_actions: [
        'File complete chargesheet within 180-day statutory limit before Special Sessions Court',
        'Obtain forensic explosive report from PESO Sivakasi & Central FSL'
      ],
      progress_history: [
        {
          progress_date: '2026-01-28',
          progress_details: 'Chargesheet (1,240 pages with 68 prosecution witnesses) filed before Hon\\\'ble Special Court for ATS cases. Sanction for prosecution under UAPA Sec 45 received from Govt of TN.',
          reminder_date: '2026-03-25',
          further_action: 'Serve summon copies to PW1 through PW12; Prepare prosecution evidence binders',
          remarks: 'Trial committal scheduled for framing of charges on next hearing date.',
          completed_tasks: [
            'File complete chargesheet within 180-day statutory limit before Special Sessions Court',
            'Obtain forensic explosive report from PESO Sivakasi & Central FSL'
          ]
        }
      ]
    },
    {
      unique_id: 'ATS-MDU-2026-001',
      ps_limit: 'B-6 Jaihindpuram PS / ATS Madurai',
      crime_number: 'Cr. No. 07/2025',
      section_of_law: 'Sec 18, 38, 39 UAPA & 153A, 505(1)(b) IPC',
      date_of_occurrence: '2025-06-22',
      date_of_registration: '2025-06-25',
      complainant_name: 'Inspector of Police, Madurai City Intelligence Unit',
      accused_details: 'A1: Sheikh Dawood (Detained under NSA)\nA2: Imran Khan (In Judicial Custody)',
      gist_of_case: 'Clandestine radicalization network operating under the guise of an unregistered youth welfare forum. Recruited vulnerable youth through dark-web channels and disseminated prohibited extremist propaganda.',
      current_stage: 'Pending Before High Court',
      case_holding_officer_id: 'INS1MDU',
      case_holding_officer_name: 'Insp. C. Manikandan',
      branch: 'MDU',
      date_of_first_updation: '2025-07-02',
      initial_actions: [
        'Submit counter-affidavit against criminal revision petition CRL RC No. 412/2025 in Madras HC Madurai Bench',
        'Instruct Special Public Prosecutor regarding rejection of statutory bail under Sec 43D(5) UAPA'
      ],
      progress_history: [
        {
          progress_date: '2026-02-18',
          progress_details: 'Counter-affidavit filed before Hon\\\'ble Division Bench, Madurai Bench of Madras High Court. State SPP argued that prima facie terror involvement bar under UAPA applies.',
          reminder_date: '2026-03-18',
          further_action: 'Submit sealed forensic analysis report of Telegram channel logs to Registrar General; Prepare for final arguments',
          remarks: 'Judgment reserved on bail application. Interim stay refused to accused.',
          completed_tasks: [
            'Submit counter-affidavit against criminal revision petition CRL RC No. 412/2025 in Madras HC Madurai Bench'
          ]
        }
      ]
    },
    {
      unique_id: 'ATS-CMB-2026-001',
      ps_limit: 'B-3 Kottaimedu PS / ATS Coimbatore',
      crime_number: 'Cr. No. 19/2024',
      section_of_law: 'Sec 16, 18, 18B, 20 UAPA & 302, 120B IPC & Explosives Act',
      date_of_occurrence: '2024-10-23',
      date_of_registration: '2024-10-23',
      complainant_name: 'Superintendent of Police / ATS Coimbatore Special Division',
      accused_details: 'A1: Jamesha Mubeen (Deceased)\nA2: Mohammed Azharudheen (Custody)\nA3: Afsar Khan (Custody)\nA4: Firos Ismail (Custody)',
      gist_of_case: 'High-profile vehicle explosion conspiracy case involving assembly of IEDs using gas cylinders, marbles, and ammonium nitrate. Multi-agency coordination with federal agencies.',
      current_stage: 'Pending Before Supreme Court',
      case_holding_officer_id: 'INS1CMB',
      case_holding_officer_name: 'Insp. E. Karthikeyan',
      branch: 'CMB',
      date_of_first_updation: '2024-11-01',
      initial_actions: [
        'Assist Standing Counsel for State of Tamil Nadu in Supreme Court SLP (Crl) No. 9812/2025',
        'Collate inter-state evidentiary records from Kerala ATS and Karnataka CID'
      ],
      progress_history: [
        {
          progress_date: '2026-02-10',
          progress_details: 'Conference held with Senior Advocate / Standing Counsel in New Delhi. Additional paper book containing joint forensics submitted before Hon\\\'ble Supreme Court.',
          reminder_date: '2026-04-12',
          further_action: 'Monitor SLP listing date before Court 3; Coordinate with Ministry of Home Affairs regarding inter-state transfer records',
          remarks: 'Notice issued to respondents on State\\\'s appeal against HC discharge order.',
          completed_tasks: [
            'Assist Standing Counsel for State of Tamil Nadu in Supreme Court SLP (Crl) No. 9812/2025'
          ]
        }
      ]
    },
    {
      unique_id: 'ATS-CMB-2026-002',
      ps_limit: 'C-2 Saibaba Colony PS / ATS Coimbatore',
      crime_number: 'Cr. No. 02/2026',
      section_of_law: 'Sec 17, 18, 40 UAPA (Terror Financing & Hawala)',
      date_of_occurrence: '2026-01-29',
      date_of_registration: '2026-02-01',
      complainant_name: 'Financial Intelligence Unit / ATS CMB',
      accused_details: 'A1: Abdul Samad (Arrested)\nA2: Riyaz Basha (Interrogated)',
      gist_of_case: 'Terror financing funnel utilizing anonymous cryptocurrency gift cards and shell firm accounts in Coimbatore and Tiruppur industrial clusters to route funds to banned outfits.',
      current_stage: 'Under Investigation',
      case_holding_officer_id: 'DSP CMB',
      case_holding_officer_name: 'Thiru N. Gunasekaran',
      branch: 'CMB',
      date_of_first_updation: '2026-02-03',
      initial_actions: [
        'Obtain Section 91 CrPC bank statements from 6 private banks',
        'Issue crypto wallet freeze notices to overseas virtual asset exchanges',
        'Summon statutory auditor of shell textile export entities'
      ],
      progress_history: [
        {
          progress_date: '2026-02-24',
          progress_details: 'Bank accounts of 3 shell firms frozen with Rs. 1.84 Crores in credit balances. Blockchain analytics report shows multi-hop laundering through P2P exchange.',
          reminder_date: '2026-03-28',
          further_action: 'Record statement of key hawala courier intercepted at Podanur junction; File remand extension petition',
          remarks: 'Significant lead obtained on overseas coordinator.',
          completed_tasks: [
            'Obtain Section 91 CrPC bank statements from 6 private banks'
          ]
        }
      ]
    },
    {
      unique_id: 'ATS-HQ-2026-001',
      ps_limit: 'Special Cyber & Arms Wing / ATS HQ',
      crime_number: 'Cr. No. 01/2026',
      section_of_law: 'Sec 16, 18, 23 UAPA & Sec 25(1AA) Arms Act 1959',
      date_of_occurrence: '2026-01-05',
      date_of_registration: '2026-01-09',
      complainant_name: 'Joint Operations Director, ATS Headquarters',
      accused_details: 'A1: T. Jayaraj (Arrested with 9mm Glock pistols)\nA2: Anthony Doss (Maritime smuggler)\nA3: Unknown handlers based in northern Sri Lanka',
      gist_of_case: 'Maritime weapons drop intercepted off the coast of Rameswaram destined for clandestine sleeper cells in coastal districts. High-capacity handguns and satellite comms recovered.',
      current_stage: 'Under Investigation',
      case_holding_officer_id: 'ADSP HQ',
      case_holding_officer_name: 'Thiru G. Venkatesan',
      branch: 'HQ',
      date_of_first_updation: '2026-01-12',
      initial_actions: [
        'Liaise with Indian Coast Guard for coastal radar logs of suspicious trawler',
        'Submit seized ballistic evidence to Forensic Sciences Dept, Chennai',
        'Trace IMEI numbers of Thuraya satellite handsets'
      ],
      progress_history: [
        {
          progress_date: '2026-02-27',
          progress_details: 'Ballistic examination confirmed weapons are factory-spec 9mm military firearms with obliterated serial numbers. Thuraya GPS coordinates pinpointed offshore drop point 8 nautical miles from Dhanushkodi.',
          reminder_date: '2026-03-31',
          further_action: 'Deploy QRT tactical team for joint search of offshore sandbanks; Interrogate local boat owner under police remand',
          remarks: 'Coast Guard regional command alerted for heightened radar surveillance.',
          completed_tasks: [
            'Submit seized ballistic evidence to Forensic Sciences Dept, Chennai'
          ]
        }
      ]
    }
  ];

  const caseInsert = db.prepare(`
    INSERT INTO cases (
      unique_id, ps_limit, crime_number, section_of_law, date_of_occurrence,
      date_of_registration, complainant_name, accused_details, gist_of_case,
      current_stage, case_holding_officer_id, case_holding_officer_name, branch,
      date_of_first_updation, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const actionInsert = db.prepare(`
    INSERT INTO action_items (
      case_id, case_unique_id, task_description, is_completed, completed_at,
      completed_by_officer, source_type, progress_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const progressInsert = db.prepare(`
    INSERT INTO progress_updates (
      case_id, case_unique_id, officer_id, officer_name, progress_date,
      progress_details, reminder_date, further_action, remarks, stage_at_update, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of sampleCases) {
    const caseResult = caseInsert.run(
      c.unique_id,
      c.ps_limit,
      c.crime_number,
      c.section_of_law,
      c.date_of_occurrence,
      c.date_of_registration,
      c.complainant_name,
      c.accused_details,
      c.gist_of_case,
      c.current_stage,
      c.case_holding_officer_id,
      c.case_holding_officer_name,
      c.branch,
      c.date_of_first_updation,
      c.date_of_first_updation + ' 10:00:00',
      c.date_of_first_updation + ' 10:00:00'
    );

    const caseId = Number(caseResult.lastInsertRowid);

    // Initial Actions
    for (const act of c.initial_actions) {
      actionInsert.run(
        caseId,
        c.unique_id,
        act,
        0,
        null,
        null,
        'INITIAL',
        null,
        c.date_of_first_updation + ' 10:00:00'
      );
    }

    // Process progress history if any
    for (const p of c.progress_history) {
      const progResult = progressInsert.run(
        caseId,
        c.unique_id,
        c.case_holding_officer_id,
        c.case_holding_officer_name,
        p.progress_date,
        p.progress_details,
        p.reminder_date,
        p.further_action,
        p.remarks,
        c.current_stage,
        p.progress_date + ' 15:30:00'
      );

      const progId = Number(progResult.lastInsertRowid);

      // Complete designated tasks
      if (p.completed_tasks && p.completed_tasks.length > 0) {
        for (const taskText of p.completed_tasks) {
          db.prepare(`
            UPDATE action_items
            SET is_completed = 1, completed_at = ?, completed_by_officer = ?
            WHERE case_id = ? AND task_description = ?
          `).run(p.progress_date + ' 15:30:00', c.case_holding_officer_id, caseId, taskText);
        }
      }

      // Add the Further Action as new active action items
      if (p.further_action) {
        const subActions = p.further_action.split(';').map(s => s.trim()).filter(Boolean);
        for (const sa of subActions) {
          actionInsert.run(
            caseId,
            c.unique_id,
            sa,
            0,
            null,
            null,
            'PROGRESS_UPDATE',
            progId,
            p.progress_date + ' 15:35:00'
          );
        }
      }
    }
  }

  console.log(`Seeded ${sampleCases.length} authentic ATS cases.`);
}

seedDatabase();
