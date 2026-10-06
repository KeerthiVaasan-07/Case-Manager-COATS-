# COATS – CASES OF ANTI TERRORISM SQUAD
### Anti-Terrorism Squad (ATS) Specialized Case Management & Intelligence System
*Government of Tamil Nadu • Police Department*

---

## 🛡️ Project Overview

**COATS** is an enterprise-grade, high-security Case Management System engineered specifically for the Anti-Terrorism Squad (ATS). It implements rigorous role-based access control (RBAC), multi-stage legal case lifecycle management, dynamic task checklist resolution, and an interactive supervisory analytical command center.

### 🏛️ Organizational Structure & Units
The system models the operational hierarchy of the Anti-Terrorism Squad across **3 Branch Offices** and **1 Headquarters**:
1. **Headquarters (HQ)**: Headed by **DIG ATS** and **Superintendent of Police (SP ATS HQ)**
2. **Chennai Branch (CNI)**: Headed by **Superintendent of Police (SP ATS CNI)**
3. **Madurai Branch (MDU)**: Headed by **Superintendent of Police (SP ATS MDU)**
4. **Coimbatore Branch (CMB / CMD)**: Headed by **Superintendent of Police (SP ATS CMB)**

Each Unit comprises:
- **1 Additional Superintendent of Police (ADSP)**
- **1 Deputy Superintendent of Police (DSP)**
- **4 Inspectors of Police (INS1 through INS4)**

---

## 🔑 Login Credentials Directory

| Category | User ID | Branch / Unit | Designation & Rank | Default Password |
| :--- | :--- | :--- | :--- | :--- |
| **Supervisory Officer** | `DIG ATS` | Headquarters (HQ) | Deputy Inspector General of Police, ATS | *(generated)* |
| **Supervisory Officer** | `SP ATS HQ` | Headquarters (HQ) | Superintendent of Police, ATS HQ | *(generated)* |
| **Supervisory Officer** | `SP ATS CNI` | Chennai Branch | Superintendent of Police, ATS Chennai | *(generated)* |
| **Supervisory Officer** | `SP ATS MDU` | Madurai Branch | Superintendent of Police, ATS Madurai | *(generated)* |
| **Supervisory Officer** | `SP ATS CMB` | Coimbatore Branch | Superintendent of Police, ATS Coimbatore | *(generated)* |
| **Case Holding Officer** | `ADSP HQ` | Headquarters (HQ) | Additional Superintendent of Police, ATS HQ | *(generated)* |
| **Case Holding Officer** | `INSADMIN` | Headquarters (HQ) | Inspector of Police (Admin & Special Wing) | *(generated)* |
| **Case Holding Officer** | `ADSP CNI` | Chennai Branch | Additional Superintendent of Police, ATS CNI | *(generated)* |
| **Case Holding Officer** | `DSP CNI` | Chennai Branch | Deputy Superintendent of Police, ATS CNI | *(generated)* |
| **Case Holding Officer** | `INS1CNI` | Chennai Branch | Inspector of Police, Unit 1, ATS Chennai | *(generated)* |
| **Case Holding Officer** | `INS2CNI` | Chennai Branch | Inspector of Police, Unit 2, ATS Chennai | *(generated)* |
| **Case Holding Officer** | `INS3CNI` | Chennai Branch | Inspector of Police, Unit 3, ATS Chennai | *(generated)* |
| **Case Holding Officer** | `INS4CNI` | Chennai Branch | Inspector of Police, Unit 4, ATS Chennai | *(generated)* |
| **Case Holding Officer** | `ADSP MDU` | Madurai Branch | Additional Superintendent of Police, ATS MDU | *(generated)* |
| **Case Holding Officer** | `DSP MDU` | Madurai Branch | Deputy Superintendent of Police, ATS MDU | *(generated)* |
| **Case Holding Officer** | `INS1MDU` | Madurai Branch | Inspector of Police, Unit 1, ATS Madurai | *(generated)* |
| **Case Holding Officer** | `INS2MDU` | Madurai Branch | Inspector of Police, Unit 2, ATS Madurai | *(generated)* |
| **Case Holding Officer** | `INS3MDU` | Madurai Branch | Inspector of Police, Unit 3, ATS Madurai | *(generated)* |
| **Case Holding Officer** | `INS4MDU` | Madurai Branch | Inspector of Police, Unit 4, ATS Madurai | *(generated)* |
| **Case Holding Officer** | `ADSP CMD` | Coimbatore Branch | Additional Superintendent of Police, ATS CMB | *(generated)* |
| **Case Holding Officer** | `DSP CMB` | Coimbatore Branch | Deputy Superintendent of Police, ATS CMB | *(generated)* |
| **Case Holding Officer** | `INS1CMB` | Coimbatore Branch | Inspector of Police, Unit 1, ATS Coimbatore | *(generated)* |
| **Case Holding Officer** | `INS2CMB` | Coimbatore Branch | Inspector of Police, Unit 2, ATS Coimbatore | *(generated)* |
| **Case Holding Officer** | `INS3CMB` | Coimbatore Branch | Inspector of Police, Unit 3, ATS Coimbatore | *(generated)* |
| **Case Holding Officer** | `INS4CMB` | Coimbatore Branch | Inspector of Police, Unit 4, ATS Coimbatore | *(generated)* |

