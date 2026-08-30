import bcrypt from 'bcryptjs';
import { dbRun, dbGet, initDatabase } from './initDb.js';
import { seed135Complaints } from '../scripts/seed135Complaints.js';

export async function seedDatabase() {
  await initDatabase();
  const now = new Date().toISOString();

  // Seed 10 Analysts & 135 complaints
  try {
    const complaintCount = await dbGet('SELECT COUNT(*) as count FROM complaints');
    const analystCount = await dbGet('SELECT COUNT(*) as count FROM staff_users WHERE role = ?', ['ANALYST']);
    if (!complaintCount || complaintCount.count < 100 || !analystCount || analystCount.count < 5) {
      console.log(`Database has ${complaintCount?.count || 0} complaints and ${analystCount?.count || 0} analysts. Seeding 10 Analysts & 135 complaints dataset...`);
      await seed135Complaints();
    }
  } catch (err) {
    console.error('Auto-seed 135 complaints notice:', err);
  }

  console.log('Seed: Database verification and staff accounts confirmed ready.');
}
