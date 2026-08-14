import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CheckCircle2, Search, Home, Copy, Check, Cpu } from 'lucide-react';

export function ComplaintSuccessPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('loop_success_complaint');
    if (!saved) {
      navigate('/');
      return;
    }
    setData(JSON.parse(saved));
  }, [navigate]);

  const copyToClipboard = () => {
    if (data?.complaintNumber) {
      navigator.clipboard.writeText(data.complaintNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!data) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-lg w-full">
          
          <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 border-2 border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Complaint Submitted Successfully
            </h1>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Your complaint has been successfully submitted and verified. LOOP AI will analyze your complaint and our support team will review it.
            </p>

            {/* Complaint ID Display Box */}
            <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-2xs uppercase tracking-wider font-bold text-slate-400">Assigned Complaint ID</p>
              <div className="mt-1 flex items-center justify-center space-x-2">
                <span className="text-2xl font-mono font-extrabold text-blue-600 tracking-wider">
                  {data.complaintNumber}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="p-1.5 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-lg shadow-2xs transition-colors"
                  title="Copy Complaint ID"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-2xs text-slate-400 mt-1">Keep this Complaint ID to track status updates.</p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Link
                to={`/track?id=${encodeURIComponent(data.complaintNumber)}&email=${encodeURIComponent(data.email)}`}
                className="inline-flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all"
              >
                <Search className="w-4 h-4 mr-2" />
                Track Complaint
              </Link>

              <Link
                to="/"
                className="inline-flex items-center justify-center px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Link>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
