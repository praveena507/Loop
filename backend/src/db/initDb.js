import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../loop.db');

export const db = new sqlite3.Database(dbPath);

// Helper wrappers for Promise-based SQL operations (SQLite fallback)
export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Supabase Helper Functions mapping to existing Supabase tables
export const supabaseQuery = {
  // Complaints
  async insertComplaint(data) {
    try {
      const { data: res, error } = await supabase.from('complaints').insert([data]).select();
      if (error) console.warn('Supabase insertComplaint notice:', error.message);
      return res ? res[0] : null;
    } catch (e) {
      return null;
    }
  },

  async updateComplaintStatus(id, status) {
    try {
      const now = new Date().toISOString();
      await supabase.from('complaints').update({ status, updatedAt: now }).eq('id', id);
      // Append every status change to complaint_status_history
      await supabase.from('complaint_status_history').insert([{
        id: `sh_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        complaintId: id,
        status,
        createdAt: now
      }]);
    } catch (e) {
      // Ignored
    }
  },

  async insertAiAnalysis(data) {
    try {
      const { data: res, error } = await supabase.from('complaint_ai_analysis').insert([data]).select();
      if (error) {
        // Fallback table name attempt if named ai_analysis
        await supabase.from('ai_analysis').insert([data]);
      }
      return res;
    } catch (e) {
      return null;
    }
  },

  async insertAnalystAction(data) {
    try {
      const { data: res, error } = await supabase.from('analyst_actions').insert([data]).select();
      if (error) {
        await supabase.from('complaint_actions').insert([data]);
      }
      return res;
    } catch (e) {
      return null;
    }
  },

  async insertResponse(data) {
    try {
      const { data: res, error } = await supabase.from('responses').insert([data]).select();
      return res;
    } catch (e) {
      return null;
    }
  },

  async insertNotification(data) {
    try {
      await supabase.from('notifications').insert([data]);
    } catch (e) {}
  },

  async insertAuditLog(data) {
    try {
      await supabase.from('audit_logs').insert([data]);
    } catch (e) {}
  }
};

export async function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        db.run('PRAGMA foreign_keys = ON;');

        // 1. CUSTOMERS
        db.run(`
          CREATE TABLE IF NOT EXISTS customers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            emailVerified INTEGER DEFAULT 0,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
          );
        `);

        // 2. STAFF_USERS
        db.run(`
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
        `);

        // 3. COMPLAINTS
        db.run(`
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
            updatedAt TEXT NOT NULL
          );
        `);

        // 4. AI_ANALYSIS
        db.run(`
          CREATE TABLE IF NOT EXISTS ai_analysis (
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
            confidence TEXT,
            severity TEXT,
            urgency TEXT,
            impact TEXT,
            affectedScope TEXT,
            priorityReason TEXT,
            keyFactors TEXT,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
          );
        `);

        // Migration safety for missing ai_analysis columns
        const aiCols = ['confidence', 'severity', 'urgency', 'impact', 'affectedScope', 'priorityReason', 'keyFactors'];
        for (const col of aiCols) {
          db.run(`ALTER TABLE ai_analysis ADD COLUMN ${col} TEXT`, () => {});
        }

        // 5. COMPLAINT_STATUS_HISTORY
        db.run(`
          CREATE TABLE IF NOT EXISTS complaint_status_history (
            id TEXT PRIMARY KEY,
            complaintId TEXT NOT NULL,
            status TEXT NOT NULL,
            createdAt TEXT NOT NULL
          );
        `);

        // 6. COMPLAINT_ACTIONS
        db.run(`
          CREATE TABLE IF NOT EXISTS complaint_actions (
            id TEXT PRIMARY KEY,
            complaintId TEXT NOT NULL,
            analystId TEXT,
            action TEXT NOT NULL,
            notes TEXT,
            createdAt TEXT NOT NULL
          );
        `);

        // 7. RESPONSES
        db.run(`
          CREATE TABLE IF NOT EXISTS responses (
            id TEXT PRIMARY KEY,
            complaintId TEXT NOT NULL UNIQUE,
            analystId TEXT,
            responseText TEXT NOT NULL,
            sentAt TEXT NOT NULL,
            createdAt TEXT NOT NULL
          );
        `);

        // 8. EMAIL_VERIFICATIONS
        db.run(`
          CREATE TABLE IF NOT EXISTS email_verifications (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            otpHash TEXT NOT NULL,
            expiresAt TEXT NOT NULL,
            verified INTEGER DEFAULT 0,
            createdAt TEXT NOT NULL
          );
        `);

        // 9. PASSWORD_RESET_TOKENS
        db.run(`
          CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            token TEXT NOT NULL,
            expiresAt TEXT NOT NULL,
            used INTEGER DEFAULT 0,
            createdAt TEXT NOT NULL
          );
        `);

        // 10. NOTIFICATIONS
        db.run(`
          CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            userId TEXT,
            complaintId TEXT,
            type TEXT NOT NULL,
            message TEXT NOT NULL,
            read INTEGER DEFAULT 0,
            createdAt TEXT NOT NULL
          );
        `);

        // 11. AUDIT_LOGS
        db.run(`
          CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            userId TEXT,
            action TEXT NOT NULL,
            entity TEXT NOT NULL,
            entityId TEXT,
            ipAddress TEXT,
            createdAt TEXT NOT NULL
          );
        `, (err) => {
          if (err) {
            console.error('Database initialization error:', err);
            reject(err);
          } else {
            console.log('LOOP Supabase & Local Database initialized with status history & audit log tables.');
            resolve();
          }
        });

      } catch (err) {
        console.error('Failed to initialize database:', err);
        reject(err);
      }
    });
  });
}
