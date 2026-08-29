import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useUserAuth } from '../context/UserAuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/Badge';
import { Search, Filter, RefreshCw, AlertCircle, ArrowRight, Inbox, MessageSquarePlus } from 'lucide-react';

export function ComplaintListPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadComplaints();
  }, [isAuthenticated, navigate, user]);

  const loadComplaints = async () => {
    if (!user?.email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getUserComplaints(user.email);
      if (res.success && Array.isArray(res.complaints)) {
        setComplaints(res.complaints);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch complaints.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = complaints.filter(c => {
    const matchSearch = !search ||
      c.complaintNumber?.toLowerCase().includes(search.toLowerCase()) ||
      c.reason?.toLowerCase().includes(search.toLowerCase()) ||
      c.place?.toLowerCase().includes(search.toLowerCase());
    
    const matchStatus = !statusFilter || c.status === statusFilter;
    const matchCategory = !categoryFilter || c.category === categoryFilter;

    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                My Complaints
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                View all your logged grievance tickets, track investigation stages, and inspect final responses.
              </p>
            </div>

            <Link
              to="/complaint"
              className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all"
            >
              <MessageSquarePlus className="w-4 h-4 mr-1.5" />
              Submit New Complaint
            </Link>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 custom-shadow grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search ticket ID, reason, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-medium cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="VERIFIED">Email Verified</option>
                <option value="AI_ANALYZED">Under Review</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-medium cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="Product">Product</option>
                <option value="Service">Service</option>
                <option value="Payment">Payment</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Account">Account</option>
                <option value="Delivery">Delivery</option>
              </select>
            </div>
          </div>

          {/* Complaints Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200 custom-shadow overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                Loading complaints...
              </div>
            ) : error ? (
              <div className="p-6 text-center text-rose-600 text-xs">
                <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Complaints Match Your Criteria</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search terms or filters above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-6">Ticket ID</th>
                      <th className="py-3.5 px-6">Location</th>
                      <th className="py-3.5 px-6">Category</th>
                      <th className="py-3.5 px-6">Reason / Subject</th>
                      <th className="py-3.5 px-6">Submitted Date</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((cmp) => (
                      <tr key={cmp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-blue-600">
                          {cmp.complaintNumber}
                        </td>
                        <td className="py-4 px-6 text-slate-700 font-medium">
                          {cmp.place}
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
