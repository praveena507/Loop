const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Generic fetch wrapper with standard error handling and automatic JWT injection.
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('loop_staff_token');

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

    if (!res.ok) {
      throw new Error(data.error || 'An error occurred while communicating with the server.');
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Public Customer Operations
  submitComplaint: (formData) => request('/complaints', { method: 'POST', body: JSON.stringify(formData) }),
  sendVerification: (email) => request('/verification/send', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyOTP: (email, otp, complaintId) => request('/verification/verify', { method: 'POST', body: JSON.stringify({ email, otp, complaintId }) }),
  resendOTP: (email) => request('/verification/resend', { method: 'POST', body: JSON.stringify({ email }) }),
  trackComplaint: (complaintNumber, email) => request(`/complaints/track?complaintNumber=${encodeURIComponent(complaintNumber)}&email=${encodeURIComponent(email)}`),

  // Staff Auth & Password Reset
  staffLogin: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  staffRegisterAnalyst: (userData) => request('/auth/register-analyst', { method: 'POST', body: JSON.stringify(userData) }),
  staffForgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  staffResetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),

  // Staff Complaint Inbox & Operations
  getStaffComplaints: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/staff/complaints${query ? `?${query}` : ''}`);
  },
  getStaffComplaintById: (id) => request(`/staff/complaints/${id}`),
  recordAction: (id, payload) => request(`/staff/complaints/${id}/action`, { method: 'POST', body: JSON.stringify(payload) }),
  resolveComplaint: (id, payload) => request(`/staff/complaints/${id}/response`, { method: 'POST', body: JSON.stringify(payload) }),

  // Analytics & Reports
  getAnalytics: () => request('/reports'),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),

  // Admin Management
  getAdminUsers: () => request('/admin/users'),
  createAdminUser: (userData) => request('/admin/users', { method: 'POST', body: JSON.stringify(userData) }),
  updateAdminUser: (id, userData) => request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(userData) }),
  deleteAdminUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  getAuditLogs: () => request('/admin/audit-logs'),
  getAdminSettings: () => request('/admin/settings')
};
