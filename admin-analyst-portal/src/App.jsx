import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Staff & Admin Pages
import { StaffLoginPage } from './pages/StaffLoginPage';
import { StaffDashboardPage } from './pages/StaffDashboardPage';
import { ComplaintInboxPage } from './pages/ComplaintInboxPage';
import { ComplaintDetailPage } from './pages/ComplaintDetailPage';
import { StaffAnalyticsPage } from './pages/StaffAnalyticsPage';
import { StaffReportsPage, StaffNotificationsPage, StaffProfilePage } from './pages/StaffReportsPage';
import { DepartmentCoordinationPage } from './pages/DepartmentCoordinationPage';
import { FeedbackInsightsPage } from './pages/FeedbackInsightsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { SettingsPage, AuditLogsPage } from './pages/SettingsPage';

// Route Guards
function StaffProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminProtectedRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
          {/* Authentication Routes */}
          <Route path="/" element={<StaffLoginPage />} />
          <Route path="/login" element={<StaffLoginPage />} />
          <Route path="/staff/login" element={<StaffLoginPage />} />
          <Route path="/admin/login" element={<StaffLoginPage />} />
          <Route path="/office" element={<StaffLoginPage />} />
          <Route path="/office/login" element={<StaffLoginPage />} />

          {/* Operational Staff Routes (Admin + Analyst) */}
          <Route path="/staff/dashboard" element={<StaffProtectedRoute><StaffDashboardPage /></StaffProtectedRoute>} />
          <Route path="/admin/dashboard" element={<StaffProtectedRoute><StaffDashboardPage /></StaffProtectedRoute>} />
          <Route path="/analyst/dashboard" element={<StaffProtectedRoute><StaffDashboardPage /></StaffProtectedRoute>} />

          <Route path="/staff/complaints" element={<StaffProtectedRoute><ComplaintInboxPage /></StaffProtectedRoute>} />
          <Route path="/admin/complaints" element={<StaffProtectedRoute><ComplaintInboxPage /></StaffProtectedRoute>} />
          <Route path="/analyst/cases" element={<StaffProtectedRoute><ComplaintInboxPage /></StaffProtectedRoute>} />

          <Route path="/staff/complaints/:id" element={<StaffProtectedRoute><ComplaintDetailPage /></StaffProtectedRoute>} />
          <Route path="/admin/complaints/:id" element={<StaffProtectedRoute><ComplaintDetailPage /></StaffProtectedRoute>} />
          <Route path="/analyst/cases/:id" element={<StaffProtectedRoute><ComplaintDetailPage /></StaffProtectedRoute>} />

          <Route path="/staff/departments" element={<StaffProtectedRoute><DepartmentCoordinationPage /></StaffProtectedRoute>} />
          <Route path="/analyst/departments" element={<StaffProtectedRoute><DepartmentCoordinationPage /></StaffProtectedRoute>} />
          <Route path="/staff/department-queue" element={<StaffProtectedRoute><DepartmentCoordinationPage /></StaffProtectedRoute>} />

          <Route path="/staff/analytics" element={<StaffProtectedRoute><StaffAnalyticsPage /></StaffProtectedRoute>} />
          <Route path="/admin/analytics" element={<StaffProtectedRoute><StaffAnalyticsPage /></StaffProtectedRoute>} />

          <Route path="/staff/reports" element={<StaffProtectedRoute><StaffReportsPage /></StaffProtectedRoute>} />
          <Route path="/staff/notifications" element={<StaffProtectedRoute><StaffNotificationsPage /></StaffProtectedRoute>} />
          <Route path="/staff/profile" element={<StaffProtectedRoute><StaffProfilePage /></StaffProtectedRoute>} />

          {/* Dedicated Administrator Protected Routes */}
          <Route path="/staff/admin/feedback" element={<AdminProtectedRoute><FeedbackInsightsPage /></AdminProtectedRoute>} />
          <Route path="/admin/feedback" element={<AdminProtectedRoute><FeedbackInsightsPage /></AdminProtectedRoute>} />

          <Route path="/staff/admin/users" element={<AdminProtectedRoute><UserManagementPage /></AdminProtectedRoute>} />
          <Route path="/admin/analysts" element={<AdminProtectedRoute><UserManagementPage /></AdminProtectedRoute>} />

          <Route path="/staff/admin/settings" element={<AdminProtectedRoute><SettingsPage /></AdminProtectedRoute>} />
          <Route path="/admin/settings" element={<AdminProtectedRoute><SettingsPage /></AdminProtectedRoute>} />

          <Route path="/staff/admin/audit-logs" element={<AdminProtectedRoute><AuditLogsPage /></AdminProtectedRoute>} />
          <Route path="/admin/audit-logs" element={<AdminProtectedRoute><AuditLogsPage /></AdminProtectedRoute>} />

          {/* Catch-All Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
