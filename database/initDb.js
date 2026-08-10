import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../backend/src/config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../backend/loop.db');

export const db = new sqlite3.Database(dbPath);

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

export const supabaseQuery = {
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
      await supabase.from('complaint_status_history').insert([{
        id: `sh_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        complaintId: id,
        status,
        createdAt: now
      }]);
    } catch (e) {}
  },

  async insertAiAnalysis(data) {
    try {
      const { data: res, error } = await supabase.from('complaint_ai_analysis').insert([data]).select();
      if (error) {
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
  }
};
