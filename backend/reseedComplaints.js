import { dbRun, initDatabase } from './src/db/initDb.js';
import { seed135Complaints } from './src/scripts/seed135Complaints.js';

async function reseed() {
  await initDatabase();
  console.log('🧹 Cleaning old database records...');
  await dbRun('DELETE FROM complaints');
  await dbRun('DELETE FROM ai_analysis');
  await dbRun('DELETE FROM complaint_actions');
  await dbRun('DELETE FROM responses');
  await dbRun('DELETE FROM complaint_status_history');
  await dbRun('DELETE FROM department_requests');
  await dbRun('DELETE FROM department_reports');
  await dbRun('DELETE FROM complaint_feedback');
  console.log('✅ Cleaned! Re-seeding 135 complete corporate complaints across 11 analysts...');
  await seed135Complaints();
  console.log('🚀 Reseed complete.');
  process.exit(0);
}

reseed().catch((err) => {
  console.error(err);
  process.exit(1);
});

