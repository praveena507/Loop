import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './shared/context/AuthContext';

// User Portal Pages
import { LandingPage } from './user/pages/LandingPage';
import { ComplaintFormPage } from './user/pages/ComplaintFormPage';
import { EmailVerifyPage } from './user/pages/EmailVerifyPage';
import { ComplaintSuccessPage } from './user/pages/ComplaintSuccessPage';
import { TrackComplaintPage } from './user/pages/TrackComplaintPage';

// Staff Portal Pages
import { StaffLoginPage } from './admin-analyst/pages/StaffLoginPage';
import { StaffDashboardPage } from './admin-analyst/pages/StaffDashboardPage';
import { ComplaintInboxPage } from './admin-analyst/pages/ComplaintInboxPage';
import { ComplaintDetailPage } from './admin-analyst/pages/ComplaintDetailPage';
import { StaffAnalyticsPage } from './admin-analyst/pages/StaffAnalyticsPage';
import { StaffReportsPage, StaffNotificationsPage, StaffProfilePage } from './admin-analyst/pages/StaffReportsPage';

// Admin Pages
import { UserManagementPage } from './admin-analyst/pages/UserManagementPage';
import { SettingsPage, AuditLogsPage } from './admin-analyst/pages/SettingsPage';

// Route Guards
function StaffProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/staff/login" replace />;
  }
  return children;
}

function AdminProtectedRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/staff/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/staff/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* PORTAL 1: PUBLIC USER ROUTES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/complaint" element={<ComplaintFormPage />} />
          <Route path="/verify-email" element={<EmailVerifyPage />} />
          <Route path="/complaint-success" element={<ComplaintSuccessPage />} />
          <Route path="/track" element={<TrackComplaintPage />} />
          <Route path="/complaint/:id" element={<TrackComplaintPage />} />

          {/* PORTAL 2: SEPARATE OFFICE & STAFF LOGIN ROUTES */}
          <Route path="/office" element={<StaffLoginPage />} />
          <Route path="/office/login" element={<StaffLoginPage />} />
          <Route path="/admin/login" element={<StaffLoginPage />} />
          <Route path="/staff/login" element={<StaffLoginPage />} />

          {/* PORTAL 2: STAFF PROTECTED ROUTES */}
          <Route path="/staff/dashboard" element={<StaffProtectedRoute><StaffDashboardPage /></StaffProtectedRoute>} />
          <Route path="/staff/complaints" element={<StaffProtectedRoute><ComplaintInboxPage /></StaffProtectedRoute>} />
          <Route path="/staff/complaints/:id" element={<StaffProtectedRoute><ComplaintDetailPage /></StaffProtectedRoute>} />
          <Route path="/staff/analytics" element={<StaffProtectedRoute><StaffAnalyticsPage /></StaffProtectedRoute>} />
          <Route path="/staff/reports" element={<StaffProtectedRoute><StaffReportsPage /></StaffProtectedRoute>} />
          <Route path="/staff/notifications" element={<StaffProtectedRoute><StaffNotificationsPage /></StaffProtectedRoute>} />
          <Route path="/staff/profile" element={<StaffProtectedRoute><StaffProfilePage /></StaffProtectedRoute>} />

          {/* PORTAL 2: ADMIN PROTECTED ROUTES */}
          <Route path="/staff/admin/users" element={<AdminProtectedRoute><UserManagementPage /></AdminProtectedRoute>} />
          <Route path="/staff/admin/settings" element={<AdminProtectedRoute><SettingsPage /></AdminProtectedRoute>} />
          <Route path="/staff/admin/audit-logs" element={<AdminProtectedRoute><AuditLogsPage /></AdminProtectedRoute>} />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
