import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useUserAuth } from '../context/UserAuthContext';
import { sendEmailJSVerification } from '../services/emailjsService';
import { Mail, User, ArrowRight, AlertCircle, CheckCircle2, UserPlus, Sparkles } from 'lucide-react';

export function UserRegisterPage() {
  const navigate = useNavigate();
  const { requestOTP, verifyOTPAndLogin, loading } = useUserAuth();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim() || !email.trim()) {
      setError('Please provide your full name and email address.');
      return;
    }

    try {
      const res = await requestOTP(email.trim(), name.trim());
      if (res.success) {
        if (res.otp) {
          sendEmailJSVerification({
            to_email: email.trim(),
            user_name: name.trim(),
            passcode: res.otp,
            expiresAt: res.expiresAt
          });
          setDevOtp(res.otp);
        }
        setSuccessMsg(`A 6-digit verification code has been dispatched to ${email.trim()}.`);
        setStep(2);
      } else {
        setError(res.error || 'Failed to dispatch registration code.');
      }
    } catch (err) {
      setError(err.message || 'Failed to dispatch registration code.');
    }
  };

  const handleVerifyRegistration = async (e) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim() || otp.trim().length < 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    const res = await verifyOTPAndLogin(email.trim(), otp.trim(), name.trim());
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Invalid or expired verification code.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          
          <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-8">
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100">
                <UserPlus className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Customer Account</h1>
              <p className="mt-1 text-xs text-slate-500">
                Register to track all your grievances and receive real-time resolution updates.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {successMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer mt-2"
                >
                  <span>{loading ? 'Creating Account...' : 'Continue with Email Verification'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-3 text-center">
                  <p className="text-xs text-slate-500">
                    Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyRegistration} className="space-y-4">
                {devOtp && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center justify-between">
                    <span className="flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      Verification Code:
                    </span>
                    <span className="font-mono text-sm tracking-widest bg-blue-100 px-2 py-0.5 rounded text-blue-900">
                      {devOtp}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Enter 6-Digit Verification Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full text-center text-2xl font-mono tracking-[0.4em] py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-bold"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    ← Edit Details
                  </button>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Verifying...' : 'Complete Registration'}
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
