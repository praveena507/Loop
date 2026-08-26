import { dbAll } from './src/db/initDb.js';

async function testFetch() {
  const sql = `
    SELECT c.*, 
           a.sentiment, a.sentimentScore, a.category as aiCategory, a.theme, 
           a.priority, a.priorityScore, a.confidence, a.severity, a.urgency, a.impact, a.affectedScope, a.priorityReason, a.keyFactors,
           a.summary as aiSummary, a.attachmentSummary, a.proofMatch, a.rootCause, a.sectionName
    FROM complaints c
    LEFT JOIN ai_analysis a ON c.id = a.complaintId
  `;
  const rows = await dbAll(sql, []);
  console.log('🎉 FETCH TEST SUCCESS! TOTAL ROWS:', rows.length);
  console.log('SAMPLE ROW 1:', {
    id: rows[0]?.id,
    complaintNumber: rows[0]?.complaintNumber,
    name: rows[0]?.name,
    category: rows[0]?.category,
    priority: rows[0]?.priority,
    sentiment: rows[0]?.sentiment
  });
  process.exit(0);
}

testFetch().catch(console.error);
