import { dbAll, dbGet } from './src/db/initDb.js';

async function check() {
  const compCount = await dbGet('SELECT COUNT(*) as count FROM complaints');
  const aiCount = await dbGet('SELECT COUNT(*) as count FROM ai_analysis');
  const users = await dbAll('SELECT id, name, email, role FROM staff_users');
  
  console.log('📊 DB CHECK RESULTS:');
  console.log('Complaints Count:', compCount);
  console.log('AI Analysis Count:', aiCount);
  console.log('Staff Users:', users);
  process.exit(0);
}

check().catch(console.error);
