import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useUserAuth } from '../context/UserAuthContext';
import { api } from '../services/api';
import { User, Mail, ShieldCheck, FileText, CheckCircle2, LogOut, Clock } from 'lucide-react';

export function UserProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUserAuth();
  const [complaintCount, setComplaintCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.email) {
      api.getUserComplaints(user.email)
        .then(res => {
          if (res.success && Array.isArray(res.complaints)) {
            setComplaintCount(res.complaints.length);
          }
        })
        .catch(console.error);
    }
  }, [isAuthenticated, navigate, user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-2xl mx-auto mb-4 shadow-lg shadow-blue-500/20">
              {user?.name?.charAt(0) || 'U'}
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900">{user?.name || 'Customer Account'}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>

            <div className="mt-4 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Account Owner</span>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 text-left border-y border-slate-100 py-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Submitted Tickets</span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{complaintCount}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Account Type</span>
                <span className="text-2xl font-extrabold text-blue-600 mt-1 block">Customer</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Go to Dashboard
              </button>

              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-bold text-xs rounded-xl transition-colors inline-flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
