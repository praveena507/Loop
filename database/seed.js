import bcrypt from 'bcryptjs';
import { dbRun, dbGet, initDatabase } from '../backend/src/db/initDb.js';

export async function seedDatabase() {
  await initDatabase();

  const existingAdmin = await dbGet('SELECT * FROM staff_users WHERE email = ?', ['admin@loop.com']);
  if (!existingAdmin) {
    const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
    const analystPasswordHash = await bcrypt.hash('Analyst@12345', 10);
    const now = new Date().toISOString();

    await dbRun(
      `INSERT INTO staff_users (id, name, email, passwordHash, role, status, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['usr_admin_01', 'System Administrator', 'admin@loop.com', adminPasswordHash, 'ADMIN', 'ACTIVE', now, now]
    );

    await dbRun(
      `INSERT INTO staff_users (id, name, email, passwordHash, role, status, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['usr_analyst_01', 'Lead Analyst', 'analyst@loop.com', analystPasswordHash, 'ANALYST', 'ACTIVE', now, now]
    );

    console.log('Seed: Default staff users created.');
  }
}
