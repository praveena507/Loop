import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { api } from '../services/api';
import { sendEmailJSVerification } from '../services/emailjsService';
import { KeyRound, RefreshCw, CheckCircle2, AlertCircle, Sparkles, Mail, ShieldCheck } from 'lucide-react';

export function EmailVerifyPage() {
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resendMsg, setResendMsg] = useState(null);
  const [timeLeft, setTimeLeft] = useState(150); // 2.5 mins (150 seconds)

  useEffect(() => {
    const data = sessionStorage.getItem('loop_pending_complaint');
    if (!data) {
      navigate('/complaint');
      return;
    }
    const parsed = JSON.parse(data);
    setSessionData(parsed);
    if (parsed.otp) {
      setDevOtp(parsed.otp);
    }
  }, [navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyOTP(sessionData.email, otp.trim(), sessionData.complaintId);
      if (res.success) {
        sessionStorage.setItem('loop_success_complaint', JSON.stringify({
          complaintNumber: sessionData.complaintNumber,
          email: sessionData.email
        }));
        sessionStorage.removeItem('loop_pending_complaint');
        navigate('/complaint-success');
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setResendMsg(null);
    try {
      const res = await api.resendOTP(sessionData.email);
      if (res.otp) {
        setDevOtp(res.otp);
        sendEmailJSVerification({
          to_email: sessionData.email,
          user_name: sessionData?.name || 'LOOP User',
          passcode: res.otp,
          expiresAt: res.expiresAt
        });
      }
      setResendMsg('A new verification code has been dispatched to your email address.');
      setTimeLeft(150);
    } catch (err) {
      setError(err.message || 'Failed to resend verification code.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!sessionData) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          
          <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-6 sm:p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-xs">
              <KeyRound className="w-7 h-7" />
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verify Your Email</h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Enter the 6-digit verification code sent to <br />
              <span className="font-semibold text-slate-800 break-all">{sessionData.email}</span>
            </p>

            {/* Test Helper / Auto-Fill Code Banner */}
            {devOtp && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-medium">Verification Code: <strong className="font-mono text-sm tracking-widest bg-amber-200/70 px-2 py-0.5 rounded text-amber-950">{devOtp}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtp(devOtp)}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-2xs transition-colors shrink-0 cursor-pointer w-full sm:w-auto"
                >
                  1-Click Fill Code
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {resendMsg && (
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2 text-left">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{resendMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="mt-6 space-y-5">
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full text-center text-2xl sm:text-3xl font-mono tracking-[0.3em] sm:tracking-[0.5em] py-3.5 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-bold"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Code expires in: <strong className="text-slate-700 font-mono">{formatTime(timeLeft)}</strong></span>
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-blue-600 font-semibold hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Verifying Code & Activating Ticket...' : 'Verify Email & Activate Ticket'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-2xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Protected by 256-bit encrypted authentication</span>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
