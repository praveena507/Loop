import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { api } from '../../shared/services/api';
import { Cpu, Lock, Mail, Eye, EyeOff, AlertCircle, Shield, KeyRound, CheckCircle2, X, Sparkles, UserCheck, ShieldAlert, ArrowRight } from 'lucide-react';

export function StaffLoginPage() {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();

  // Active Role Tab: 'ANALYST' or 'ADMIN'
  const [activeTab, setActiveTab] = useState('ANALYST');

  // Login Form State
  const [email, setEmail] = useState('analyst@loop.com');
  const [password, setPassword] = useState('Analyst@12345');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [devResetOtp, setDevResetOtp] = useState('');

  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState(null);
  const [forgotSuccess, setForgotSuccess] = useState(null);

  // Register Analyst Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState(null);
  const [regSuccess, setRegSuccess] = useState(null);

  // Quick Switch Roles
  const handleSwitchTab = (role) => {
    setActiveTab(role);
    setError(null);
    if (role === 'ANALYST') {
      setEmail('analyst@loop.com');
      setPassword('Analyst@12345');
    } else {
      setEmail('admin@loop.com');
      setPassword('Admin@12345');
    }
  };

  const handleRegisterAnalystSubmit = async (e) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setRegError('Please fill in all required fields.');
      return;
    }

    setRegLoading(true);
    try {
      const res = await api.staffRegisterAnalyst({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword
      });

      if (res.success) {
        setRegSuccess('Analyst account registered successfully! Auto-selecting account...');
        setTimeout(() => {
          setActiveTab('ANALYST');
          setEmail(regEmail.trim());
          setPassword(regPassword);
          setShowRegisterModal(false);
          setRegName('');
          setRegEmail('');
          setRegPassword('');
          setRegSuccess(null);
        }, 1500);
      }
    } catch (err) {
      setRegError(err.message || 'Failed to register analyst account.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter staff email and password.');
      return;
    }

    const res = await login(email.trim(), password);
    if (res.success) {
      if (activeTab === 'ADMIN' && res.user.role !== 'ADMIN') {
        setError('This account does not have System Administrator privileges.');
        return;
      }
      navigate('/staff/dashboard');
    } else {
      setError(res.error || 'Authentication failed. Please verify staff credentials.');
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!resetEmail.trim()) {
      setForgotError('Please enter your registered staff email.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.staffForgotPassword(resetEmail.trim());
      if (res.success) {
        setForgotSuccess(res.message);
        setDevResetOtp(res.devOtp || '');
        setForgotStep(2);
      }
    } catch (err) {
      setForgotError(err.message || 'Failed to dispatch password reset code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!resetOtp.trim() || resetOtp.trim().length < 6) {
      setForgotError('Please enter a valid 6-digit OTP verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.staffResetPassword({
        email: resetEmail.trim(),
        otp: resetOtp.trim(),
        newPassword
      });

      if (res.success) {
        setForgotSuccess('Password reset successfully! You can now log in.');
        setTimeout(() => {
          setEmail(resetEmail.trim());
          setPassword(newPassword);
          setShowForgotModal(false);
          setForgotStep(1);
          setResetEmail('');
          setResetOtp('');
          setNewPassword('');
          setConfirmPassword('');
        }, 1500);
      }
    } catch (err) {
      setForgotError(err.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-slate-900 px-4 sm:px-6 lg:px-8 py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">

        {/* Staff Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold mx-auto shadow-lg shadow-blue-500/30">
            <Cpu className="w-7 h-7" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-white tracking-tight">LOOP Staff Secure Portal</h2>
          <p className="mt-1 text-xs text-slate-400 font-medium">Select your staff role below to sign in with dedicated credentials.</p>
        </div>

        {/* DUAL ROLE SECTION SWITCHER */}
        <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          
          {/* SECTION 1: ANALYST PORTAL TAB */}
          <button
            type="button"
            onClick={() => handleSwitchTab('ANALYST')}
            className={`p-3.5 rounded-xl transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
              activeTab === 'ANALYST'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold border border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60 font-medium'
            }`}
          >
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4" />
              <span className="text-sm">Analyst Login Section</span>
            </div>
            <span className="text-2xs opacity-80 mt-0.5">Complaint Review & AI Workbench</span>
          </button>

          {/* SECTION 2: ADMINISTRATOR PORTAL TAB */}
          <button
            type="button"
            onClick={() => handleSwitchTab('ADMIN')}
            className={`p-3.5 rounded-xl transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
              activeTab === 'ADMIN'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold border border-rose-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60 font-medium'
            }`}
          >
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-sm">Admin Login Section</span>
            </div>
            <span className="text-2xs opacity-80 mt-0.5">User Management & Audit Logs</span>
          </button>

        </div>

        {/* Main Login Card */}
        <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-8 shadow-2xl">
          
          {/* Section Indicator Banner */}
          <div className={`mb-6 p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
            activeTab === 'ANALYST'
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <span className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              {activeTab === 'ANALYST' ? 'ANALYST PORTAL SECTION' : 'ADMINISTRATOR PORTAL SECTION'}
            </span>
            <span className="text-2xs font-mono bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
              Preset Loaded ✓
            </span>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start space-x-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                {activeTab === 'ANALYST' ? 'Analyst Email Address' : 'Admin Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder={activeTab === 'ANALYST' ? 'analyst@loop.com' : 'admin@loop.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email || '');
                    setForgotStep(1);
                    setForgotError(null);
                    setForgotSuccess(null);
                    setShowForgotModal(true);
                  }}
                  className="text-2xs text-blue-400 font-semibold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer ${
                activeTab === 'ANALYST'
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>
                {authLoading
                  ? 'Authenticating...'
                  : activeTab === 'ANALYST'
                  ? 'Sign In to Analyst Portal'
                  : 'Sign In to Admin Portal'}
              </span>
            </button>
          </form>

          {/* Registration Option */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setRegError(null);
                setRegSuccess(null);
                setShowRegisterModal(true);
              }}
              className="text-xs font-semibold text-blue-400 hover:underline inline-flex items-center space-x-1"
            >
              <UserCheck className="w-3.5 h-3.5 mr-1" />
              <span>Need a new Analyst account? Register Analyst</span>
            </button>
          </div>

          {/* Quick Credential Pre-fill Cards */}
          <div className="mt-8 pt-6 border-t border-slate-700/80 space-y-3">
            <p className="text-xs font-bold text-slate-300">Quick Test Credentials (Seeded):</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-2xs">
              <button
                type="button"
                onClick={() => handleSwitchTab('ANALYST')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeTab === 'ANALYST'
                    ? 'bg-blue-500/20 border-blue-500/60 text-blue-200'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Analyst Credentials</span>
                  {activeTab === 'ANALYST' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                </div>
                <div className="font-mono mt-1 text-slate-300">analyst@loop.com</div>
                <div className="font-sans text-slate-400 mt-0.5">Pass: Analyst@12345</div>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchTab('ADMIN')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeTab === 'ADMIN'
                    ? 'bg-rose-500/20 border-rose-500/60 text-rose-200'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Admin Credentials</span>
                  {activeTab === 'ADMIN' && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
                </div>
                <div className="font-mono mt-1 text-slate-300">admin@loop.com</div>
                <div className="font-sans text-slate-400 mt-0.5">Pass: Admin@12345</div>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Staff Forgot Password & Email Verification OTP Reset Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-5 text-white shadow-2xl">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold">Staff Password Reset</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* STEP 1: Enter Email for OTP */}
            {forgotStep === 1 && (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter your registered staff email address (Admin or Analyst). We will send a 6-digit verification OTP code to reset your password.
                </p>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Staff Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="analyst@loop.com or admin@loop.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                  >
                    {forgotLoading ? 'Dispatching OTP...' : 'Send Verification OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Enter OTP & Set New Password */}
            {forgotStep === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                
                {devResetOtp && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-between">
                    <span className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-1 text-amber-400" />
                      Test Reset OTP:
                    </span>
                    <span className="font-mono text-sm tracking-widest bg-amber-900/60 px-2 py-0.5 rounded text-amber-200">
                      {devResetOtp}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    6-Digit Verification Code (OTP) *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full text-center text-xl font-mono tracking-widest py-2.5 px-4 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    ← Change Email
                  </button>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                    >
                      {forgotLoading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                  </div>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Analyst Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-5 text-white shadow-2xl">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold">Register New Staff Analyst</h3>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegisterAnalystSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Staff Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. s.jenkins@loop.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 flex items-center space-x-1"
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  <span>{regLoading ? 'Registering...' : 'Register Analyst Account'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
