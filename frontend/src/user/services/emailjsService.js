import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_jc37zs7';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_mazjfep';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'acyj-5nSV5Ux31Zu9';

export async function sendEmailJSVerification(params = {}) {
  const email = params.to_email || params.email;
  const userName = params.user_name || params.userName || params.name || 'LOOP User';
  const otp = params.passcode || params.otp || params.otp_code;

  let expiryTime = params.time || params.expiryTime;
  if (!expiryTime) {
    const rawExpiry = params.expiresAt ? new Date(params.expiresAt).getTime() : (Date.now() + Math.round(2.5 * 60 * 1000));
    expiryTime = new Date(rawExpiry).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Prevent undefined values before sending email
  if (!userName) {
    console.error('OTP email failed: missing user_name');
    return false;
  }
  if (!email) {
    console.error('OTP email failed: missing recipient email');
    return false;
  }
  if (!otp) {
    console.error('OTP email failed: missing passcode');
    return false;
  }
  if (!expiryTime) {
    console.error('OTP email failed: missing time');
    return false;
  }

  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('[FRONTEND EMAILJS] Missing EmailJS configuration keys.');
    return false;
  }

  const templateParams = {
    user_name: userName,
    passcode: otp,
    time: expiryTime,
    to_email: email,
    email: email,
    user_email: email
  };

  console.log("OTP generated:", otp);
  console.log("EmailJS template parameters:", {
    user_name: userName,
    passcode: otp,
    time: expiryTime
  });

  try {
    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    console.log("OTP email sent successfully");
    console.log('[FRONTEND EMAILJS] Email dispatched successfully:', response.status, response.text);
    return true;
  } catch (err) {
    console.error("OTP email failed:", err);
    return false;
  }
}