> 💡 **Quick Demo Switcher**: A **"SWITCH OFFICER"** button is embedded directly on the top navbar and login screen. Clicking any officer logs you in immediately with 1 click to test strict permissions.

---

## ⚖️ Case Stages (4 Classifications)
1. **Under Investigation (UI)**: Active investigation, evidence collection, forensic reports, remand extension.
2. **Pending Trial (PT)**: Chargesheet filed before Special ATS / Sessions Court, witness summons, framing of charges.
3. **Pending Before High Court**: Criminal appeals, revision petitions, statutory bail challenges in Madras HC.
4. **Pending Before Supreme Court**: Special Leave Petitions (SLP), constitutional questions, inter-state transfer petitions.

---

## 🔄 Step-by-Step Workflow

### Step 1: Updation of Basic Case Details (First Time Entry)
1. **PS Limit** (Police station jurisdiction)
2. **Crime Number** (e.g. Cr. No. 04/2026)
3. **Section of Law** (e.g. Sec 16, 18, 20 UAPA r/w 120B IPC)
4. **Date of Occurrence**
5. **Date of Registration**
6. **Name of the Complainant**
7. **Details of the Accused**
8. **Gist of the Case**
9. **Current Stage of the Case** (`UI`, `PT`, `High Court`, `Supreme Court`)
10. **Case Holding Officer** (Locked to current officer)
11. **Action To be Taken** (Initial checklist of tasks)
12. **Date of First Updation**
13. **Unique ID** (Automatically assigned: `ATS-[BRANCH]-[YEAR]-[SEQ]`)

### Step 2: Progress Updation & Dynamic Checklist Engine
1. Select Case Unique ID from dropdown (Case Holding Officers see strictly their assigned cases).
2. **Active Action To Be Taken Checklist**:
   - Displays pending tasks.
   - Checking a box marks the task completed and removes it from subsequent updates.
3. Fill new progress fields:
   - **10. Date of Progress**
   - **11. Details of Progress** (Field notes, forensics, court orders)
   - **12. Reminder Date** (Next court hearing or statutory deadline)
   - **13. Further Action To be Taken** (Automatically becomes the new active checklist for future updates)
   - **14. Remarks** (Confidential notes)
4. Submit updates immediately to the SQLite database.

### Step 3: Supervisory Officer Command Dashboard
1. **Branch Office Filter**: All Units, Chennai, Madurai, Coimbatore, Headquarters.
2. **Real-time Stage Counts**: UI, PT, High Court, Supreme Court counts.
3. **Date Range Filter**: Select Start Date and End Date (or quick presets like 7D, 30D, Year).
4. **Progress Details Feed**: Automatically updates to display entries recorded within that timeframe.
5. **Action To Be Taken Matrix**: Displays the current active tasks across cases.
6. **Case Dossier & Printable Briefs**: Generate formal police dossiers for court and supervisory reviews.

---

## 🚀 How to Run the Application

### Option A: Double-Click Quick Launch
Simply double-click `START_COATS.bat` in this folder. It will launch both backend and frontend servers and open your browser to `http://localhost:3000`.

### Option B: Manual Command Line
```powershell
# 1. Start Backend Server (Port 5000)
cd "server"
npm start

# 2. In a separate terminal, start Frontend Client (Port 3000)
cd "client"
npm run dev
```

Open your browser at: **`http://localhost:3000`**


## Security notes

- Passwords are random per officer and stored only as bcrypt hashes. On first start (or after `SEED_DATA.bat`) they are written once to `server/data/INITIAL_CREDENTIALS.txt`. Hand them out, then delete the file.
- The JWT secret is generated per installation (`server/data/jwt.secret`) or taken from `JWT_SECRET`. Never commit `server/data/`.
- Login is rate limited, accounts lock for 15 minutes after 5 failures, and every API call is recorded in `audit_log` (supervisory users can read it at `GET /api/audit`).
- The API listens on `127.0.0.1` only and accepts browser requests only from `http://localhost:3000`. To expose it, set `HOST` and `CORS_ORIGIN` and put it behind HTTPS.
- `START_COATS.bat` turns on `DEMO_MODE`, which allows password-less officer switching from this machine only. Remove that line for any real deployment.
