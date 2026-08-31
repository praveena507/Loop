import { dbRun, dbGet, initDatabase } from './initDb.js';
import { seed135Complaints } from '../scripts/seed135Complaints.js';

export async function seedDatabase() {
  await initDatabase();

  // Seed 10 Analysts & 135 complaints
  try {
    const complaintCount = await dbGet('SELECT COUNT(*) as count FROM complaints');
    const analystCount = await dbGet('SELECT COUNT(*) as count FROM staff_users WHERE role = ?', ['ANALYST']);
    if (!complaintCount || complaintCount.count < 135 || !analystCount || analystCount.count < 10) {
      console.log(`Database has ${complaintCount?.count || 0} complaints and ${analystCount?.count || 0} analysts. Auto-populating 10 Analysts & 135 complaints dataset...`);
      await seed135Complaints();
    }
  } catch (err) {
    console.error('Auto-seed 135 complaints notice:', err);
  }

  console.log('Seed: Database verification and staff accounts confirmed ready.');
}

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').includes('seed.js')) {
  seedDatabase()
    .then(() => {
      console.log('Database seed finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed fatal error:', err);
      process.exit(1);
    });
}

