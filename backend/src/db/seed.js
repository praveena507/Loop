import bcrypt from 'bcryptjs';
import { dbRun, dbGet, initDatabase } from './initDb.js';

export async function seedDatabase() {
  await initDatabase();
  const now = new Date().toISOString();

  const existingAdmin = await dbGet('SELECT * FROM staff_users WHERE email = ?', ['admin@loop.com']);
  if (!existingAdmin) {
    const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
    const analystPasswordHash = await bcrypt.hash('Analyst@12345', 10);

    // Insert Admin
    await dbRun(
      `INSERT INTO staff_users (id, name, email, passwordHash, plainPassword, role, status, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['usr_admin_01', 'System Administrator', 'admin@loop.com', adminPasswordHash, 'Admin@12345', 'ADMIN', 'ACTIVE', now, now]
    );

    // Insert Analyst
    await dbRun(
      `INSERT INTO staff_users (id, name, email, passwordHash, plainPassword, role, status, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['usr_analyst_01', 'Lead Analyst', 'analyst@loop.com', analystPasswordHash, 'Analyst@12345', 'ANALYST', 'ACTIVE', now, now]
    );

    console.log('Seed: Default staff users created.');
  }

  // Backfill plainPassword for existing default staff accounts if null
  await dbRun("UPDATE staff_users SET plainPassword = 'Admin@12345' WHERE email = 'admin@loop.com' AND plainPassword IS NULL");
  await dbRun("UPDATE staff_users SET plainPassword = 'Analyst@12345' WHERE email = 'analyst@loop.com' AND plainPassword IS NULL");

  // Create sample customer
  await dbRun(
    `INSERT OR IGNORE INTO customers (id, name, email, emailVerified, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['cust_01', 'Sarah Jenkins', 'sarah.j@example.com', 1, now, now]
  );

  // Sample Complaint 1 (Payment Section - Critical Overcharge with Receipt Proof)
  const c1Id = 'cmp_2026_001';
  await dbRun(
    `INSERT OR IGNORE INTO complaints (id, complaintNumber, customerId, name, email, place, category, reason, description, attachmentUrl, status, createdAt, updatedAt)
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
    `INSERT OR IGNORE INTO ai_analysis (id, complaintId, sentiment, sentimentScore, category, theme, priority, priorityScore, summary, keywords, suggestedResponse, attachmentAnalyzed, attachmentSummary, proofMatch, rootCause, sectionName, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'ai_01',
      c1Id,
      'NEGATIVE',
      0.92,
      'Payment Glitch',
      'Billing & Overcharge',
      'CRITICAL',
      0.95,
      'Customer double-charged $249.99 on physical store payment terminal #9914.',
      JSON.stringify(['double charge', 'overcharge', 'glitch', 'receipt proof', 'payment']),
      'Dear Sarah, We sincerely apologize for the duplicate charge of $249.99. Our Finance and Payments department has verified receipt proof and initiated a direct refund of $249.99 back to your original payment card.',
      1,
      'Attached Document Analyzed: PDF receipt matches store terminal #9914 with duplicate charge timestamp 14:02:11 EST.',
      'VERIFIED - Attached PDF receipt proof matches customer statement',
      'POS Terminal Double-Post Bug',
      'Payment Section',
      now,
      now
    ]
  );

  // Sample Complaint 2 (Technical Section)
  const c2Id = 'cmp_2026_002';
  await dbRun(
    `INSERT OR IGNORE INTO complaints (id, complaintNumber, customerId, name, email, place, category, reason, description, attachmentUrl, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      c2Id,
      'LOOP-2026-849202',
      'cust_01',
      'Sarah Jenkins',
      'sarah.j@example.com',
      'Digital Downloads Portal',
      'Technical',
      'Broken password reset link returning 404',
      'When clicking the reset link in the automated email, it displays a 404 page expired error message every time. Screenshot attached.',
      'https://example.com/error_screenshot.png',
      'IN_PROGRESS',
      now,
      now
    ]
  );

  await dbRun(
    `INSERT OR IGNORE INTO ai_analysis (id, complaintId, sentiment, sentimentScore, category, theme, priority, priorityScore, summary, keywords, suggestedResponse, attachmentAnalyzed, attachmentSummary, proofMatch, rootCause, sectionName, createdAt, updatedAt)
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
