import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StaffSidebar } from '../components/StaffSidebar';
import { StaffHeader } from '../components/StaffHeader';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge, SentimentBadge } from '../components/Badge';
import {
  Sparkles,
  User,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Edit3,
  Check,
  X,
  Lock,
  Tag,
  History,
  ShieldCheck,
  FileCheck,
  Layers,
  Paperclip,
  Building2,
  Clock,
  ArrowRight,
  HelpCircle,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

export function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State for Analyst Editing & Action
  const [analystNotes, setAnalystNotes] = useState('');
  const [finalResponse, setFinalResponse] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // AI Decision State
  const [aiDecision, setAiDecision] = useState('ACCEPTED');
  const [editedSuggestedResp, setEditedSuggestedResp] = useState('');
  const [showProofModal, setShowProofModal] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // Investigation & Override State
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [additionalFindings, setAdditionalFindings] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  // Department Coordination State
  const [departments, setDepartments] = useState([]);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({
    departmentName: 'Payments & Finance',
    departmentId: '',
    requiredInformation: '',
    reason: '',
    priority: 'P2',
    deadline: ''
  });
  const [sendingDeptReq, setSendingDeptReq] = useState(false);

  // More Info Request State
  const [showMoreInfoModal, setShowMoreInfoModal] = useState(false);
  const [moreInfoText, setMoreInfoText] = useState('');

  // Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Explicit AI Solution Generator State
  const [aiGeneratingSolution, setAiGeneratingSolution] = useState(false);
  const [solutionTone, setSolutionTone] = useState('FORMAL_RESOLVED');

  // Admin Analyst Assignment State
  const [analysts, setAnalysts] = useState([]);
  const [targetAnalystId, setTargetAnalystId] = useState('');
  const [assigningAnalyst, setAssigningAnalyst] = useState(false);

  const handleGenerateAISolution = async () => {
    if (!data?.complaint?.id) return;
    setAiGeneratingSolution(true);
    setError(null);
    try {
      const res = await api.generateExplicitSolution(data.complaint.id, {
        tone: solutionTone,
        customNotes: analystNotes
      });
      if (res.success && res.solution) {
        setFinalResponse(res.solution);
        setSuccessMsg('Explicit AI Resolution Draft generated! You can now manually edit or customize any text below before sending.');
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate AI solution.');
    } finally {
      setAiGeneratingSolution(false);
    }
  };

  const handleAssignAnalystSubmit = async (e) => {
    e.preventDefault();
    if (!targetAnalystId || !data?.complaint?.id) return;
    setAssigningAnalyst(true);
    setError(null);
    try {
      const res = await api.assignComplaint(data.complaint.id, targetAnalystId);
      if (res.success) {
        setSuccessMsg(res.message);
        fetchDetail();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to assign analyst.');
    } finally {
      setAssigningAnalyst(false);
    }
  };

  const fetchDetail = () => {
    setLoading(true);

    Promise.all([
      api.getStaffComplaintById(id),
      api.getDepartments().catch(() => ({ success: false }))
    ])
      .then(([resComp, resDepts]) => {
        if (resComp.success) {
          setData(resComp);
          setSelectedPriority(resComp.aiAnalysis?.priority || 'MEDIUM');
          setSelectedStatus(resComp.complaint?.status || 'ASSIGNED');
          setFinalResponse(resComp.response?.responseText || resComp.aiAnalysis?.suggestedResponse || '');
          setEditedSuggestedResp(resComp.aiAnalysis?.suggestedResponse || '');

          if (resComp.complaint?.assignedAnalystId) {
            setTargetAnalystId(resComp.complaint.assignedAnalystId);
          }

          // Pre-populate smart proof template based on category if department form is empty
          const category = resComp.complaint?.category || '';
          let defaultReq = 'Verify transaction logs, payment reference, and settlement status.';
          if (category.toLowerCase().includes('technical') || category.toLowerCase().includes('it')) {
            defaultReq = 'Provide system error logs, service availability incident report, and technical investigation summary.';
          } else if (category.toLowerCase().includes('ops') || category.toLowerCase().includes('service')) {
            defaultReq = 'Provide operational delivery log, service fulfillment record, and investigation findings.';
          } else if (category.toLowerCase().includes('hr') || category.toLowerCase().includes('staff')) {
            defaultReq = 'Verify internal staff conduct logs, workplace policy adherence, and supervisor report.';
          }

          setDeptForm(prev => ({
            ...prev,
            requiredInformation: defaultReq,
            reason: `Complaint concerning ${resComp.complaint?.reason || category} requires department investigation.`
          }));
        } else {
          setError(resComp.error || 'Failed to load complaint detail.');
        }

        if (resDepts.success && Array.isArray(resDepts.departments)) {
          setDepartments(resDepts.departments);
          if (resDepts.departments.length > 0) {
            setDeptForm(prev => ({ ...prev, departmentName: resDepts.departments[0].name, departmentId: resDepts.departments[0].id }));
          }
        }

        if (isAdmin) {
          api.getAdminUsers()
            .then(resUsers => {
              if (resUsers.success && Array.isArray(resUsers.users)) {
                setAnalysts(resUsers.users);
              }
            })
            .catch(console.error);
        }
      })
      .catch(err => setError(err.message || 'Failed to load complaint.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const compileCombinedNotes = () => {
    let combined = analystNotes ? `Investigation: ${analystNotes}` : '';
    if (evidenceNotes) combined += `\nEvidence Verification: ${evidenceNotes}`;
    if (additionalFindings) combined += `\nAdditional Findings: ${additionalFindings}`;
    if (overrideReason && selectedPriority !== (data?.aiAnalysis?.priority || 'MEDIUM')) {
      combined += `\nPriority Override Reason (AI: ${data?.aiAnalysis?.priority || 'P3'} -> Analyst: ${selectedPriority}): ${overrideReason}`;
    }
    return combined;
  };

  const handleRecordAction = async (actionType) => {
    setActionLoading(true);
    setSuccessMsg(null);
    try {
      const payload = {
        action: actionType,
        notes: compileCombinedNotes(),
        status: selectedStatus,
        priority: selectedPriority,
        suggestedResponse: editedSuggestedResp
      };
      const res = await api.recordAction(data.complaint.id, payload);
      if (res.success) {
        setSuccessMsg('Action & Investigation Findings recorded successfully.');
        setAnalystNotes('');
        setEvidenceNotes('');
        setAdditionalFindings('');
        setOverrideReason('');
        fetchDetail();
      }
    } catch (err) {
      setError(err.message || 'Failed to record action.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Department Information Request
  const handleSendDepartmentRequest = async (e) => {
    e.preventDefault();
    setSendingDeptReq(true);
    setSuccessMsg(null);
    setError(null);
    try {
      const resData = await api.sendDepartmentRequest(data.complaint.id, deptForm);
      if (resData.success) {
        setSuccessMsg(`Request successfully routed to ${deptForm.departmentName} department. Status set to WAITING_FOR_DEPARTMENT.`);
        setShowDeptModal(false);
        fetchDetail();
      } else {
        alert(resData.error || 'Failed to route request to department.');
      }
    } catch (err) {
      alert(err.message || 'Error sending request to department.');
    } finally {
      setSendingDeptReq(false);
    }
  };

  // Analyst Review on Department Report (Accept Findings or Request More Info)
  const handleReviewDepartmentReport = async (decision) => {
    if (decision === 'REQUEST_MORE_INFO' && !moreInfoText.trim()) {
      alert('Please specify the additional information required.');
      return;
    }
    setActionLoading(true);
    setSuccessMsg(null);
    try {
      const resData = await api.reviewDepartmentReport(data.complaint.id, {
        decision,
        additionalInformationRequired: moreInfoText,
        notes: compileCombinedNotes()
      });
      if (resData.success) {
        setSuccessMsg(resData.message || 'Department report reviewed successfully.');
        setShowMoreInfoModal(false);
        setMoreInfoText('');
        fetchDetail();
      } else {
        alert(resData.error || 'Failed to submit department report review.');
      }
    } catch (err) {
      alert(err.message || 'Error reviewing department report.');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmAndResolve = (e) => {
    e.preventDefault();
    if (!finalResponse.trim()) {
      setError('Please provide a final response text for the customer.');
      return;
    }

    // Gatekeeper Check: Ensure no pending department report exists
    const deptReq = data?.departmentReport;
    if (deptReq && deptReq.status !== 'COMPLETED' && deptReq.status !== 'REPORT_SUBMITTED' && data?.complaint?.status === 'WAITING_FOR_DEPARTMENT') {
      setError(`Cannot resolve complaint: A formal request to '${deptReq.departmentName}' is currently 'WAITING_FOR_DEPARTMENT'. The Analyst must wait for the department report and verify findings before resolving.`);
      return;
    }

    setShowConfirmModal(true);
  };

  const executeSendAndResolve = async () => {
    setShowConfirmModal(false);
    setActionLoading(true);
    setSuccessMsg(null);
    setError(null);

    try {
      const payload = {
        responseText: finalResponse,
        notes: compileCombinedNotes(),
        confirmNoDeptRequired: true
      };
      const res = await api.resolveComplaint(data.complaint.id, payload);
      if (res.success) {
        setSuccessMsg('Final customer response dispatched & complaint marked as RESOLVED!');
        setAnalystNotes('');
        setEvidenceNotes('');
        setAdditionalFindings('');
        setOverrideReason('');
        fetchDetail();
      } else {
        setError(res.error || 'Failed to resolve complaint.');
      }
    } catch (err) {
      setError(err.message || 'Failed to resolve complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <StaffSidebar />
        <div className="flex-1 flex items-center justify-center text-sm font-semibold text-slate-500">
          Loading Complaint & Department Case Coordination Workbench...
        </div>
      </div>
    );
  }

  if (error || !data) {
    const isForbidden = error && (error.includes('403') || error.includes('Forbidden') || error.includes('not assigned'));

    return (
      <div className="flex min-h-screen bg-slate-50">
        <StaffSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <StaffHeader title="Access Restriction" subtitle="Security & Role Authorization Enforcement" />
          <main className="p-8 flex-1 flex items-center justify-center">
            <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-8 max-w-md w-full text-center space-y-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto font-bold text-xl ${
                isForbidden ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {isForbidden ? '🛡️' : '⚠️'}
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {isForbidden ? '403 Access Forbidden' : 'Complaint Not Found'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {error || 'The requested complaint record could not be loaded.'}
              </p>
              <div className="pt-2">
                <Link
                  to="/staff/complaints"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center space-x-2 transition-colors"
                >
                  <span>Return to My Caseload</span>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const { complaint, aiAnalysis, actions, response, departmentRequests, departmentReport, feedback, statusHistory } = data;
  const isAwaitingDepartment = complaint.status === 'WAITING_FOR_DEPARTMENT';
  const isReadyForAnalystReview = complaint.status === 'READY_FOR_ANALYST_REVIEW';
  const isReadyForUserResponse = complaint.status === 'READY_FOR_USER_RESPONSE';

  return (
    <div className="flex min-h-screen bg-slate-50">
      <StaffSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <StaffHeader
          title={`Case #${complaint.complaintNumber} — Analyst Coordination Workbench`}
          subtitle="Enterprise Case Coordination: User ➔ Admin ➔ Analyst ➔ Department ➔ Resolution"
        />

        <main className="p-6 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Header Case Status & Department Actions Bar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 custom-shadow flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-mono font-extrabold text-blue-600 tracking-wider">
                  {complaint.complaintNumber}
                </span>
                <StatusBadge status={complaint.status} />
                {departmentReport && (
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Dept: {departmentReport.departmentName}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Submitted on {new Date(complaint.createdAt).toLocaleString()} • Category: <strong className="text-slate-800">{complaint.category}</strong> • Place: <strong className="text-slate-800">{complaint.place}</strong>
              </p>
            </div>

            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <button
                onClick={() => setShowDeptModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>Request Proof from Department</span>
              </button>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-500">Priority:</span>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN: Complaint Submission & Department Investigation Report */}
            <div className="space-y-6">
              
              {/* Original Customer Complaint */}
              <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <User className="w-4 h-4 text-blue-600 mr-2" />
                    Customer Complaint Details
                  </h3>
                  <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Verified Complainant ✓
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Complainant Name</span>
                    <span className="font-bold text-slate-800">{complaint.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Complainant Email</span>
                    <span className="font-bold text-slate-800">{complaint.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Location / Branch</span>
                    <span className="font-bold text-slate-800">{complaint.place}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Category</span>
                    <span className="font-bold text-slate-800">{complaint.category}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-700 block mb-1">Reason:</span>
                  <p className="text-sm font-bold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {complaint.reason}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">Detailed Description:</span>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
                    {complaint.description || 'No additional text provided.'}
                  </p>
                </div>

                {complaint.attachmentUrl && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center">
                      <Paperclip className="w-4 h-4 text-blue-600 mr-1" />
                      Attached Customer Proof Document:
                    </span>
                    {complaint.attachmentUrl.startsWith('data:image/') ? (
                      <img
                        src={complaint.attachmentUrl}
                        alt="Customer Proof"
                        className="max-h-48 rounded-xl border border-slate-200 object-contain bg-slate-50 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setShowProofModal(true)}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowProofModal(true)}
                        className="inline-flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200 transition-colors text-xs cursor-pointer"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Attached Proof Document
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* DEPARTMENT INVESTIGATION REPORT CARD */}
              {departmentReport && (
                <div className="bg-white rounded-2xl border-2 border-indigo-200 custom-shadow p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center">
                      <Building2 className="w-4 h-4 text-indigo-600 mr-2" />
                      Department Investigation Report ({departmentReport.departmentName})
                    </h3>
                    <span className={`text-2xs font-extrabold uppercase px-2.5 py-1 rounded-full ${
                      departmentReport.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      departmentReport.status === 'REPORT_SUBMITTED' ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                      'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {departmentReport.status === 'REPORT_SUBMITTED' ? 'Report Submitted — Pending Review' : departmentReport.status}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
                      <span className="font-bold text-indigo-950 block uppercase tracking-wider text-3xs">1. Investigation Result:</span>
                      <p className="text-slate-800 font-medium leading-relaxed">{departmentReport.investigationResult}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-600 block uppercase text-3xs mb-0.5">2. Verified Evidence:</span>
                        <p className="text-slate-800 font-medium">{departmentReport.evidence || 'Verified internal logs.'}</p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-600 block uppercase text-3xs mb-0.5">3. Root Finding:</span>
                        <p className="text-slate-800 font-medium">{departmentReport.finding}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-600 block uppercase text-3xs">4. Corrective Action Taken:</span>
                      <p className="text-slate-800 font-medium">{departmentReport.actionTaken}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-600 block uppercase text-3xs">5. Department Recommendation:</span>
                      <p className="text-slate-800 font-medium">{departmentReport.recommendation}</p>
                    </div>
                  </div>

                  {/* Analyst Review Controls for Department Report */}
                  <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-2xs font-bold text-slate-500">Analyst Report Assessment:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleReviewDepartmentReport('ACCEPT')}
                        disabled={actionLoading || departmentReport.status === 'COMPLETED'}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-2xs rounded-xl shadow-xs transition-colors flex items-center space-x-1 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Findings</span>
                      </button>

                      <button
                        onClick={() => setShowMoreInfoModal(true)}
                        disabled={actionLoading}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-2xs rounded-xl shadow-xs transition-colors flex items-center space-x-1 disabled:opacity-50"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Request More Info</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Real-time Case Lifecycle Timeline */}
              <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center">
                  <History className="w-4 h-4 text-blue-600 mr-2" />
                  Real-Time Case Lifecycle Timeline
                </h3>

                <div className="relative pl-6 space-y-4 text-xs before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {statusHistory.map((step, idx) => (
                    <div key={idx} className="relative flex items-start space-x-3">
                      <span className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100"></span>
                      <div>
                        <div className="font-bold text-slate-800">{step.status.replace(/_/g, ' ')}</div>
                        <div className="text-2xs text-slate-400">{new Date(step.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: AI Analysis, Final Review & User Response Form */}
            <div className="space-y-6">

              {/* ADMIN ANALYST ASSIGNMENT PANEL */}
              {isAdmin && (
                <div className="bg-white rounded-2xl border-2 border-indigo-200 custom-shadow p-5 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-indigo-600 text-white rounded-xl shadow-xs">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">Admin Analyst Manual Assignment</h4>
                        <p className="text-3xs text-slate-500 font-medium">Assign or re-assign incoming case to a specific staff analyst.</p>
                      </div>
                    </div>
                    <span className={`text-3xs font-extrabold px-2.5 py-1 rounded-full border ${
                      data?.complaint?.assignedAnalystId ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                    }`}>
                      {data?.complaint?.assignedAnalystId ? 'Assigned ✓' : '⚠️ Unassigned (Incoming Case)'}
                    </span>
                  </div>

                  <form onSubmit={handleAssignAnalystSubmit} className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={targetAnalystId}
                      onChange={(e) => setTargetAnalystId(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 font-extrabold text-xs px-3 py-2 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="">-- Select Staff Analyst to Assign --</option>
                      {analysts.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email}) • {u.pendingCount || 0} Active Cases
                        </option>
                      ))}
                    </select>

                    <button
                      type="submit"
                      disabled={assigningAnalyst || !targetAnalystId}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      <UserCheck className="w-4 h-4 text-indigo-200" />
                      <span>{assigningAnalyst ? 'Assigning...' : 'Assign Analyst ➔'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* GEMINI AI TRIAGE ANALYSIS */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-xl space-y-5 border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <h3 className="text-base font-extrabold tracking-tight">AI Operational Triage</h3>
                  </div>
                  <span className="text-2xs font-bold bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-400/30">
                    AI Priority: {aiAnalysis?.priority || 'P2'}
                  </span>
                </div>

                {/* AI Key Indicators Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 text-2xs uppercase tracking-wider block mb-1">Severity & Urgency</span>
                    <span className="font-bold text-slate-200 block truncate">{aiAnalysis?.severity || 'Significant'} • {aiAnalysis?.urgency || 'Standard'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 text-2xs uppercase tracking-wider block mb-1">Impact Scope</span>
                    <span className="font-bold text-amber-300 block truncate">{aiAnalysis?.affectedScope || 'Single Complainant'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 text-2xs uppercase tracking-wider block mb-1">AI Recognized Dept</span>
                    <span className="font-bold text-blue-300 block truncate">{aiAnalysis?.recommendedDepartment || deptForm.departmentName}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 text-2xs uppercase tracking-wider block mb-1">Sentiment Score</span>
                    <SentimentBadge sentiment={aiAnalysis?.sentiment} score={aiAnalysis?.sentimentScore} />
                  </div>
                </div>

                {/* AI Recommended Department & Reasoning Card */}
                <div className="bg-blue-950/60 p-4 rounded-xl border border-blue-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-300 flex items-center space-x-1.5">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      <span>AI Department Recommendation: {aiAnalysis?.recommendedDepartment || deptForm.departmentName}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const rec = aiAnalysis?.recommendedDepartment || deptForm.departmentName;
                        const match = departments.find(d => d.name.toLowerCase().includes(rec.toLowerCase()) || rec.toLowerCase().includes(d.name.toLowerCase()));
                        setDeptForm(prev => ({
                          ...prev,
                          departmentName: match ? match.name : rec,
                          departmentId: match ? match.id : prev.departmentId,
                          reason: aiAnalysis?.departmentReason || prev.reason
                        }));
                        setShowDeptModal(true);
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-2xs rounded-lg transition-all shadow-xs flex items-center space-x-1"
                    >
                      <span>Route via AI Dept ➔</span>
                    </button>
                  </div>
                  <p className="text-slate-300 text-2xs italic">
                    Reason: "{aiAnalysis?.departmentReason || 'AI identified issue patterns matching this department.'}"
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-2xs uppercase font-bold text-slate-400 tracking-wider">AI Executive Summary</span>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-800/60 p-3.5 rounded-xl border border-slate-700">
                    {aiAnalysis?.summary || 'Complaint analyzed and queued for analyst routing.'}
                  </p>
                </div>
              </div>

              {/* FINAL CASE REVIEW & USER RESPONSE DISPATCH WORKBENCH */}
              <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-6 space-y-5">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span className="flex items-center">
                    <Send className="w-4 h-4 text-blue-600 mr-2" />
                    Final Case Review & User Response Dispatch
                  </span>
                  <span className="text-2xs font-bold text-slate-400">Analyst Coordinator</span>
                </h3>

                {/* Gatekeeper Banner Warning */}
                {isAwaitingDepartment && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs space-y-1">
                    <div className="font-bold flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Case Waiting for Department Investigation Report</span>
                    </div>
                    <p className="text-amber-800">
                      A request was routed to <strong>{departmentReport?.departmentName || 'Concerned Department'}</strong>. Final resolution cannot be dispatched until the department submits its report and findings are accepted.
                    </p>
                  </div>
                )}

                {/* Structured Investigation Notes */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Analyst Internal Coordinator Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Record internal analyst notes, cross-department communications, or verification notes..."
                      value={analystNotes}
                      onChange={(e) => setAnalystNotes(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                    />
                  </div>
                </div>

                {/* EXPLICIT AI SOLUTION GENERATOR TOOLBAR */}
                <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-slate-50 p-4 rounded-2xl space-y-3 border border-blue-200/90 shadow-xs overflow-hidden">
                  <div className="flex items-start space-x-2.5">
                    <div className="p-1.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">Explicit AI Solution Generator</h4>
                      <p className="text-2xs text-slate-500 font-medium leading-relaxed mt-0.5">
                        Generates a step-by-step resolution response based on complaint details & department findings.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 pt-0.5">
                    <div className="space-y-1">
                      <label className="text-3xs font-bold text-slate-500 uppercase tracking-wider block">Select Resolution Focus & Tone:</label>
                      <select
                        value={solutionTone}
                        onChange={(e) => setSolutionTone(e.target.value)}
                        className="w-full bg-white border border-slate-300 text-slate-800 font-bold text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs truncate"
                      >
                        <option value="FORMAL_RESOLVED">Full Resolution & Action (Standard)</option>
                        <option value="REFUND_PAYMENT">Refund & Payment Reversal</option>
                        <option value="TECHNICAL_FIX">Technical Fix & System Patch</option>
                        <option value="APOLOGY_COMPENSATION">Executive Apology & Goodwill</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateAISolution}
                      disabled={aiGeneratingSolution}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 text-blue-200" />
                      <span>{aiGeneratingSolution ? 'Generating Explicit AI Solution...' : 'Generate Explicit AI Solution'}</span>
                    </button>
                  </div>

                  <div className="bg-blue-100/70 border border-blue-200/80 px-3 py-2 rounded-xl text-2xs text-blue-900 font-medium leading-normal">
                    💡 <strong>Analyst Editing Control:</strong> AI drafts the solution. You can manually edit or customize any text in the box below before sending.
                  </div>
                </div>

                {/* Final Response Text Field (100% Manually Editable) */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Final Response to User (Emailed & Public Tracker) *
                    </label>
                    <span className="text-3xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0 whitespace-nowrap">
                      ✏️ Manual Edit Enabled
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    required
                    placeholder="Write or generate the formal, professional response to be dispatched to the customer..."
                    value={finalResponse}
                    onChange={(e) => setFinalResponse(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 leading-relaxed focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono shadow-2xs"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleRecordAction('SAVE_DRAFT_NOTES')}
                    disabled={actionLoading}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    Save Internal Notes
                  </button>

                  <button
                    type="button"
                    onClick={confirmAndResolve}
                    disabled={actionLoading || !finalResponse.trim() || (isAwaitingDepartment && !departmentReport)}
                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{actionLoading ? 'Dispatching...' : 'Send Final Response to User'}</span>
                  </button>
                </div>
              </div>

              {/* User Feedback Card (if submitted) */}
              {feedback && (
                <div className="bg-emerald-950/20 border border-emerald-800/80 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                    <span>User Satisfaction Feedback Submitted</span>
                    <span>Rating: {feedback.rating} / 5 ⭐</span>
                  </div>
                  <p className="text-xs text-slate-300 italic">"{feedback.feedbackText || 'No comments provided.'}"</p>
                  <div className="text-2xs text-slate-400">Resolved Satisfaction: <strong>{feedback.resolvedSatisfaction}</strong></div>
                </div>
              )}

            </div>

          </div>

        </main>
      </div>

      {/* REQUEST PROOF / INFORMATION FROM DEPARTMENT MODAL */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <span>Request Proof & Investigation from Department</span>
                </h3>
                <p className="text-2xs text-slate-400 mt-0.5">
                  Internal Organization Routing (User proof is already logged in complaint details)
                </p>
              </div>
              <button onClick={() => setShowDeptModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="bg-blue-950/60 border border-blue-800/80 p-3 rounded-xl text-2xs text-blue-300 space-y-1">
              <div className="font-bold flex items-center space-x-1.5 text-blue-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Internal Department Request Protocol</span>
              </div>
              <p>
                The complainant has submitted their grievance and evidence. Select the responsible internal department below to request transaction audit logs, technical verification, or operational proof from the department.
              </p>
            </div>

            <form onSubmit={handleSendDepartmentRequest} className="space-y-4 text-xs">
              {aiAnalysis?.recommendedDepartment && (
                <div className="bg-slate-850 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-blue-300">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>AI Recommended: <strong>{aiAnalysis.recommendedDepartment}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const rec = aiAnalysis.recommendedDepartment;
                      const match = departments.find(d => d.name.toLowerCase().includes(rec.toLowerCase()) || rec.toLowerCase().includes(d.name.toLowerCase()));
                      if (match) {
                        setDeptForm(prev => ({ ...prev, departmentName: match.name, departmentId: match.id }));
                      }
                    }}
                    className="text-3xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-2 py-1 rounded cursor-pointer"
                  >
                    Use AI Dept
                  </button>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Concerned Internal Department *</label>
                <select
                  required
                  value={deptForm.departmentName}
                  onChange={(e) => {
                    const selected = departments.find(d => d.name === e.target.value);
                    setDeptForm({ ...deptForm, departmentName: e.target.value, departmentId: selected ? selected.id : '' });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-bold text-xs"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Required Department Proof & Technical Investigation *</label>
                <textarea
                  required
                  rows={3}
                  value={deptForm.requiredInformation}
                  onChange={(e) => setDeptForm({ ...deptForm, requiredInformation: e.target.value })}
                  placeholder="Specify exact internal records, gateway transaction logs, or technical audit proof required from the department..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Reason for Department Routing *</label>
                <input
                  type="text"
                  required
                  value={deptForm.reason}
                  onChange={(e) => setDeptForm({ ...deptForm, reason: e.target.value })}
                  placeholder="Explain why this internal department must conduct the investigation..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Priority Level *</label>
                  <select
                    value={deptForm.priority}
                    onChange={(e) => setDeptForm({ ...deptForm, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="P1">P1 — Critical (Emergency)</option>
                    <option value="P2">P2 — High</option>
                    <option value="P3">P3 — Medium</option>
                    <option value="P4">P4 — Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Expected Response Deadline</label>
                  <input
                    type="date"
                    value={deptForm.deadline}
                    onChange={(e) => setDeptForm({ ...deptForm, deadline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingDeptReq}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{sendingDeptReq ? 'Routing Request...' : 'Send Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST MORE INFORMATION MODAL */}
      {showMoreInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Request More Information from Department</h3>
              <button onClick={() => setShowMoreInfoModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Additional Information Required *</label>
                <textarea
                  rows={3}
                  required
                  value={moreInfoText}
                  onChange={(e) => setMoreInfoText(e.target.value)}
                  placeholder="Detail what specific clarification or proof is missing from the department report..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowMoreInfoModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewDepartmentReport('REQUEST_MORE_INFO')}
                  disabled={actionLoading || !moreInfoText.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl text-slate-900">
            <div className="flex items-center space-x-3 text-blue-600">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center font-bold">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Response & Resolution</h3>
                <p className="text-2xs text-slate-500">Please confirm investigation completion before dispatch.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              Please confirm that the investigation for case <strong>{complaint.complaintNumber}</strong> is complete and the final response is ready to be sent to <strong>{complaint.email}</strong>.
            </p>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSendAndResolve}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{actionLoading ? 'Dispatching...' : 'Confirm & Send Response'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROOF PREVIEW MODAL */}
      {showProofModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Customer Proof Preview</h3>
              <button onClick={() => setShowProofModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
              <p className="text-slate-800 font-medium">{aiAnalysis?.attachmentSummary || 'Customer document proof verified.'}</p>
              {complaint.attachmentUrl && complaint.attachmentUrl.startsWith('data:image/') && (
                <img src={complaint.attachmentUrl} alt="Scan" className="w-full max-h-56 rounded-xl object-contain border border-slate-200 bg-white" />
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button onClick={() => setShowProofModal(false)} className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
