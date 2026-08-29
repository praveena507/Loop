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
      user_name: user_name || 'Valued User',
      passcode: passcode,
      expiry_time: expiresAt ? new Date(expiresAt).toLocaleTimeString() : '2.5 minutes',
      portal_name: 'LOOP Customer Grievance Resolution Portal'
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    return { success: true, response };
  } catch (error) {
    console.warn('Client EmailJS notification dispatch failed (Server backup active):', error);
    return { success: false, error: error.message || 'EmailJS dispatch failed' };
  }
}
