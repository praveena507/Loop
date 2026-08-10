import crypto from 'crypto';
import { dbRun, dbGet } from '../db/initDb.js';

/**
 * Generate a 6-digit numeric OTP code.
 */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash OTP code for secure storage.
 */
export function hashOTP(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Create an email verification record with 10-minute expiration.
 */
export async function createEmailVerification(email) {
  const otp = generateOTP();
  const otpHash = hashOTP(otp);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString(); // 10 minutes expiry

  // Check rate limiting (max 3 pending OTPs in last 15 mins)
  const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000).toISOString();
  const recent = await dbGet(
    `SELECT COUNT(*) as count FROM email_verifications WHERE email = ? AND createdAt > ?`,
    [email, fifteenMinsAgo]
  );

  if (recent && recent.count >= 5) {
    throw new Error('Too many verification requests. Please wait 15 minutes before requesting another code.');
  }

  const id = `ev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  await dbRun(
    `INSERT INTO email_verifications (id, email, otpHash, expiresAt, verified, createdAt)
     VALUES (?, ?, ?, ?, 0, ?)`,
    [id, email, otpHash, expiresAt, now.toISOString()]
  );

  // In production, send email via EmailJS or Nodemailer
  // For local testing & console logs, print the OTP clearly
  console.log(`\n==================================================`);
  console.log(`[EMAIL SERVICE] Verification OTP sent to: ${email}`);
  console.log(`[EMAIL SERVICE] OTP Code: ${otp}`);
  console.log(`==================================================\n`);

  return { id, otp, expiresAt };
}

/**
 * Verify supplied OTP code for email address.
 */
export async function verifyEmailOTP(email, otp) {
  const otpHash = hashOTP(otp);
  const now = new Date().toISOString();

  const record = await dbGet(
    `SELECT * FROM email_verifications 
     WHERE email = ? AND otpHash = ? AND verified = 0 AND expiresAt > ? 
     ORDER BY createdAt DESC LIMIT 1`,
    [email, otpHash, now]
  );

  if (!record) {
    return { success: false, message: 'Invalid or expired verification code.' };
  }

  // Mark record verified
  await dbRun(`UPDATE email_verifications SET verified = 1 WHERE id = ?`, [record.id]);
  return { success: true };
}

/**
 * Send complaint confirmation email.
 */
export async function sendSubmissionConfirmationEmail(email, complaintNumber) {
  console.log(`[EMAIL SERVICE] Sent Submission Confirmation to ${email} for ${complaintNumber}`);
  return true;
}

/**
 * Send resolution response email to customer (Privacy Safe: Sender "LOOP Support Team").
 */
export async function sendResolutionEmail({ email, complaintNumber, responseText, resolutionDate }) {
  console.log(`\n==================================================`);
  console.log(`[EMAIL SERVICE] Resolution Notice Sent to Customer`);
  console.log(`Sender: LOOP Support Team <support@loop.com>`);
  console.log(`To: ${email}`);
  console.log(`Subject: Update on your complaint ${complaintNumber}`);
  console.log(`Response Text: ${responseText}`);
  console.log(`Resolution Date: ${resolutionDate}`);
  console.log(`==================================================\n`);
  return true;
}
