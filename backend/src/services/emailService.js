import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { dbRun, dbGet } from '../db/initDb.js';

/**
 * Send email via EmailJS REST API
 */
async function sendEmailViaEmailJS(templateParams) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey || serviceId.trim() === '' || templateId.trim() === '') {
    return false;
  }

  try {
    const payload = {
      service_id: serviceId.trim(),
      template_id: templateId.trim(),
      user_id: publicKey.trim(),
      template_params: templateParams
    };

    if (privateKey && privateKey.trim() !== '') {
      payload.accessToken = privateKey.trim();
    }

    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log(`[EMAIL SERVICE - EmailJS] Email dispatched successfully to ${templateParams.to_email || templateParams.email}`);
      return true;
    } else {
      const errText = await res.text();
      console.error(`[EMAIL SERVICE - EmailJS] Service responded with status ${res.status}:`, errText);
    }
  } catch (err) {
    console.error(`[EMAIL SERVICE - EmailJS] Request error:`, err.message);
  }
  return false;
}

/**
 * Configure Nodemailer Transporter (SMTP Fallback)
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass && user.trim() !== '' && pass.trim() !== '') {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user: user.trim(), pass: pass.trim() }
    });
  }

  return null;
}

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
 * Create an email verification record with 2.5-minute expiration & dispatch email.
 */
export async function createEmailVerification(email, name = 'LOOP User') {
  const otp = generateOTP();
  const otpHash = hashOTP(otp);
  const now = new Date();
  const expiryTimestamp = now.getTime() + Math.round(2.5 * 60 * 1000); // 2.5 minutes (150 seconds) expiry
  const expiresAt = new Date(expiryTimestamp).toISOString();
  const expiryTime = new Date(expiryTimestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  // Rate limiting (max 5 pending OTPs in last 15 mins)
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

  // 1. Try EmailJS REST API first
  const emailjsSuccess = await sendEmailViaEmailJS({
    user_name: name || 'LOOP User',
    passcode: otp,
    time: expiryTime,
    to_email: email,
    email: email,
    user_email: email
  });

  if (emailjsSuccess) {
    return { id, otp, expiresAt };
  }

  // 2. Try Nodemailer SMTP fallback
  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"LOOP AI Customer Platform" <noreply@loop.com>',
        to: email,
        subject: 'Your LOOP Email Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #1e293b; text-align: center;">Verify Your Email Address</h2>
            <p style="color: #64748b; font-size: 14px; text-align: center;">Thank you for reaching out to LOOP AI Customer Intelligence Platform. Use the code below to complete your email verification:</p>
            <div style="background-color: #f1f5f9; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
              <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb;">${otp}</span>
            </div>
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">This verification code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
          </div>
        `
      });
      console.log(`[EMAIL SERVICE - SMTP] Verification email successfully sent to: ${email}`);
      return { id, otp, expiresAt };
    } catch (mailErr) {
      console.error(`[EMAIL SERVICE - SMTP] Failed to send email via SMTP:`, mailErr.message);
    }
  }

  // 3. Dev Fallback Logging
  console.log(`\n==================================================`);
  console.log(`[EMAIL SERVICE] Verification OTP generated for: ${email}`);
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
  const sentViaEmailJS = await sendEmailViaEmailJS({
    to_email: email,
    user_email: email,
    complaint_number: complaintNumber,
    subject: `Complaint Received - ${complaintNumber}`,
    message: `Your complaint ${complaintNumber} has been received and verified by LOOP Support.`
  });

  if (sentViaEmailJS) return true;

  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"LOOP AI Customer Platform" <noreply@loop.com>',
        to: email,
        subject: `Complaint Received - ${complaintNumber}`,
        html: `<p>Your complaint reference <strong>${complaintNumber}</strong> has been received and verified by LOOP Support.</p>`
      });
    } catch (err) {
      console.error('Failed to send confirmation email via SMTP:', err.message);
    }
  }
  return true;
}

/**
 * Send resolution response email to customer.
 */
export async function sendResolutionEmail({ email, complaintNumber, responseText, resolutionDate }) {
  const sentViaEmailJS = await sendEmailViaEmailJS({
    to_email: email,
    user_email: email,
    complaint_number: complaintNumber,
    response_text: responseText,
    resolution_date: resolutionDate,
    subject: `Resolution Update for Complaint ${complaintNumber}`,
    message: responseText
  });

  if (sentViaEmailJS) return true;

  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"LOOP Support Team" <support@loop.com>',
        to: email,
        subject: `Resolution Update for Complaint ${complaintNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h3 style="color: #1e293b;">Complaint Resolution Notice</h3>
            <p><strong>Complaint Reference:</strong> ${complaintNumber}</p>
            <p><strong>Resolution Date:</strong> ${resolutionDate}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
            <p style="color: #334155; white-space: pre-wrap;">${responseText}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
            <p style="color: #64748b; font-size: 12px;">Regards,<br />LOOP Customer Intelligence Support Team</p>
          </div>
        `
      });
    } catch (err) {
      console.error('Failed to send resolution email via SMTP:', err.message);
    }
  } else {
    console.log(`\n==================================================`);
    console.log(`[EMAIL SERVICE] Resolution Notice Sent to Customer`);
    console.log(`To: ${email}`);
    console.log(`Subject: Update on your complaint ${complaintNumber}`);
    console.log(`Response Text: ${responseText}`);
    console.log(`==================================================\n`);
  }
  return true;
}
