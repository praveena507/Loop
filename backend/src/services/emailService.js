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
    to_name: name || 'LOOP User',
    name: name || 'LOOP User',
    passcode: otp,
    otp: otp,
    code: otp,
    verification_code: otp,
    message: `Your LOOP verification code is: ${otp}`,
    time: expiryTime,
    expiry_time: expiryTime,
    to_email: email,
    email: email,
    user_email: email,
    recipient_email: email,
    portal_name: 'LOOP Customer Grievance Resolution Platform',
    from_name: 'LOOP Customer Support'
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
  const trackerUrl = `http://localhost:3000/track?complaintNumber=${encodeURIComponent(complaintNumber)}&email=${encodeURIComponent(email)}`;
  const formattedDate = new Date(resolutionDate || Date.now()).toLocaleString();

  const emailSubject = `[RESOLVED] Complaint #${complaintNumber} — Official Case Resolution Notice`;

  const sentViaEmailJS = await sendEmailViaEmailJS({
    to_email: email,
    user_email: email,
    complaint_number: complaintNumber,
    status: 'RESOLVED',
    response_text: responseText,
    resolution_date: formattedDate,
    tracker_url: trackerUrl,
    subject: emailSubject,
    message: responseText
  });

  if (sentViaEmailJS) return true;

  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"LOOP Customer Care" <support@loop.com>',
        to: email,
        subject: emailSubject,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; padding-bottom: 16px; border-bottom: 2px solid #2563eb;">
              <h2 style="color: #1e293b; margin: 0;">LOOP AI Customer Platform</h2>
              <span style="display: inline-block; margin-top: 8px; background-color: #dcfce7; color: #15803d; font-weight: bold; padding: 4px 12px; border-radius: 20px; font-size: 13px; border: 1px solid #bbf7d0;">
                STATUS: RESOLVED ✓
              </span>
            </div>

            <div style="padding: 20px 0; font-size: 14px; color: #334155; line-height: 1.6;">
              <p style="margin-top: 0;">Dear Valued Customer,</p>
              <p>We are pleased to inform you that your complaint reference <strong>${complaintNumber}</strong> has been officially investigated, actioned, and <strong>RESOLVED</strong> by our Case Coordination team.</p>

              <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0; font-weight: bold; color: #1e293b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Official Resolution Statement:</p>
                <div style="white-space: pre-wrap; margin-top: 8px; color: #1e293b; font-size: 14px;">${responseText}</div>
              </div>

              <div style="background-color: #f1f5f9; padding: 12px 16px; border-radius: 8px; font-size: 12px; color: #64748b; margin-bottom: 20px;">
                <strong>Complaint Reference:</strong> ${complaintNumber}<br />
                <strong>Resolution Date & Time:</strong> ${formattedDate}<br />
                <strong>Registered Email:</strong> ${email}
              </div>

              <div style="text-align: center; margin: 24px 0;">
                <a href="${trackerUrl}" style="background-color: #2563eb; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 10px; display: inline-block; font-size: 14px;">
                  View Case Resolution & Rate Service ➔
                </a>
              </div>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
              Thank you for trusting LOOP Operational Grievance Platform.<br />
              This is an automated operational notification sent to ${email}.
            </div>
          </div>
        `
      });
      console.log(`[EMAIL SERVICE - SMTP] Resolution status email dispatched to: ${email}`);
    } catch (err) {
      console.error('Failed to send resolution email via SMTP:', err.message);
    }
  } else {
    console.log(`\n==================================================`);
    console.log(`[EMAIL SERVICE] 📧 RESOLUTION STATUS EMAIL DISPATCHED`);
    console.log(`Recipient Email: ${email}`);
    console.log(`Complaint Number: ${complaintNumber}`);
    console.log(`Status: RESOLVED ✓`);
    console.log(`Resolution Date: ${formattedDate}`);
    console.log(`Resolution Response:\n${responseText}`);
    console.log(`Public Tracker Link: ${trackerUrl}`);
    console.log(`==================================================\n`);
  }
  return true;
}

/**
 * Send Analyst Account Welcome & Credentials Email.
 */
export async function sendAnalystWelcomeEmail({ name, email, password, role = 'ANALYST' }) {
  const portalUrl = 'http://localhost:3000/office';
  const emailSubject = `Welcome to LOOP Team — Your ${role} Credentials`;

  const sentViaEmailJS = await sendEmailViaEmailJS({
    to_email: email,
    user_email: email,
    user_name: name,
    password: password,
    role: role,
    portal_url: portalUrl,
    subject: emailSubject,
    message: `Your staff account (${role}) has been activated. Email: ${email}, Password: ${password}`
  });

  if (sentViaEmailJS) return true;

  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"LOOP Administration" <admin@loop.com>',
        to: email,
        subject: emailSubject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; padding-bottom: 16px; border-bottom: 2px solid #2563eb;">
              <h2 style="color: #1e293b; margin: 0;">LOOP Staff Intelligence Portal</h2>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Staff Account Provisioning</p>
            </div>
            <div style="padding: 20px 0; font-size: 14px; color: #334155; line-height: 1.6;">
              <p>Dear <strong>${name}</strong>,</p>
              <p>Your <strong>${role}</strong> staff account has been successfully created by System Administration. Below are your account login credentials:</p>
              <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 12px; margin: 16px 0; font-family: monospace;">
                <p style="margin: 0 0 8px 0;"><strong>Staff Email:</strong> ${email}</p>
                <p style="margin: 0;"><strong>Assigned Password:</strong> <span style="background-color: #fef08a; padding: 2px 6px; border-radius: 4px; color: #854d0e;">${password}</span></p>
              </div>
              <p style="font-size: 12px; color: #64748b;">
                * You can log in using these credentials. If you change your password, your administrator will remain updated.
              </p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${portalUrl}" style="background-color: #2563eb; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 10px; display: inline-block; font-size: 14px;">
                  Sign In to Staff Portal ➔
                </a>
              </div>
            </div>
          </div>
        `
      });
      console.log(`[EMAIL SERVICE - SMTP] Analyst credentials email sent to: ${email}`);
    } catch (err) {
      console.error('Failed to send analyst welcome email via SMTP:', err.message);
    }
  } else {
    console.log(`\n==================================================`);
    console.log(`[EMAIL SERVICE] 📧 STAFF ANALYST CREDENTIALS DISPATCHED`);
    console.log(`Staff Member: ${name}`);
    console.log(`Staff Email: ${email}`);
    console.log(`Assigned Password: ${password}`);
    console.log(`Role: ${role}`);
    console.log(`Portal Link: ${portalUrl}`);
    console.log(`==================================================\n`);
  }
  return true;
}
