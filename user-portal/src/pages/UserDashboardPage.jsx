import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useUserAuth } from '../context/UserAuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/Badge';
import {
  LayoutDashboard,
  MessageSquarePlus,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Inbox
} from 'lucide-react';

export function UserDashboardPage() {
  const navigate = useNavigate();
  const { user } = useUserAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserComplaints();
  }, [user]);

  const loadUserComplaints = async () => {
    const targetEmail = user?.email || 'sarah.j@example.com';
    setLoading(true);
    setError(null);
    try {
      const res = await api.getUserComplaints(targetEmail);
      if (res.success && Array.isArray(res.complaints)) {
        setComplaints(res.complaints);
      }

    } catch (err) {
      setError(err.message || 'Failed to fetch your complaints.');
    } finally {
      setLoading(false);
    }
  };

  const total = complaints.length;
  const inProgress = complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'REJECTED').length;
  const resolved = complaints.filter(c => c.status === 'RESOLVED').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Welcome Header */}
          <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Customer Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {user?.name || 'Customer'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {user?.email} • Track your submitted grievances and resolution status in real-time.
              </p>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Link
                to="/complaint"
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all"
              >
                <MessageSquarePlus className="w-4 h-4 mr-1.5" />
                Submit New Complaint
              </Link>
              <button
                onClick={loadUserComplaints}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                title="Refresh Complaints"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 custom-shadow">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Complaints</span>
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{total}</p>
              <span className="text-2xs text-slate-400 font-medium">All-time submitted tickets</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 custom-shadow">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Under Investigation</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-3xl font-extrabold text-amber-600">{inProgress}</p>
              <span className="text-2xs text-slate-400 font-medium">Active cases in review</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 custom-shadow">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-extrabold text-emerald-600">{resolved}</p>
              <span className="text-2xs text-slate-400 font-medium">Successfully completed tickets</span>
            </div>
          </div>

          {/* Recent Complaints Table */}
          <div className="bg-white rounded-2xl border border-slate-200 custom-shadow overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Your Complaints History</h2>
                <p className="text-xs text-slate-500">Track current status and official resolution responses.</p>
              </div>
              <Link
                to="/complaints"
                className="text-xs font-bold text-blue-600 hover:underline flex items-center"
              >
                <span>View Full List</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                Loading your complaints...
              </div>
            ) : error ? (
              <div className="p-6 text-center text-rose-600 text-xs">
                <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                {error}
              </div>
            ) : complaints.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Complaints Submitted Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When you submit a complaint, it will appear here with live tracking updates and official resolution notices.
                </p>
                <Link
                  to="/complaint"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  <MessageSquarePlus className="w-4 h-4 mr-1.5" />
                  Submit Your First Complaint
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-6">Ticket ID</th>
                      <th className="py-3.5 px-6">Category</th>
                      <th className="py-3.5 px-6">Reason</th>
                      <th className="py-3.5 px-6">Date</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {complaints.slice(0, 5).map((cmp) => (
                      <tr key={cmp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-blue-600">
                          {cmp.complaintNumber}
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-700">
                          {cmp.category}
                        </td>
                        <td className="py-4 px-6 text-slate-800 font-medium max-w-xs truncate">
                          {cmp.reason}
                        </td>
                        <td className="py-4 px-6 text-slate-500">
                          {cmp.createdAt ? new Date(cmp.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={cmp.status} />
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            to={`/track?id=${encodeURIComponent(cmp.complaintNumber)}&email=${encodeURIComponent(user.email)}`}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition-colors"
                          >
                            <span>Track</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
