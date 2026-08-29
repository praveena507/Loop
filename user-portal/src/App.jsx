import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserAuthProvider } from './context/UserAuthContext';

// User Portal Pages
import { LandingPage } from './pages/LandingPage';
import { UserLoginPage } from './pages/UserLoginPage';
import { UserRegisterPage } from './pages/UserRegisterPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { ComplaintFormPage } from './pages/ComplaintFormPage';
import { EmailVerifyPage } from './pages/EmailVerifyPage';
import { ComplaintSuccessPage } from './pages/ComplaintSuccessPage';
import { ComplaintListPage } from './pages/ComplaintListPage';
import { TrackComplaintPage } from './pages/TrackComplaintPage';
import { UserFeedbackPage } from './pages/UserFeedbackPage';
import { UserProfilePage } from './pages/UserProfilePage';

export default function App() {
  return (
    <UserAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<UserLoginPage />} />
          <Route path="/register" element={<UserRegisterPage />} />
          <Route path="/verify-email" element={<EmailVerifyPage />} />
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/complaint" element={<ComplaintFormPage />} />
          <Route path="/submit-complaint" element={<ComplaintFormPage />} />
          <Route path="/complaints" element={<ComplaintListPage />} />
          <Route path="/complaint-success" element={<ComplaintSuccessPage />} />
          <Route path="/track" element={<TrackComplaintPage />} />
          <Route path="/complaint/:id" element={<TrackComplaintPage />} />
          <Route path="/complaints/:id" element={<TrackComplaintPage />} />
          <Route path="/feedback" element={<UserFeedbackPage />} />
          <Route path="/profile" element={<UserProfilePage />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </UserAuthProvider>
  );
}
