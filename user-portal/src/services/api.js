const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
    const data = await res.json();

    if (res.status === 401) {
      localStorage.removeItem('loop_user_token');
      localStorage.removeItem('loop_user_profile');
    }

    if (!res.ok) {
      throw new Error(data.error || 'An error occurred while communicating with the server.');
    }

    return data;
  } catch (err) {
    console.error(`User API Error [${endpoint}]:`, err.message);
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
