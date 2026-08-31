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
 * Generic fetch wrapper with standard error handling and automatic JWT injection for Staff.
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
    let data;
    try {
      data = await res.json();
    } catch {
      data = { error: `Server returned ${res.status}: ${res.statusText}` };
    }

    if (res.status === 401) {
      localStorage.removeItem('loop_staff_token');
      localStorage.removeItem('loop_staff_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
      throw new Error(data.error || 'Session expired. Please log in again.');
    }

    if (!res.ok) {
      throw new Error(data.error || data.message || 'An error occurred while communicating with the server.');
    }

    return data;
  } catch (err) {
    console.error(`Staff API Error [${endpoint}]:`, err.message);
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error('Unable to connect to the backend server. Please check your internet connection or verify the backend service is active.');
    }
    throw err;
  }
}

export const api = {
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
  sendDepartmentRequest: (id, payload) => request(`/staff/complaints/${id}/department-request`, { method: 'POST', body: JSON.stringify(payload) }),
  reviewDepartmentReport: (id, payload) => request(`/staff/complaints/${id}/review-department-report`, { method: 'POST', body: JSON.stringify(payload) }),
  generateExplicitSolution: (id, payload) => request(`/staff/complaints/${id}/generate-solution`, { method: 'POST', body: JSON.stringify(payload || {}) }),
  resolveComplaint: (id, payload) => request(`/staff/complaints/${id}/response`, { method: 'POST', body: JSON.stringify(payload) }),

  // Departments
  getDepartments: () => request('/departments'),
  manageDepartment: (deptData) => request('/departments/manage', { method: 'POST', body: JSON.stringify(deptData) }),
  getDepartmentQueue: (deptName) => request(`/departments/queue${deptName ? `?departmentName=${encodeURIComponent(deptName)}` : ''}`),
  submitDepartmentReport: (requestId, payload) => request(`/staff/department-requests/${requestId}/report`, { method: 'POST', body: JSON.stringify(payload) }),

  // Feedback & Quality Insights
  getFeedbackInsights: () => request('/feedback/insights'),

  // Analytics & Reports
  getAnalytics: () => request('/reports'),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),

  // Admin User & Analyst Management
  getAdminUsers: () => request('/admin/users'),
  createAdminUser: (userData) => request('/admin/users', { method: 'POST', body: JSON.stringify(userData) }),
  updateAdminUser: (id, userData) => request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(userData) }),
  resendAdminUserCredentials: (id) => request(`/admin/users/${id}/resend-credentials`, { method: 'POST' }),
  deleteAdminUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  assignComplaint: (id, analystId) => request(`/admin/complaints/${id}/assign`, { method: 'POST', body: JSON.stringify({ analystId }) }),
  getAuditLogs: () => request('/admin/audit-logs'),
  getAdminSettings: () => request('/admin/settings'),
  seedDemoDatabase: async () => {
    try {
      return await request('/admin/seed', { method: 'POST' });
    } catch (e) {
      return await request('/seed-database', { method: 'POST' });
    }
  }
};

