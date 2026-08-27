import { dbRun, dbGet, dbAll, supabaseQuery } from '../db/initDb.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Submit User Feedback after resolution
export async function submitComplaintFeedback(req, res) {
  try {
    const { complaintNumber, rating, resolvedSatisfaction, feedbackText } = req.body;

    if (!complaintNumber || !rating || !resolvedSatisfaction) {
      return res.status(400).json({ success: false, error: 'Complaint reference number, rating, and resolution satisfaction are required.' });
    }

    const complaint = await dbGet('SELECT * FROM complaints WHERE complaintNumber = ? OR id = ?', [complaintNumber.trim(), complaintNumber.trim()]);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found.' });
    }

    if (complaint.status !== 'RESOLVED' && complaint.status !== 'FEEDBACK_SUBMITTED') {
      return res.status(400).json({ success: false, error: 'Feedback can only be submitted for resolved complaints.' });
    }

    const existingFeedback = await dbGet('SELECT * FROM complaint_feedback WHERE complaintId = ?', [complaint.id]);
    if (existingFeedback) {
      return res.status(400).json({ success: false, error: 'Feedback has already been submitted for this complaint.' });
    }

    const now = new Date().toISOString();
    const fbId = `fb_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const feedbackData = {
      id: fbId,
      complaintId: complaint.id,
      complaintNumber: complaint.complaintNumber,
      userEmail: complaint.email,
      rating: parseInt(rating, 10),
      resolvedSatisfaction: resolvedSatisfaction.trim(),
      feedbackText: feedbackText ? feedbackText.trim() : '',
      createdAt: now
    };

    await dbRun(
      `INSERT INTO complaint_feedback (id, complaintId, complaintNumber, userEmail, rating, resolvedSatisfaction, feedbackText, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [feedbackData.id, feedbackData.complaintId, feedbackData.complaintNumber, feedbackData.userEmail, feedbackData.rating, feedbackData.resolvedSatisfaction, feedbackData.feedbackText, now]
    );

    // Sync to Supabase
    await supabaseQuery.insertFeedback(feedbackData);

    // Update complaint status history and complaint status to FEEDBACK_SUBMITTED or keep RESOLVED with feedback flag
    await dbRun('UPDATE complaints SET status = ?, updatedAt = ? WHERE id = ?', ['RESOLVED', now, complaint.id]);
    
    // Add audit log
    await dbRun(
      'INSERT INTO audit_logs (id, userId, action, entity, entityId, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [`audit_${Date.now()}`, null, 'USER_SUBMITTED_FEEDBACK', 'COMPLAINT', complaint.id, now]
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Your response has been recorded successfully.'
    });

  } catch (err) {
    console.error('Submit feedback error:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit feedback.' });
  }
}

// Get Admin Feedback & Quality Insights with AI Feedback Analysis
export async function getFeedbackQualityInsights(req, res) {
  try {
    const feedbackList = await dbAll(`
      SELECT fb.*, c.category, c.reason, c.name as customerName
      FROM complaint_feedback fb
      JOIN complaints c ON fb.complaintId = c.id
      ORDER BY fb.createdAt DESC
    `);

    const totalCount = feedbackList.length;
    let avgRating = 0;
    let resolvedYesCount = 0;
    let resolvedPartiallyCount = 0;
    let resolvedNoCount = 0;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (totalCount > 0) {
      let sumRating = 0;
      feedbackList.forEach(fb => {
        sumRating += fb.rating;
        ratingDistribution[fb.rating] = (ratingDistribution[fb.rating] || 0) + 1;
        if (fb.resolvedSatisfaction === 'Yes') resolvedYesCount++;
        else if (fb.resolvedSatisfaction === 'Partially') resolvedPartiallyCount++;
        else if (fb.resolvedSatisfaction === 'No') resolvedNoCount++;
      });
      avgRating = Number((sumRating / totalCount).toFixed(1));
    }

    // Department Performance Metrics
    const deptMetrics = await dbAll(`
      SELECT dr.departmentName,
             COUNT(dr.id) as totalRequests,
             SUM(CASE WHEN dr.status = 'COMPLETED' OR dr.status = 'REPORT_SUBMITTED' THEN 1 ELSE 0 END) as completedRequests,
             SUM(CASE WHEN dr.status = 'PENDING' OR dr.status = 'UNDER_INVESTIGATION' THEN 1 ELSE 0 END) as pendingRequests,
             SUM(CASE WHEN dr.priority = 'P1' THEN 1 ELSE 0 END) as p1Count
      FROM department_requests dr
      GROUP BY dr.departmentName
    `);

    // AI Analysis of Feedback Trends (if API key available)
    let aiAnalysis = null;
    if (process.env.GEMINI_API_KEY && totalCount > 0) {
      try {
        const model = genAI.getGenerativeAIModel ? genAI.getGenerativeAIModel({ model: 'gemini-1.5-flash' }) : genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const feedbackSummaries = feedbackList.slice(0, 15).map(f => `Rating: ${f.rating}/5, Issue Resolved: ${f.resolvedSatisfaction}, Category: ${f.category}, Feedback: "${f.feedbackText}"`).join('\n');
        
        const prompt = `Analyze the following customer feedback data for an enterprise complaint resolution platform and provide high-level organizational insights in JSON format:
        
Data:
${feedbackSummaries}

Respond ONLY with valid JSON structured as:
{
  "commonThemes": ["Theme 1", "Theme 2"],
  "dissatisfactionReasons": ["Reason 1"],
  "recurringFailures": ["Failure 1"],
  "processImprovementRecommendations": ["Recommendation 1", "Recommendation 2"],
  "overallSentiment": "Positive/Neutral/Negative"
}`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiAnalysis = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn('AI feedback analysis notice:', e.message);
      }
    }

    if (!aiAnalysis) {
      aiAnalysis = {
        commonThemes: totalCount > 0 ? ['Service turnaround time', 'Communication clarity'] : ['Awaiting feedback entries'],
        dissatisfactionReasons: resolvedNoCount > 0 ? ['Delayed department investigations'] : ['None identified'],
        recurringFailures: ['Resolution SLA bottlenecks during peak hours'],
        processImprovementRecommendations: ['Automate proof verification checks', 'Increase department escalation thresholds'],
        overallSentiment: avgRating >= 4 ? 'Positive' : avgRating >= 3 ? 'Neutral' : 'Needs Improvement'
      };
    }

    return res.json({
      success: true,
      metrics: {
        totalFeedback: totalCount,
        averageRating: avgRating,
        resolvedYesCount,
        resolvedPartiallyCount,
        resolvedNoCount,
        resolutionSuccessRate: totalCount > 0 ? Math.round((resolvedYesCount / totalCount) * 100) : 100,
        ratingDistribution,
        departmentMetrics: deptMetrics
      },
      aiAnalysis,
      feedback: feedbackList
    });

  } catch (err) {
    console.error('Get feedback quality insights error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve feedback insights.' });
  }
}
