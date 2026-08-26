import { dbAll } from './src/db/initDb.js';

async function testApi() {
  const complaints = await dbAll(`
    SELECT c.*, a.priority, a.sentiment, a.theme 
    FROM complaints c 
    LEFT JOIN ai_analysis a ON c.id = a.complaintId
  `);

  console.log('📊 SIMULATED DASHBOARD COMPLAINTS COUNT:', complaints.length);

  const total = complaints.length;
  const newCount = complaints.filter(c => c.status === 'SUBMITTED' || c.status === 'VERIFIED').length;
  const critical = complaints.filter(c => (c.priority === 'CRITICAL' || c.priority === 'HIGH' || c.priority === 'P1') && c.status !== 'RESOLVED').length;
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ACTION_TAKEN').length;
  const resolved = complaints.filter(c => c.status === 'RESOLVED').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  console.log('📈 COMPUTED DASHBOARD METRICS:');
  console.log({
    total,
    new: newCount,
    critical,
    inProgress,
    resolved,
    resolutionRate: `${resolutionRate}%`
  });

  process.exit(0);
}

testApi().catch(console.error);
