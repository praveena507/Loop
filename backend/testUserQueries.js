import { dbAll, dbGet } from './src/db/initDb.js';

async function testUserQueries() {
  console.log('--- TESTING ADMIN QUERY ---');
  const adminUser = await dbGet('SELECT * FROM staff_users WHERE email = ?', ['admin@loop.com']);
  console.log('Admin user found:', adminUser);

  let adminSql = `
    SELECT c.*, a.priority 
    FROM complaints c
    LEFT JOIN ai_analysis a ON c.id = a.complaintId
    WHERE 1=1
  `;
  const adminRes = await dbAll(adminSql, []);
  console.log('Admin query returns count:', adminRes.length);

  console.log('\n--- TESTING ANALYST QUERY ---');
  const analystUser = await dbGet('SELECT * FROM staff_users WHERE email = ?', ['analyst@loop.com']);
  console.log('Analyst user found:', analystUser);

  let analystSql = `
    SELECT c.*, a.priority 
    FROM complaints c
    LEFT JOIN ai_analysis a ON c.id = a.complaintId
    WHERE 1=1 AND c.id IN (
      SELECT ca1.complaintId FROM complaint_actions ca1
      WHERE ca1.analystId = ?
    )
  `;
  const analystRes = await dbAll(analystSql, [analystUser ? analystUser.id : 'usr_analyst_01']);
  console.log('Analyst query returns count:', analystRes.length);

  process.exit(0);
}

testUserQueries().catch(console.error);
