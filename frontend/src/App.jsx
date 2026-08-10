import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// User Portal Pages
import { LandingPage } from './pages/user/LandingPage';
import { ComplaintFormPage } from './pages/user/ComplaintFormPage';
import { EmailVerifyPage } from './pages/user/EmailVerifyPage';
import { ComplaintSuccessPage } from './pages/user/ComplaintSuccessPage';
import { TrackComplaintPage } from './pages/user/TrackComplaintPage';

// Staff Portal Pages
import { StaffLoginPage } from './pages/staff/StaffLoginPage';
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage';
import { ComplaintInboxPage } from './pages/staff/ComplaintInboxPage';
import { ComplaintDetailPage } from './pages/staff/ComplaintDetailPage';
import { StaffAnalyticsPage } from './pages/staff/StaffAnalyticsPage';
import { StaffReportsPage, StaffNotificationsPage, StaffProfilePage } from './pages/staff/StaffReportsPage';

// Admin Pages
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { SettingsPage, AuditLogsPage } from './pages/admin/SettingsPage';

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

          {/* PORTAL 2: STAFF LOGIN */}
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
