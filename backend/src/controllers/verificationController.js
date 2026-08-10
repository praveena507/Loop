import { createEmailVerification, verifyEmailOTP } from '../services/emailService.js';
import { dbGet, dbRun, supabaseQuery } from '../db/initDb.js';
import { analyzeComplaintWithGemini } from '../services/geminiService.js';

export async function sendVerification(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    const verification = await createEmailVerification(email.trim().toLowerCase());
    return res.json({
      success: true,
      message: 'Verification OTP sent to email address.',
      expiresAt: verification.expiresAt,
      devOtp: verification.otp
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function verifyCode(req, res) {
  try {
    const { email, otp, complaintId } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP code are required.' });
    }

    const verificationResult = await verifyEmailOTP(email.trim().toLowerCase(), otp.trim());
    if (!verificationResult.success) {
      return res.status(400).json({ success: false, error: verificationResult.message });
    }

    // Mark Customer verified in DB if present
    const customer = await dbGet('SELECT * FROM customers WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (customer) {
      await dbRun('UPDATE customers SET emailVerified = 1, updatedAt = ? WHERE id = ?', [
        new Date().toISOString(),
        customer.id
      ]);
    }

    // If complaintId supplied, activate complaint and trigger backend Gemini AI
    let updatedComplaint = null;
    if (complaintId) {
      const complaint = await dbGet('SELECT * FROM complaints WHERE id = ? OR complaintNumber = ?', [complaintId, complaintId]);
      if (complaint) {
        const now = new Date().toISOString();
        
        // Update local & Supabase status to AI_ANALYZING & append complaint_status_history
        await dbRun('UPDATE complaints SET status = ?, updatedAt = ? WHERE id = ?', ['AI_ANALYZING', now, complaint.id]);
        await supabaseQuery.updateComplaintStatus(complaint.id, 'AI_ANALYZING');

        // Run Gemini AI with document proof analysis
        try {
          const aiResult = await analyzeComplaintWithGemini({
            reason: complaint.reason,
            description: complaint.description,
            category: complaint.category,
            place: complaint.place,
            attachmentUrl: complaint.attachmentUrl
          });

          const aiId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
          const aiData = {
            id: aiId,
            complaintId: complaint.id,
            sentiment: aiResult.sentiment,
            sentimentScore: aiResult.sentimentScore,
            category: aiResult.category,
            theme: aiResult.theme,
            priority: aiResult.priority,
            priorityScore: aiResult.priorityScore,
            summary: aiResult.summary,
            keywords: JSON.stringify(aiResult.keywords),
            suggestedResponse: aiResult.suggestedResponse,
            attachmentAnalyzed: aiResult.attachmentAnalyzed,
            attachmentSummary: aiResult.attachmentSummary,
            proofMatch: aiResult.proofMatch,
            rootCause: aiResult.rootCause,
            sectionName: aiResult.sectionName,
            createdAt: now,
            updatedAt: now
          };

          await dbRun(
            `INSERT INTO ai_analysis 
             (id, complaintId, sentiment, sentimentScore, category, theme, priority, priorityScore, summary, keywords, suggestedResponse, attachmentAnalyzed, attachmentSummary, proofMatch, rootCause, sectionName, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              aiData.id,
              aiData.complaintId,
              aiData.sentiment,
              aiData.sentimentScore,
              aiData.category,
              aiData.theme,
              aiData.priority,
              aiData.priorityScore,
              aiData.summary,
              aiData.keywords,
              aiData.suggestedResponse,
              aiData.attachmentAnalyzed,
              aiData.attachmentSummary,
              aiData.proofMatch,
              aiData.rootCause,
              aiData.sectionName,
              now,
              now
            ]
          );

          // Save to Supabase complaint_ai_analysis
          await supabaseQuery.insertAiAnalysis(aiData);

          // Update local & Supabase status to AI_ANALYZED & append complaint_status_history
          await dbRun('UPDATE complaints SET status = ?, updatedAt = ? WHERE id = ?', ['AI_ANALYZED', now, complaint.id]);
          await supabaseQuery.updateComplaintStatus(complaint.id, 'AI_ANALYZED');

        } catch (aiErr) {
          console.error('AI processing error during verification:', aiErr);
          await dbRun('UPDATE complaints SET status = ?, updatedAt = ? WHERE id = ?', ['AI_ANALYZED', now, complaint.id]);
          await supabaseQuery.updateComplaintStatus(complaint.id, 'AI_ANALYZED');
        }

        updatedComplaint = await dbGet('SELECT id, complaintNumber, status FROM complaints WHERE id = ?', [complaint.id]);
      }
    }

    return res.json({
      success: true,
      message: 'Email verified successfully.',
      complaint: updatedComplaint
    });

  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ success: false, error: 'Server error during verification.' });
  }
}

export async function resendCode(req, res) {
  return sendVerification(req, res);
}
