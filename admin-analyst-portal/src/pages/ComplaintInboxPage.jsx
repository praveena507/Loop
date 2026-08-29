import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { StaffSidebar } from '../components/StaffSidebar';
import { StaffHeader } from '../components/StaffHeader';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { exportComplaintsToCSV } from '../utils/csvExporter';
import { StatusBadge, PriorityBadge, SentimentBadge } from '../components/Badge';
import { Search, Filter, RefreshCw, ArrowUpDown, ChevronRight, UserCheck, CheckCircle2, AlertCircle, Download } from 'lucide-react';

export function ComplaintInboxPage() {
  const { user, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const [complaints, setComplaints] = useState([]);
  const [analysts, setAnalysts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || '');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState(() => searchParams.get('priority') || '');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');

  const fetchComplaints = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (categoryFilter) params.category = categoryFilter;
    if (priorityFilter) params.priority = priorityFilter;
    if (sentimentFilter) params.sentiment = sentimentFilter;
    if (assignedFilter === 'mine') params.assignedToMe = 'true';

    api.getStaffComplaints(params)
      .then(res => {
        if (res.success) setComplaints(res.complaints || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const s = searchParams.get('status');
    const p = searchParams.get('priority');
    if (s !== null) setStatusFilter(s);
    if (p !== null) setPriorityFilter(p);
  }, [searchParams]);

  useEffect(() => {
    fetchComplaints();
    if (isAdmin) {
      api.getAdminUsers()
        .then(res => {
          if (res.success) {
            setAnalysts(res.users.filter(u => u.role === 'ANALYST'));
          }
        })
        .catch(console.error);
    }
  }, [statusFilter, categoryFilter, priorityFilter, sentimentFilter, assignedFilter]);

  // State for Workload Assignment Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [targetAnalystId, setTargetAnalystId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    // Find analyst with minimum active workload for recommendation
    if (analysts.length > 0) {
      const sorted = [...analysts].sort((a, b) => (a.pendingCount || 0) - (b.pendingCount || 0));
      setTargetAnalystId(complaint.assignedAnalystId || sorted[0].id);
    }
  };

  const handleModalAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !targetAnalystId) return;

    setAssigning(true);
    try {
      const res = await api.assignComplaint(selectedComplaint.id, targetAnalystId);
      if (res.success) {
        setToast(res.message);
        setTimeout(() => setToast(null), 3000);
        setSelectedComplaint(null);
        fetchComplaints();
      }
    } catch (err) {
      console.error('Assign error:', err);
    } finally {
      setAssigning(false);
    }
  };

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
    setAssignedFilter('');
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <StaffSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <StaffHeader
          title={isAdmin ? "Master Complaint Management" : "Assigned Complaints Inbox"}
          subtitle="Search, filter, assign analysts, and inspect customer complaints across all operational stages."
        />

        <main className="p-6 space-y-6 flex-1">
          
          {toast && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center space-x-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toast}</span>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700/80 custom-shadow p-5 space-y-4">
            
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search by Complaint ID, Customer Name, Email, Place, or Reason..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Search
              </button>

              <button
                type="button"
                onClick={() => exportComplaintsToCSV(complaints, `LOOP_Complaints_Inbox_${new Date().toISOString().slice(0,10)}.csv`)}
                className="px-4 py-2.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-800 transition-colors flex items-center shrink-0 cursor-pointer"
                title="Export currently visible complaints to CSV file"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Export CSV
              </button>
            </form>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-700/80 text-xs">
              <span className="font-bold text-slate-400 flex items-center mr-1">
                <Filter className="w-3.5 h-3.5 mr-1" />
                Filters:
              </span>

              {/* Scope Filter for Analysts */}
              {!isAdmin && (
                <select
                  value={assignedFilter}
                  onChange={(e) => setAssignedFilter(e.target.value)}
                  className="px-3 py-1.5 bg-blue-950 border border-blue-800 text-blue-300 rounded-lg font-bold"
                >
                  <option value="">All Operational Complaints</option>
                  <option value="mine">My Assigned Complaints Only</option>
                </select>
              )}

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg font-semibold text-slate-200 focus:outline-hidden"
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="AI_ANALYZED">AI Analyzed</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING_FOR_DEPARTMENT">Awaiting Dept Response</option>
                <option value="READY_FOR_ANALYST_REVIEW">Dept Report Received</option>
                <option value="READY_FOR_USER_RESPONSE">Ready for User Response</option>
                <option value="RESOLVED">Resolved</option>
                <option value="ESCALATED">Escalated</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg font-semibold text-slate-200 focus:outline-hidden"
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
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg font-semibold text-slate-200 focus:outline-hidden"
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
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg font-semibold text-slate-200 focus:outline-hidden"
              >
                <option value="">All Sentiments</option>
                <option value="NEGATIVE">Negative</option>
                <option value="NEUTRAL">Neutral</option>
                <option value="POSITIVE">Positive</option>
              </select>

              {(statusFilter || categoryFilter || priorityFilter || sentimentFilter || assignedFilter || search) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 bg-rose-950/60 text-rose-300 font-bold rounded-lg border border-rose-800 hover:bg-rose-900/60 transition-colors ml-auto cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>

          </div>

          {/* Complaints Table */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700/80 custom-shadow overflow-hidden">
            <div className="p-4 bg-slate-900/60 border-b border-slate-700 flex justify-between items-center text-xs text-slate-400 font-medium">
              <span>Showing <strong>{complaints.length}</strong> complaint records</span>
              <span>Real-time DB sync active</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/40 border-b border-slate-700 text-2xs uppercase tracking-wider text-slate-400 font-bold">
                    <th className="py-3.5 px-6">Complaint ID</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Status</th>
                    {isAdmin && <th className="py-3.5 px-4">Assigned Analyst</th>}
                    <th className="py-3.5 px-4">Created</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-slate-400 font-medium">
                        Loading complaint records...
                      </td>
                    </tr>
                  ) : complaints.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-slate-400 font-medium">
                        No complaint records match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    complaints.map(c => (
                      <tr key={c.id} className="hover:bg-slate-700/40 transition-colors">
                        <td className="py-3.5 px-6 font-mono font-bold text-blue-400">
                          {c.complaintNumber}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {c.name}
                          <span className="block text-2xs font-normal text-slate-400">{c.email}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-medium">{c.category}</td>
                        <td className="py-3.5 px-4">
                          <PriorityBadge priority={c.priority} />
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={c.status} />
                        </td>
                        {isAdmin && (
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2">
                              {c.assignedAnalystName ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800 truncate max-w-[130px]" title={c.assignedAnalystName}>
                                  👤 {c.assignedAnalystName}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">
                                  ⚡ Unassigned
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => openAssignModal(c)}
                                className="px-2 py-1 bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-200 border border-slate-600 rounded-md font-bold text-2xs transition-colors shrink-0 cursor-pointer"
                                title="Assign or reassign analyst"
                              >
                                {c.assignedAnalystName ? 'Change' : 'Assign'}
                              </button>
                            </div>
                          </td>
                        )}
                        <td className="py-3.5 px-4 text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td className="py-3.5 px-6 text-right">
                          <Link
                            to={`/staff/complaints/${c.id}`}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-xs transition-colors text-2xs"
                          >
                            <span>Open Workspace</span>
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

      {/* Workload-Aware Analyst Assignment Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <div>
                <h3 className="text-base font-extrabold text-white">Assign Operational Analyst</h3>
                <p className="text-2xs text-blue-400 font-mono">Case #{selectedComplaint.complaintNumber}</p>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* AI Priority & Context Banner */}
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-700 flex justify-between items-center text-xs">
              <div>
                <span className="text-2xs uppercase text-slate-400 font-bold block">AI Recommended Priority</span>
                <PriorityBadge priority={selectedComplaint.priority} />
              </div>
              <div className="text-right">
                <span className="text-2xs uppercase text-slate-400 font-bold block">Category</span>
                <span className="font-bold text-white">{selectedComplaint.category}</span>
              </div>
            </div>

            {/* Workload Recommendation Alert */}
            <div className="p-3.5 bg-blue-950/60 border border-blue-800 rounded-xl text-xs text-blue-200 space-y-1">
              <span className="font-bold flex items-center">
                <UserCheck className="w-4 h-4 text-blue-400 mr-1.5" />
                Workload Recommendation Engine
              </span>
              <p className="text-2xs text-blue-300">
                System recommends assigning to the analyst with lowest active caseload to maintain SLA velocity.
              </p>
            </div>

            {/* Analyst Workload Selection List */}
            <form onSubmit={handleModalAssignSubmit} className="space-y-4">
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {analysts.map(a => {
                  const isSelected = targetAnalystId === a.id;
                  const activeCount = a.pendingCount || 0;
                  const highCount = a.highPriorityCount || 0;
                  const capacityPct = a.workloadPercentage || 0;

                  return (
                    <label
                      key={a.id}
                      onClick={() => setTargetAnalystId(a.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-950/40 shadow-xs' : 'border-slate-700 hover:border-slate-600 bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="analyst"
                          checked={isSelected}
                          onChange={() => setTargetAnalystId(a.id)}
                          className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{a.name}</p>
                          <p className="text-2xs text-slate-400">{a.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-2xs text-right">
                        <div>
                          <span className="font-bold text-slate-300 block">{activeCount} Active</span>
                          <span className="text-slate-500 block">{highCount} Critical/High</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-extrabold border ${
                          capacityPct > 75 ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}>
                          {capacityPct}% Capacity
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning || !targetAnalystId}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {assigning ? 'Assigning...' : 'Assign Complaint'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
