-- ====================================================================
-- LOOP AI-POWERED CUSTOMER FEEDBACK INTELLIGENCE PLATFORM
-- SUPABASE / RELATIONAL DATABASE SCHEMA DEFINITION
-- ====================================================================

-- 1. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- 2. STAFF USERS TABLE (ADMIN & ANALYST)
CREATE TABLE IF NOT EXISTS staff_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  role TEXT CHECK(role IN ('ADMIN', 'ANALYST')) NOT NULL,
  status TEXT CHECK(status IN ('ACTIVE', 'INACTIVE')) DEFAULT 'ACTIVE',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- 3. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS complaints (
  id TEXT PRIMARY KEY,
  complaintNumber TEXT NOT NULL UNIQUE,
  customerId TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  place TEXT NOT NULL,
  category TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  attachmentUrl TEXT,
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE SET NULL
);

-- 4. COMPLAINT AI ANALYSIS TABLE
CREATE TABLE IF NOT EXISTS complaint_ai_analysis (
  id TEXT PRIMARY KEY,
  complaintId TEXT NOT NULL UNIQUE,
  sentiment TEXT NOT NULL,
  sentimentScore REAL DEFAULT 0,
  category TEXT NOT NULL,
  theme TEXT NOT NULL,
  priority TEXT NOT NULL,
  priorityScore REAL DEFAULT 0,
  summary TEXT NOT NULL,
  keywords TEXT NOT NULL,
  suggestedResponse TEXT NOT NULL,
  attachmentAnalyzed INTEGER DEFAULT 0,
  attachmentSummary TEXT,
  proofMatch TEXT,
  rootCause TEXT,
  sectionName TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (complaintId) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 5. COMPLAINT STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS complaint_status_history (
  id TEXT PRIMARY KEY,
  complaintId TEXT NOT NULL,
  status TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (complaintId) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 6. COMPLAINT THEMES TABLE
CREATE TABLE IF NOT EXISTS complaint_themes (
  id TEXT PRIMARY KEY,
  themeName TEXT NOT NULL,
  description TEXT,
  complaintCount INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL
);

-- 7. ANALYST ACTIONS TABLE
CREATE TABLE IF NOT EXISTS analyst_actions (
  id TEXT PRIMARY KEY,
  complaintId TEXT NOT NULL,
  analystId TEXT,
  action TEXT NOT NULL,
  notes TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (complaintId) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (analystId) REFERENCES staff_users(id) ON DELETE SET NULL
);

-- 8. RESPONSES TABLE
CREATE TABLE IF NOT EXISTS responses (
  id TEXT PRIMARY KEY,
  complaintId TEXT NOT NULL UNIQUE,
  analystId TEXT,
  responseText TEXT NOT NULL,
  sentAt TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (complaintId) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (analystId) REFERENCES staff_users(id) ON DELETE SET NULL
);

-- 9. EMAIL VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS email_verifications (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  otpHash TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  verified INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL
);

-- 10. PASSWORD RESET TOKENS TABLE
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  userId TEXT,
  complaintId TEXT,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES staff_users(id) ON DELETE CASCADE,
  FOREIGN KEY (complaintId) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 12. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  userId TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entityId TEXT,
  ipAddress TEXT,
  createdAt TEXT NOT NULL
);

-- 13. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'ACTIVE',
  createdAt TEXT NOT NULL
);

-- 14. DEPARTMENT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS department_requests (
  id TEXT PRIMARY KEY,
  complaintId TEXT NOT NULL,
  departmentId TEXT,
  departmentName TEXT NOT NULL,
  requestedBy TEXT NOT NULL,
  priority TEXT CHECK(priority IN ('P1', 'P2', 'P3', 'P4')) DEFAULT 'P2',
  requiredInformation TEXT NOT NULL,
  reason TEXT NOT NULL,
  deadline TEXT,
  status TEXT CHECK(status IN ('PENDING', 'UNDER_INVESTIGATION', 'REPORT_SUBMITTED', 'MORE_INFO_REQUESTED', 'COMPLETED')) DEFAULT 'PENDING',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (complaintId) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 15. DEPARTMENT REPORTS TABLE
CREATE TABLE IF NOT EXISTS department_reports (
  id TEXT PRIMARY KEY,
  requestId TEXT NOT NULL UNIQUE,
  complaintId TEXT NOT NULL,
  departmentName TEXT NOT NULL,
  investigationResult TEXT NOT NULL,
  evidence TEXT NOT NULL,
  finding TEXT NOT NULL,
  actionTaken TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  supportingDocs TEXT,
  submittedAt TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (requestId) REFERENCES department_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (complaintId) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 16. COMPLAINT FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS complaint_feedback (
  id TEXT PRIMARY KEY,
  complaintId TEXT NOT NULL UNIQUE,
  complaintNumber TEXT NOT NULL,
  userEmail TEXT NOT NULL,
  rating INTEGER CHECK(rating BETWEEN 1 AND 5) NOT NULL,
  resolvedSatisfaction TEXT CHECK(resolvedSatisfaction IN ('Yes', 'Partially', 'No')) NOT NULL,
  feedbackText TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (complaintId) REFERENCES complaints(id) ON DELETE CASCADE
);

