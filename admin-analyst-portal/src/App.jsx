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

// Global Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error Boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold border border-rose-500/30">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-white">Something went wrong</h2>
            <p className="text-xs text-slate-400 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 font-mono text-left overflow-auto max-h-32">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.location.href = '/staff/dashboard'}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
