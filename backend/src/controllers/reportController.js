import { dbAll } from '../db/initDb.js';

export async function getAnalytics(req, res) {
  try {
    const sentimentCounts = await dbAll(
      `SELECT sentiment, COUNT(*) as count FROM ai_analysis GROUP BY sentiment`
    );

    const priorityCounts = await dbAll(
      `SELECT priority, COUNT(*) as count FROM ai_analysis GROUP BY priority`
    );

    const categoryCounts = await dbAll(
      `SELECT category, COUNT(*) as count FROM complaints GROUP BY category`
    );

    const sectionProblemCounts = await dbAll(
      `SELECT COALESCE(sectionName, category || ' Section') as sectionName, 
              COUNT(*) as count, 
              SUM(CASE WHEN priority = 'CRITICAL' THEN 1 ELSE 0 END) as criticalCount
       FROM ai_analysis 
       GROUP BY sectionName
       ORDER BY count DESC`
    );

    const rootCauseCounts = await dbAll(
      `SELECT COALESCE(rootCause, 'Operational Issue') as rootCause, 
              COUNT(*) as count 
       FROM ai_analysis 
       GROUP BY rootCause 
       ORDER BY count DESC 
       LIMIT 6`
    );

    const proofCounts = await dbAll(
      `SELECT attachmentAnalyzed, COUNT(*) as count FROM ai_analysis GROUP BY attachmentAnalyzed`
    );

    const themeCounts = await dbAll(
      `SELECT theme, COUNT(*) as count FROM ai_analysis GROUP BY theme LIMIT 6`
    );

    const volumeTrends = await dbAll(
      `SELECT strftime('%Y-%m-%d', createdAt) as date, COUNT(*) as count FROM complaints GROUP BY date ORDER BY date ASC LIMIT 14`
    );

    return res.json({
      success: true,
      analytics: {
        sentiment: sentimentCounts,
        priority: priorityCounts,
        category: categoryCounts,
        sectionProblems: sectionProblemCounts,
        rootCauses: rootCauseCounts,
        proofStats: proofCounts,
        theme: themeCounts,
        volume: volumeTrends
      }
    });

  } catch (err) {
    console.error('Analytics error:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate analytics report.' });
  }
}
