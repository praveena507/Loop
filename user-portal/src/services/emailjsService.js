import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_jc37zs7';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_mazjfep';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'acyj-5nSV5Ux31Zu9';

/**
 * Dispatch Email Verification OTP directly from client using EmailJS SDK.
 */
export async function sendEmailJSVerification({ to_email, user_name, passcode, expiresAt }) {
  try {
    const templateParams = {
      to_email: to_email,
      user_email: to_email,
      email: to_email,
      recipient_email: to_email,
      to_name: user_name || 'Valued User',
      user_name: user_name || 'Valued User',
      name: user_name || 'Valued User',
      passcode: passcode,
      otp: passcode,
      code: passcode,
      verification_code: passcode,
      message: `Your LOOP verification code is: ${passcode}`,
      expiry_time: expiresAt ? new Date(expiresAt).toLocaleTimeString() : '2.5 minutes',
      time: expiresAt ? new Date(expiresAt).toLocaleTimeString() : '2.5 minutes',
      portal_name: 'LOOP Customer Grievance Resolution Portal',
      from_name: 'LOOP Support Team'
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('[EmailJS Client] Verification email dispatched successfully to:', to_email);
    return { success: true, response };
  } catch (error) {
    console.warn('[EmailJS Client] Client-side EmailJS dispatch failed:', error);
    return { success: false, error: error.message || 'EmailJS dispatch failed' };
  }
}
