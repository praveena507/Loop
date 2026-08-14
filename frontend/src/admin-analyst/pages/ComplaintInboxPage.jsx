import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StaffSidebar } from '../components/StaffSidebar';
import { StaffHeader } from '../components/StaffHeader';
import { api } from '../../shared/services/api';
import { StatusBadge, PriorityBadge, SentimentBadge } from '../../shared/components/Badge';
import { Search, Filter, RefreshCw, ArrowUpDown, ChevronRight } from 'lucide-react';

export function ComplaintInboxPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');

  const fetchComplaints = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (categoryFilter) params.category = categoryFilter;
    if (priorityFilter) params.priority = priorityFilter;
    if (sentimentFilter) params.sentiment = sentimentFilter;

    api.getStaffComplaints(params)
      .then(res => {
        if (res.success) setComplaints(res.complaints || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, priorityFilter, sentimentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
    setPriorityFilter('');
    setSentimentFilter('');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <StaffSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <StaffHeader
          title="Complaint Inbox"
          subtitle="Search, filter, and inspect customer complaints across all operational stages."
        />

        <main className="p-6 space-y-6 flex-1">
          
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-5 space-y-4">
            
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search by Complaint ID, Customer Name, Email, Place, or Reason..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
              >
                Search
              </button>
            </form>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
              <span className="font-bold text-slate-500 flex items-center mr-1">
                <Filter className="w-3.5 h-3.5 mr-1" />
                Filters:
              </span>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:bg-white"
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="AI_ANALYZED">AI Analyzed</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:bg-white"
              >
                <option value="">All Categories</option>
                <option value="Product">Product</option>
                <option value="Service">Service</option>
                <option value="Payment">Payment</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Account">Account</option>
                <option value="Delivery">Delivery</option>
                <option value="Other">Other</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:bg-white"
              >
                <option value="">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              {/* Sentiment Filter */}
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:bg-white"
              >
                <option value="">All Sentiments</option>
                <option value="NEGATIVE">Negative</option>
                <option value="NEUTRAL">Neutral</option>
                <option value="POSITIVE">Positive</option>
              </select>

              {(statusFilter || categoryFilter || priorityFilter || sentimentFilter || search) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 font-bold rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors ml-auto"
                >
                  Reset Filters
                </button>
              )}
            </div>

          </div>

          {/* Complaints Table */}
          <div className="bg-white rounded-2xl border border-slate-200 custom-shadow overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs text-slate-500 font-medium">
              <span>Showing <strong>{complaints.length}</strong> complaint records</span>
              <span>Updated just now</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-2xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="py-3.5 px-6">Complaint ID</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Sentiment</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Created</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                        Loading complaint inbox...
                      </td>
                    </tr>
                  ) : complaints.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                        No complaint records match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    complaints.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-6 font-mono font-bold text-blue-600">
                          {c.complaintNumber}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {c.name}
                          <span className="block text-2xs font-normal text-slate-400">{c.email}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">{c.category}</td>
                        <td className="py-3.5 px-4">
                          <SentimentBadge sentiment={c.sentiment} score={c.sentimentScore} />
                        </td>
                        <td className="py-3.5 px-4">
                          <PriorityBadge priority={c.priority} />
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td className="py-3.5 px-6 text-right">
                          <Link
                            to={`/staff/complaints/${c.id}`}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs transition-colors text-2xs"
                          >
                            <span>Open Details</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
