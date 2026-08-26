import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { StaffSidebar } from '../components/StaffSidebar';
import { StaffHeader } from '../components/StaffHeader';
import { api } from '../../shared/services/api';
import { useAuth } from '../../shared/context/AuthContext';
import { exportComplaintsToCSV } from '../../shared/utils/csvExporter';
import { StatusBadge, PriorityBadge, SentimentBadge } from '../../shared/components/Badge';
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
    <div className="flex min-h-screen bg-slate-50">
      <StaffSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <StaffHeader
          title={isAdmin ? "Master Complaint Management" : "Assigned Complaints Inbox"}
          subtitle="Search, filter, assign analysts, and inspect customer complaints across all operational stages."
        />

        <main className="p-6 space-y-6 flex-1">
          
          {toast && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toast}</span>
            </div>
          )}

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
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Search
              </button>

              <button
                type="button"
                onClick={() => exportComplaintsToCSV(complaints, `LOOP_Complaints_Inbox_${new Date().toISOString().slice(0,10)}.csv`)}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition-colors flex items-center shrink-0 cursor-pointer"
                title="Export currently visible complaints to CSV file"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Export CSV
              </button>
            </form>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
              <span className="font-bold text-slate-500 flex items-center mr-1">
                <Filter className="w-3.5 h-3.5 mr-1" />
                Filters:
              </span>

              {/* Scope Filter for Analysts */}
              {!isAdmin && (
                <select
                  value={assignedFilter}
                  onChange={(e) => setAssignedFilter(e.target.value)}
                  className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg font-bold"
                >
                  <option value="">All Operational Complaints</option>
                  <option value="mine">My Assigned Complaints Only</option>
                </select>
              )}

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:bg-white"
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="AI_ANALYZED">AI Analyzed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Closed</option>
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

              {(statusFilter || categoryFilter || priorityFilter || sentimentFilter || assignedFilter || search) && (
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
              <span>Real-time DB sync active</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-2xs uppercase tracking-wider text-slate-500 font-bold">
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
                <tbody className="divide-y divide-slate-100 text-xs">
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
                          <PriorityBadge priority={c.priority} />
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={c.status} />
                        </td>
                        {isAdmin && (
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2">
                              {c.assignedAnalystName ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 truncate max-w-[130px]" title={c.assignedAnalystName}>
                                  👤 {c.assignedAnalystName}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  ⚡ Unassigned
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => openAssignModal(c)}
                                className="px-2 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200 rounded-md font-bold text-2xs transition-colors shrink-0 cursor-pointer"
                                title="Assign or reassign analyst"
                              >
                                {c.assignedAnalystName ? 'Change' : 'Assign'}
                              </button>
                            </div>
                          </td>
                        )}
                        <td className="py-3.5 px-4 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td className="py-3.5 px-6 text-right">
                          <Link
                            to={`/staff/complaints/${c.id}`}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs transition-colors text-2xs"
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
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-slate-900">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Assign Operational Analyst</h3>
                <p className="text-2xs text-slate-500 font-mono">Case #{selectedComplaint.complaintNumber}</p>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* AI Priority & Context Banner */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <span className="text-2xs uppercase text-slate-400 font-bold block">AI Recommended Priority</span>
                <PriorityBadge priority={selectedComplaint.priority} />
              </div>
              <div className="text-right">
                <span className="text-2xs uppercase text-slate-400 font-bold block">Category</span>
                <span className="font-bold text-slate-800">{selectedComplaint.category}</span>
              </div>
            </div>

            {/* Workload Recommendation Alert */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
              <span className="font-bold flex items-center">
                <UserCheck className="w-4 h-4 text-blue-600 mr-1.5" />
                Workload Recommendation Engine
              </span>
              <p className="text-2xs text-blue-700">
                System recommends assigning to the analyst with lowest active caseload to ensure balanced SLA resolution velocity.
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
                        isSelected ? 'border-blue-600 bg-blue-50/50 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="analyst"
                          checked={isSelected}
                          onChange={() => setTargetAnalystId(a.id)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{a.name}</p>
                          <p className="text-2xs text-slate-500">{a.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-2xs text-right">
                        <div>
                          <span className="font-bold text-slate-700 block">{activeCount} Active</span>
                          <span className="text-slate-400 block">{highCount} Critical/High</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-extrabold border ${
                          capacityPct > 75 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {capacityPct}% Capacity
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning || !targetAnalystId}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
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
