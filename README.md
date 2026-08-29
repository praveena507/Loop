# LOOP — AI-Powered Grievance & Customer Resolution Platform

LOOP is an enterprise customer resolution and intelligence platform architected with strict role separation, automated AI triage, department investigation coordination, and real-time status tracking.

---

## 🏛️ System Architecture

LOOP is structured into **two independent frontend applications** connected to a **single shared backend** and a **unified Supabase database**:

```
LOOP/
├── user-portal/              # FRONTEND 1: Dedicated Customer Portal (Port 3000)
│   ├── src/
│   │   ├── components/       # Navbar, Footer, StatusBadge
│   │   ├── context/          # UserAuthContext (Customer email OTP / session)
│   │   ├── pages/            # Landing, Login, Register, Dashboard, Submit, Track, History, Feedback, Profile
│   │   └── services/         # api.js, emailjsService.js
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── admin-analyst-portal/     # FRONTEND 2: Staff Enterprise Workbench (Port 3002)
│   ├── src/
│   │   ├── components/       # StaffHeader, StaffSidebar, Badges
│   │   ├── context/          # AuthContext (JWT tokens, Admin & Analyst role guard)
│   │   ├── pages/            # Staff Login, Dashboard, Case Inbox, AI Workbench, Dept Coordination, Feedback, Users
│   │   ├── services/         # api.js (Staff & Admin endpoints)
│   │   └── utils/            # csvExporter.js
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── backend/                  # Shared Node.js / Express Backend (Port 5000)
│   ├── src/
│   │   ├── controllers/      # Complaint, Auth, Admin, Department, Feedback, Verification
│   │   ├── middleware/       # JWT Authentication & Role Authorization
│   │   ├── routes/           # REST API endpoints
│   │   ├── services/         # Gemini AI Triage & Email Service
│   │   └── server.js         # Express Server
│   ├── package.json
│   └── .env.example
│
└── database/                 # Unified Supabase & SQLite Schema & Migrations
    ├── schema.sql            # Core database schema
    ├── initDb.js             # Table initialization
    └── seed.js               # Initial staff accounts & sample tickets
```

---

## 🚀 Applications Overview

### 1. Customer Portal (`user-portal/`)
- **Port**: `http://localhost:3000`
- **Purpose**: Transparent grievance submission, real-time OTP email verification, step-by-step progress tracking, customer dashboard, and resolution satisfaction feedback.
- **Routes**:
  - `/` — Public Landing Page with system status and feature highlights.
  - `/login` — Customer sign-in via instant 6-digit email OTP.
  - `/register` — Customer account creation with email verification.
  - `/dashboard` — Customer dashboard with ticket counts, quick submission, and recent status cards.
  - `/complaint` & `/submit-complaint` — File a new complaint with file attachments (images, PDF receipts).
  - `/verify-email` — 2.5-minute OTP email verification screen.
  - `/complaint-success` — Ticket confirmation page with copyable tracking ID.
  - `/complaints` — Complete history of submitted complaints with category and status filters.
  - `/track` & `/complaint/:id` — Live tracking pipeline, official resolution notice, and feedback form.
  - `/feedback` — Resolution satisfaction review (1-5 stars, issue resolved status, comments).
  - `/profile` — Customer verified account profile.

### 2. Admin & Analyst Portal (`admin-analyst-portal/`)
- **Port**: `http://localhost:3002`
- **Purpose**: Full-featured case management, workload-balanced analyst assignment, AI-assisted triage review, department proof coordination, explicit resolution generator, staff account management, analytics, and audit logging.
- **Routes**:
  - `/` & `/login` & `/staff/login` — Dual-role authentication (Analyst & Administrator tabs) with OTP password reset.
  - `/staff/dashboard` — Live operational KPI metrics, critical alert banners, SLA velocity, and recent cases.
  - `/staff/complaints` — Searchable case inbox with multi-attribute filtering (Status, Category, Priority, Sentiment, Assigned to Me).
  - `/staff/complaints/:id` — Complaint detail workbench: AI triage insights, document proof viewer, analyst case assignment, department request modal, explicit solution generator, and final email dispatch.
  - `/staff/departments` — Department coordination, proof requests, and queue management.
  - `/staff/analytics` — Volume distribution, sentiment trend analysis, and SLA performance charts.
  - `/staff/reports` — CSV report generation and export.
  - `/staff/notifications` — Real-time staff notifications.
  - `/staff/admin/feedback` — *(Admin Only)* Customer satisfaction insights, average star ratings, and response quality metrics.
  - `/staff/admin/users` — *(Admin Only)* Create, edit, deactivate, and manage Analyst staff accounts.
  - `/staff/admin/settings` & `/staff/admin/audit-logs` — *(Admin Only)* System settings and immutable audit trails.

---

## 🔒 Security & Privacy Architecture

1. **Analyst Case Isolation**:
   - Analysts strictly view only complaints assigned to their account.
   - Enforced at frontend route guards, backend controllers, and database query filters.
2. **Customer Privacy Boundary**:
   - Customer tracking routes expose **no** internal staff IDs, no internal analyst notes, and no private server keys.
   - Public customer tracking data is strictly sanitized before transmission.
3. **Secret Protection**:
   - Frontends only contain public anonymous keys (`VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`).
   - Gemini API keys, JWT secrets, and Supabase service role keys reside strictly in the backend `.env`.

---

## ⚙️ Local Development Setup

### 1. Backend Setup
```bash
cd backend
npm install
node src/server.js
# Backend runs on http://localhost:5000
```

### 2. User Portal Setup
```bash
cd user-portal
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

### 3. Admin & Analyst Portal Setup
```bash
cd admin-analyst-portal
npm install
npm run dev
# Frontend runs on http://localhost:3002
```

---

## 🔑 Default Credentials

| Role | Email | Password |
|---|---|---|
| **System Administrator** | `admin@loop.com` | `Admin@12345` |
| **Lead Analyst** | `analyst@loop.com` | `Analyst@12345` |
| **Sample Customer** | `sarah.j@example.com` | *(Instant Email OTP)* |

---

## 📦 Production Deployment Guide

| Component | Target Platform | Root Directory | Build Command | Output Directory |
|---|---|---|---|---|
| **User Portal** | Vercel | `user-portal` | `npm run build` | `dist` |
| **Admin/Analyst Portal** | Vercel | `admin-analyst-portal` | `npm run build` | `dist` |
| **Backend API** | Render / Railway | `backend` | `npm install` | `src/server.js` |
| **Database** | Supabase | `database` | `schema.sql` | Managed Cloud |