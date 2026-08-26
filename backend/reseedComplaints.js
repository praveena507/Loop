import { dbRun } from './src/db/initDb.js';
import { seed50Complaints } from './src/scripts/seed50Complaints.js';

async function reseed() {
  console.log('🧹 Cleaning old database records...');
  await dbRun('DELETE FROM complaints');
  await dbRun('DELETE FROM ai_analysis');
  await dbRun('DELETE FROM complaint_actions');
  await dbRun('DELETE FROM responses');
  await dbRun('DELETE FROM complaint_status_history');
  console.log('✅ Cleaned! Re-seeding 50 complete corporate complaints...');
  await seed50Complaints();
  process.exit(0);
}

reseed().catch((err) => {
  console.error(err);
  process.exit(1);
});
