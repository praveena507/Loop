const PROD_API_URL = 'https://loop-backend-ahtf.onrender.com/api';
const LOCAL_API_URL = 'http://localhost:5000/api';

/**
 * Intelligent API base resolution:
 * 1. Explicit env var if set and non-empty
 * 2. If running locally in browser (localhost / 127.0.0.1) and not in production build, use local server
 * 3. In all other scenarios (production build, Vercel deployment, remote domain), use live Render API
 */
function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (envUrl && envUrl !== '') {
    return envUrl;
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return LOCAL_API_URL;
    }
  }
  
  return PROD_API_URL;
}

const API_BASE = getApiBaseUrl();

/**
 * Generic fetch wrapper with standard error handling for User Portal
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('loop_user_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    let data;
    try {
      data = await res.json();
    } catch {
      data = { error: `Server returned ${res.status}: ${res.statusText}` };
    }

    if (res.status === 401) {
      localStorage.removeItem('loop_user_token');
      localStorage.removeItem('loop_user_profile');
    }

    if (!res.ok) {
      throw new Error(data.error || data.message || 'An error occurred while communicating with the server.');
    }

    return data;
  } catch (err) {
    console.error(`User API Error [${endpoint}]:`, err.message);
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error('Unable to connect to the backend server. Please check your internet connection or verify the backend service is active.');
    }
    throw err;
  }
}

export const api = {
  // Complaint Operations
  submitComplaint: (formData) => request('/complaints', { method: 'POST', body: JSON.stringify(formData) }),
  trackComplaint: (complaintNumber, email) => request(`/complaints/track?complaintNumber=${encodeURIComponent(complaintNumber)}&email=${encodeURIComponent(email || '')}`),
  getUserComplaints: (email) => request(`/user/complaints?email=${encodeURIComponent(email)}`),

  // Email Verification & OTP
  sendVerification: (email, name) => request('/verification/send', { method: 'POST', body: JSON.stringify({ email, name }) }),
  verifyOTP: (email, otp, complaintId) => request('/verification/verify', { method: 'POST', body: JSON.stringify({ email, otp, complaintId }) }),
  resendOTP: (email) => request('/verification/resend', { method: 'POST', body: JSON.stringify({ email }) }),

  // Customer Authentication (OTP Sign-In / Register)
  requestLoginOTP: (email, name) => request('/auth/customer-login', { method: 'POST', body: JSON.stringify({ email, name }) }),
  verifyLoginOTP: (email, otp, name) => request('/auth/customer-verify', { method: 'POST', body: JSON.stringify({ email, otp, name }) }),

  // User Feedback
  submitFeedback: (payload) => request('/feedback/submit', { method: 'POST', body: JSON.stringify(payload) })
};
