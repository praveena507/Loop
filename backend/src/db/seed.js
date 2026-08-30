import bcrypt from 'bcryptjs';
import { dbRun, dbGet, initDatabase } from './initDb.js';
import { seed50Complaints } from '../scripts/seed50Complaints.js';

export async function seedDatabase() {
  await initDatabase();
  const now = new Date().toISOString();

  const existingAdmin = await dbGet('SELECT * FROM staff_users WHERE email = ?', ['admin@loop.com']);
  if (!existingAdmin) {
    const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
    const analystPasswordHash = await bcrypt.hash('Analyst@12345', 10);

    // Insert Admin
    await dbRun(
      `INSERT INTO staff_users (id, name, email, passwordHash, plainPassword, role, status, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['usr_admin_01', 'System Administrator', 'admin@loop.com', adminPasswordHash, 'Admin@12345', 'ADMIN', 'ACTIVE', now, now]
    );

    // Insert Analyst
    await dbRun(
      `INSERT INTO staff_users (id, name, email, passwordHash, plainPassword, role, status, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['usr_analyst_01', 'Lead Analyst', 'analyst@loop.com', analystPasswordHash, 'Analyst@12345', 'ANALYST', 'ACTIVE', now, now]
    );

    console.log('Seed: Default staff users created.');
  }

  // Backfill plainPassword for existing default staff accounts if null
  await dbRun("UPDATE staff_users SET plainPassword = 'Admin@12345' WHERE email = 'admin@loop.com' AND (plainPassword IS NULL OR plainPassword = '')");
  await dbRun("UPDATE staff_users SET plainPassword = 'Analyst@12345' WHERE email = 'analyst@loop.com' AND (plainPassword IS NULL OR plainPassword = '')");

  // Check complaint count and automatically seed complete 50 complaints dataset with analyst assignments
  try {
    const complaintCount = await dbGet('SELECT COUNT(*) as count FROM complaints');
    if (!complaintCount || complaintCount.count < 20) {
      console.log(`Database has ${complaintCount?.count || 0} complaints. Seeding complete 50 enterprise complaints dataset...`);
      await seed50Complaints();
    }
  } catch (err) {
    console.error('Auto-seed 50 complaints notice:', err);
  }

  console.log('Seed: Database verification and staff accounts confirmed ready.');
}
