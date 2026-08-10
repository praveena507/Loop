import bcrypt from 'bcryptjs';
import { dbRun, dbGet, initDatabase } from './initDb.js';

export async function seedDatabase() {
  await initDatabase();

  const existingAdmin = await dbGet('SELECT * FROM staff_users WHERE email = ?', ['admin@loop.com']);
  if (!existingAdmin) {
    const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
    const analystPasswordHash = await bcrypt.hash('Analyst@12345', 10);
    const now = new Date().toISOString();

    // Insert Admin
    await dbRun(
      `INSERT INTO staff_users (id, name, email, passwordHash, role, status, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['usr_admin_01', 'System Administrator', 'admin@loop.com', adminPasswordHash, 'ADMIN', 'ACTIVE', now, now]
    );

    // Insert Analyst
    await dbRun(
      `INSERT INTO staff_users (id, name, email, passwordHash, role, status, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['usr_analyst_01', 'Lead Analyst', 'analyst@loop.com', analystPasswordHash, 'ANALYST', 'ACTIVE', now, now]
    );

    console.log('Seed: Default staff users created.');

    // Create sample customer
    await dbRun(
      `INSERT INTO customers (id, name, email, emailVerified, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['cust_01', 'Sarah Jenkins', 'sarah.j@example.com', 1, now, now]
    );

    // Sample Complaint 1 (Payment Section - Critical Overcharge with Receipt Proof)
    const c1Id = 'cmp_2026_001';
    await dbRun(
      `INSERT INTO complaints (id, complaintNumber, customerId, name, email, place, category, reason, description, attachmentUrl, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        c1Id,
        'LOOP-2026-849201',
        'cust_01',
        'Sarah Jenkins',
        'sarah.j@example.com',
        'New York Store #12',
        'Payment',
        'Double charged on checkout terminal',
        'I was charged twice for transaction #9914 ($249.99 x 2). The cashier mentioned a terminal glitch. Attached receipt proof shows duplicate line items.',
        'https://example.com/receipt.pdf',
        'AI_ANALYZED',
        now,
        now
      ]
    );

    await dbRun(
      `INSERT INTO ai_analysis (id, complaintId, sentiment, sentimentScore, category, theme, priority, priorityScore, summary, keywords, suggestedResponse, attachmentAnalyzed, attachmentSummary, proofMatch, rootCause, sectionName, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'ai_01',
        c1Id,
        'NEGATIVE',
        0.92,
        'Payment',
        'Billing Errors & Overcharge',
        'CRITICAL',
        0.95,
        'Customer reported duplicate transaction ($249.99 x 2) caused by point-of-sale terminal double swipe.',
        JSON.stringify(['double charge', 'terminal glitch', 'receipt proof', 'reimbursement', 'payment']),
        'Dear Sarah, We sincerely apologize for the duplicate charge. Our billing team verified the receipt attachment showing duplicate transaction #9914 and initiated a full $249.99 refund.',
        1,
        'Attached Document Proof Verified: PDF receipt matches complaint text. Identifies POS Terminal #12 duplicate charge of $249.99 at 14:22 EST.',
        'VERIFIED - Proof Document Matches Complaint Description',
        'POS Hardware Terminal Double Swipe Glitch',
        'Payment Section',
        now,
        now
      ]
    );

    // Sample Complaint 2 (Technical Section - Medium Password Reset)
    const c2Id = 'cmp_2026_002';
    await dbRun(
      `INSERT INTO complaints (id, complaintNumber, customerId, name, email, place, category, reason, description, attachmentUrl, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        c2Id,
        'LOOP-2026-302194',
        'cust_01',
        'Sarah Jenkins',
        'sarah.j@example.com',
        'Online Portal',
        'Technical Issue',
        'Cannot reset password via email link',
        'When clicking the reset link in the automated email, it displays a 404 page expired error message every time. Screenshot attached.',
        'https://example.com/error_screenshot.png',
        'IN_PROGRESS',
        now,
        now
      ]
    );

    await dbRun(
      `INSERT INTO ai_analysis (id, complaintId, sentiment, sentimentScore, category, theme, priority, priorityScore, summary, keywords, suggestedResponse, attachmentAnalyzed, attachmentSummary, proofMatch, rootCause, sectionName, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'ai_02',
        c2Id,
        'NEUTRAL',
        0.65,
        'Technical Issue',
        'Authentication & Login Issues',
        'MEDIUM',
        0.60,
        'Customer experiencing broken password reset URL redirecting to 404 error page.',
        JSON.stringify(['password reset', '404 error', 'screenshot proof', 'login']),
        'Hello Sarah, Thank you for reporting this issue. Our engineering team analyzed the screenshot proof and corrected the reset link handler token.',
        1,
        'Attached Image Proof Verified: PNG screenshot shows HTTP 404 Error on route /auth/reset-password?token=expired.',
        'VERIFIED - Screenshot Proof Confirms Broken Token Route',
        'URL Routing Token Handler Bug',
        'Technical Section',
        now,
        now
      ]
    );

    console.log('Seed: Initial complaints, AI analytics, and document proof data seeded.');
  }
}
