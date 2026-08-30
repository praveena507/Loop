import React, { useState, useEffect } from 'react';
import { StaffHeader } from '../components/StaffHeader';
import { StaffSidebar } from '../components/StaffSidebar';
import { api } from '../services/api';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Send, 
  FileText, 
  ShieldAlert, 
  Plus, 
  ChevronRight,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function DepartmentCoordinationPage() {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' or 'manage'
  const [departments, setDepartments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDept, setSelectedDept] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Report Modal State
  const [activeReportRequest, setActiveReportRequest] = useState(null);
  const [reportForm, setReportForm] = useState({
    investigationResult: '',
    evidence: '',
    finding: '',
    actionTaken: '',
    recommendation: '',
    supportingDocs: ''
  });
  const [submittingReport, setSubmittingReport] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Department Creation Modal
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', code: '', description: '' });

  useEffect(() => {
    fetchData();
  }, [selectedDept, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch departments and queue via API service
      const [deptsData, queueData] = await Promise.all([
        api.getDepartments(),
        api.getDepartmentQueue(selectedDept)
      ]);

      if (deptsData.success) {
        setDepartments(deptsData.departments);
      }

      if (queueData.success) {
        let reqs = queueData.requests || [];
        if (statusFilter) {
          reqs = reqs.filter(r => r.status === statusFilter);
        }
        setRequests(reqs);
      }
    } catch (err) {
      console.error('Failed to load department data:', err);
      setError(err.message || 'Could not connect to backend service.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReportModal = (request) => {
    setActiveReportRequest(request);
    setReportForm({
      investigationResult: request.investigationResult || 'Transaction and system records verified cleanly.',
      evidence: request.evidence || 'Internal database log check completed.',
      finding: request.finding || 'Identified root cause matching complaint parameters.',
      actionTaken: request.actionTaken || 'Initiated corrective action item in central operations system.',
      recommendation: request.recommendation || 'Confirm action completion and notify complainant.',
      supportingDocs: request.supportingDocs || ''
    });
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!activeReportRequest) return;
    setSubmittingReport(true);
    setSuccessMsg('');
    try {
      const data = await api.submitDepartmentReport(activeReportRequest.id, reportForm);
      if (data.success) {
        setSuccessMsg('Investigation report submitted successfully to Analyst.');
        setActiveReportRequest(null);
        fetchData();
      } else {
        alert(data.error || 'Failed to submit investigation report.');
      }
    } catch (err) {
      alert(err.message || 'Network error while submitting report.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      const data = await api.manageDepartment(newDept);
      if (data.success) {
        setShowAddDeptModal(false);
        setNewDept({ name: '', code: '', description: '' });
        fetchData();
      } else {
        alert(data.error || 'Failed to create department.');
      }
    } catch (err) {
      alert(err.message || 'Error creating department.');
    }
  };

  const filteredRequests = requests.filter(r => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    return (
      r.complaintNumber?.toLowerCase().includes(term) ||
      r.departmentName?.toLowerCase().includes(term) ||
      r.requiredInformation?.toLowerCase().includes(term) ||
      r.customerName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <StaffSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <StaffHeader />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Banner Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4" />
                <span>Enterprise Complaint Resolution Framework</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Department Coordination</h1>
              <p className="text-slate-400 text-sm mt-1">
                Analyst case coordination queue for routing complaints, requesting department proofs, and receiving investigation reports.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveTab('queue')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'queue' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Case Queue ({requests.length})
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'manage' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Manage Departments ({departments.length})
              </button>
            </div>
          </div>

          {successMsg && (
            <div className="bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 p-4 rounded-xl text-sm flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'queue' ? (
            <>
              {/* Queue Controls Bar */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by Complaint #, Department, or Requested Info..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto">
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">All Concerned Departments</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending Department Response</option>
                    <option value="REPORT_SUBMITTED">Report Submitted</option>
                    <option value="MORE_INFO_REQUESTED">More Info Requested</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              {/* Request Cards Queue Grid */}
              {loading ? (
                <div className="p-12 text-center text-slate-400">Loading department case queue...</div>
              ) : filteredRequests.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center space-y-3">
                  <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
                  <h3 className="text-base font-semibold text-slate-300">No Department Requests Found</h3>
                  <p className="text-slate-500 text-sm max-w-md mx-auto">
                    When an Analyst routes a complaint to a concerned department for proof or investigation, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRequests.map(req => (
                    <div key={req.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-xl transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                              {req.complaintNumber}
                            </span>
                            <span className={`text-2xs font-extrabold uppercase px-2 py-0.5 rounded ${
                              req.priority === 'P1' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                              req.priority === 'P2' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              'bg-slate-800 text-slate-300'
                            }`}>
                              {req.priority || 'P2'} Priority
                            </span>
                          </div>

                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            req.status === 'REPORT_SUBMITTED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            req.status === 'MORE_INFO_REQUESTED' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            req.status === 'COMPLETED' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                            'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {req.status === 'PENDING' ? 'Awaiting Department Response' : req.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div>
                          <div className="text-xs text-slate-400 font-medium">Concerned Department</div>
                          <div className="text-sm font-bold text-white flex items-center space-x-1.5 mt-0.5">
                            <Building2 className="w-4 h-4 text-blue-400" />
                            <span>{req.departmentName}</span>
                          </div>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-1.5 text-xs">
                          <div className="font-semibold text-slate-300">Required Proof / Information:</div>
                          <p className="text-slate-400 whitespace-pre-wrap">{req.requiredInformation}</p>
                          {req.reason && (
                            <div className="pt-1 border-t border-slate-900 text-slate-500">
                              <span className="font-medium text-slate-400">Routing Reason:</span> {req.reason}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <div className="space-y-0.5">
                          <div>Requested By: <span className="text-slate-200 font-medium">{req.requestedByName || 'Analyst'}</span></div>
                          <div>Requested On: {new Date(req.createdAt).toLocaleDateString()}</div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/staff/complaints/${req.complaintId}`}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors"
                          >
                            Open Case
                          </Link>
                          {req.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleOpenReportModal(req)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors flex items-center space-x-1"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Submit Report</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Manage Departments Tab */
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white">Configurable Department Registry</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Organization departments available for Analyst complaint routing and proof requests.</p>
                </div>
                <button
                  onClick={() => setShowAddDeptModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm flex items-center space-x-2 transition-all shadow-md shadow-blue-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Department</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {departments.map(dept => (
                  <div key={dept.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                        {dept.code}
                      </span>
                      <span className="text-2xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded uppercase">
                        {dept.status || 'ACTIVE'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{dept.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{dept.description || 'No specific description provided.'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Submit Department Investigation Report Modal */}
      {activeReportRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-blue-400 uppercase font-bold">Formal Investigation Submission</span>
                <h3 className="text-lg font-bold text-white mt-0.5">Department Investigation Report</h3>
                <p className="text-xs text-slate-400">Case #{activeReportRequest.complaintNumber} — {activeReportRequest.departmentName}</p>
              </div>
              <button onClick={() => setActiveReportRequest(null)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-300">Requested Information:</span>
                <p className="text-slate-400">{activeReportRequest.requiredInformation}</p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">1. Investigation Result *</label>
                <input
                  type="text"
                  required
                  value={reportForm.investigationResult}
                  onChange={(e) => setReportForm({ ...reportForm, investigationResult: e.target.value })}
                  placeholder="e.g. Transaction successfully verified in central gateway logs."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">2. Evidence / Proof *</label>
                  <textarea
                    required
                    rows={2}
                    value={reportForm.evidence}
                    onChange={(e) => setReportForm({ ...reportForm, evidence: e.target.value })}
                    placeholder="e.g. Gateway Ref #882194 status set to SUCCESS on 2026-08-25."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">3. Investigation Finding *</label>
                  <textarea
                    required
                    rows={2}
                    value={reportForm.finding}
                    onChange={(e) => setReportForm({ ...reportForm, finding: e.target.value })}
                    placeholder="e.g. Payment deduction succeeded but service webhook timed out."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">4. Corrective Action Taken *</label>
                <input
                  type="text"
                  required
                  value={reportForm.actionTaken}
                  onChange={(e) => setReportForm({ ...reportForm, actionTaken: e.target.value })}
                  placeholder="e.g. Manually triggered service activation and re-synced account."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">5. Department Recommendation *</label>
                <textarea
                  required
                  rows={2}
                  value={reportForm.recommendation}
                  onChange={(e) => setReportForm({ ...reportForm, recommendation: e.target.value })}
                  placeholder="e.g. Complete service provision confirmation and notify customer with reference ID."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveReportRequest(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submittingReport ? 'Submitting Report...' : 'Submit Report to Analyst'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add New Organization Department</h3>
              <button onClick={() => setShowAddDeptModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Department Name *</label>
                <input
                  type="text"
                  required
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  placeholder="e.g. Compliance & Risk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Department Code *</label>
                <input
                  type="text"
                  required
                  value={newDept.code}
                  onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
                  placeholder="e.g. RISK"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 uppercase font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={newDept.description}
                  onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                  placeholder="Brief responsibility summary"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
