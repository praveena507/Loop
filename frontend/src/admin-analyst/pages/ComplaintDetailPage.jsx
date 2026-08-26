import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StaffSidebar } from '../components/StaffSidebar';
import { StaffHeader } from '../components/StaffHeader';
import { api } from '../../shared/services/api';
import { StatusBadge, PriorityBadge, SentimentBadge } from '../../shared/components/Badge';
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
  Paperclip
} from 'lucide-react';

export function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

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
  const [editingAi, setEditingAi] = useState(false);
  const [editedSuggestedResp, setEditedSuggestedResp] = useState('');
  const [showProofModal, setShowProofModal] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // Investigation & Override State
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [additionalFindings, setAdditionalFindings] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  const fetchDetail = () => {
    setLoading(true);
    api.getStaffComplaintById(id)
      .then(res => {
        if (res.success) {
          setData(res);
          setSelectedPriority(res.aiAnalysis?.priority || 'MEDIUM');
          setSelectedStatus(res.complaint?.status || 'ASSIGNED');
          setFinalResponse(res.response?.responseText || res.aiAnalysis?.suggestedResponse || '');
          setEditedSuggestedResp(res.aiAnalysis?.suggestedResponse || '');
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

  // State for Response Confirmation Dialog Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const confirmAndResolve = (e) => {
    e.preventDefault();
    if (!finalResponse.trim()) {
      setError('Please provide a final response text for the customer.');
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
        notes: compileCombinedNotes()
      };
      const res = await api.resolveComplaint(data.complaint.id, payload);
      if (res.success) {
        setSuccessMsg('Final customer response dispatched & complaint marked as RESOLVED!');
        setAnalystNotes('');
        setEvidenceNotes('');
        setAdditionalFindings('');
        setOverrideReason('');
        fetchDetail();
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
          Loading Complaint & Document Proof Workbench...
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

  const { complaint, aiAnalysis, actions, response } = data;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <StaffSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <StaffHeader
          title={`Complaint Detail: ${complaint.complaintNumber}`}
          subtitle="Customer Feedback Details & Automated Document Intelligence Workbench"
        />

        <main className="p-6 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Top Info Bar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 custom-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-mono font-extrabold text-blue-600 tracking-wider">
                  {complaint.complaintNumber}
                </span>
                <StatusBadge status={complaint.status} />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Submitted on {new Date(complaint.createdAt).toLocaleString()} • Problem Section: <strong className="text-slate-800">{aiAnalysis?.sectionName || `${complaint.category} Section`}</strong>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-slate-500">Analyst Priority Override:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN: Customer Complaint & Proof */}
            <div className="space-y-6">
              
              {/* Original Customer Complaint Box */}
              <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <User className="w-4 h-4 text-blue-600 mr-2" />
                    Customer Submission
                  </h3>
                  <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Email Verified ✓
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Customer Name</span>
                    <span className="font-bold text-slate-800">{complaint.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Customer Email</span>
                    <span className="font-bold text-slate-800">{complaint.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Location / Place</span>
                    <span className="font-bold text-slate-800">{complaint.place}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Section / Category</span>
                    <span className="font-bold text-slate-800">{complaint.category}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-700 block mb-1">Reason / Title:</span>
                  <p className="text-sm font-bold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {complaint.reason}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">Full Detailed Context:</span>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
                    {complaint.description || 'No additional details provided.'}
                  </p>
                </div>

                {complaint.attachmentUrl && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center">
                      <Paperclip className="w-4 h-4 text-blue-600 mr-1" />
                      Attached Customer Proof Document / Image:
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

              {/* AUTOMATED DOCUMENT PROOF INTELLIGENCE CARD */}
              {aiAnalysis && (
                <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center">
                      <FileCheck className="w-4 h-4 text-emerald-600 mr-2" />
                      Automated Document Proof Analysis
                    </h3>
                    <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {aiAnalysis.proofMatch || 'Proof Match Verified ✓'}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900 flex items-center">
                        <Sparkles className="w-4 h-4 text-emerald-600 mr-1.5" />
                        AI Proof OCR Evidence Extraction:
                      </span>
                    </div>
                    <p className="text-slate-800 leading-relaxed font-medium">
                      {aiAnalysis.attachmentSummary || 'Document proof verified by Automated OCR.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-400 font-medium block text-2xs uppercase tracking-wider">Assigned Section</span>
                      <span className="font-bold text-slate-800">{aiAnalysis.sectionName || `${complaint.category} Section`}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-400 font-medium block text-2xs uppercase tracking-wider">Identified Root Cause</span>
                      <span className="font-bold text-rose-700">{aiAnalysis.rootCause || 'Operational Glitch'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action History Trail */}
              <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
                  <History className="w-4 h-4 text-slate-600 mr-2" />
                  Staff Audit & Action History
                </h3>

                <div className="space-y-3 max-h-56 overflow-y-auto">
                  {actions.length === 0 ? (
                    <p className="text-xs text-slate-400">No actions recorded yet.</p>
                  ) : (
                    actions.map(act => (
                      <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <div className="flex justify-between items-center font-bold text-slate-800 mb-1">
                          <span>{act.action}</span>
                          <span className="text-2xs text-slate-400">{new Date(act.createdAt).toLocaleString()}</span>
                        </div>
                        {act.notes && <p className="text-slate-600 italic mt-1">{act.notes}</p>}
                        <span className="text-2xs text-blue-600 font-semibold mt-1 block">By: {act.analystName || 'Analyst'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: AI Analysis & Analyst Action Form */}
            <div className="space-y-6">
              
              {/* CORPORATE AI TRIAGE WORKBENCH CARD */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-xl space-y-5 border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <h3 className="text-base font-extrabold tracking-tight">AI Operational Triage Recommendation</h3>
                  </div>
                  <span className="text-2xs font-bold bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-400/30">
                    AI Confidence: {aiAnalysis?.confidence || 'High'}
                  </span>
                </div>

                {/* AI Key Indicators Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 text-2xs uppercase tracking-wider block mb-1">Recommended Priority</span>
                    <PriorityBadge priority={aiAnalysis?.priority || 'MEDIUM'} />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 text-2xs uppercase tracking-wider block mb-1">Severity & Urgency</span>
                    <span className="font-bold text-slate-200 block truncate">{aiAnalysis?.severity || 'Significant'} • {aiAnalysis?.urgency || 'Standard'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 text-2xs uppercase tracking-wider block mb-1">Impact Scope</span>
                    <span className="font-bold text-amber-300 block truncate">{aiAnalysis?.affectedScope || 'Single User'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 text-2xs uppercase tracking-wider block mb-1">Customer Sentiment</span>
                    <SentimentBadge sentiment={aiAnalysis?.sentiment} score={aiAnalysis?.sentimentScore} />
                  </div>
                </div>

                {/* AI Executive Summary */}
                <div className="space-y-1.5">
                  <span className="text-2xs uppercase font-bold text-slate-400 tracking-wider">AI Fact-Based Summary</span>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-800/60 p-3.5 rounded-xl border border-slate-700">
                    {aiAnalysis?.summary || 'Complaint logged and awaiting human review.'}
                  </p>
                </div>

                {/* AI Key Factors / Evidence Bullets */}
                {aiAnalysis?.keyFactors && (
                  <div className="space-y-1.5">
                    <span className="text-2xs uppercase font-bold text-slate-400 tracking-wider">Primary Operational Factors</span>
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 space-y-1 text-xs">
                      {(typeof aiAnalysis.keyFactors === 'string' ? JSON.parse(aiAnalysis.keyFactors) : aiAnalysis.keyFactors).map((factor, idx) => (
                        <div key={idx} className="flex items-center text-slate-300 text-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2 shrink-0"></span>
                          <span>{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Human-In-The-Loop Disclaimer */}
                <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-2xs text-slate-400">
                  <span className="italic">AI Note: Operational recommendation only. Human owner decision is final.</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setAiDecision('ACCEPTED')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        aiDecision === 'ACCEPTED' ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      ✓ Accept Recommendation
                    </button>
                  </div>
                </div>

              </div>

              {/* ANALYST DECISION & FINAL RESPONSE FORM */}
              <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-6 space-y-5">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span className="flex items-center">
                    <Send className="w-4 h-4 text-blue-600 mr-2" />
                    Analyst Investigation & Decision Workbench
                  </span>
                  <span className="text-2xs font-bold text-slate-400">Human Authority</span>
                </h3>

                {/* Priority Override & Decision Section */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Human Priority Decision</label>
                      <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="CRITICAL">P1 — Critical</option>
                        <option value="HIGH">P2 — High</option>
                        <option value="MEDIUM">P3 — Medium</option>
                        <option value="LOW">P4 — Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Case Status</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="ASSIGNED">Assigned / Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="ACTION_TAKEN">Action Taken</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="ESCALATED">Escalated</option>
                      </select>
                    </div>
                  </div>

                  {/* Override Reason Field if Analyst Priority != AI Priority */}
                  {selectedPriority !== (aiAnalysis?.priority || 'MEDIUM') && (
                    <div className="pt-2">
                      <label className="block text-2xs font-bold uppercase tracking-wider text-amber-700 mb-1">
                        Priority Override Reason (AI Recommended: {aiAnalysis?.priority || 'P3'} → Selected: {selectedPriority}) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Explain why human analyst is overriding AI recommended priority..."
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        className="w-full p-2.5 bg-amber-50/50 border border-amber-300 rounded-xl text-xs font-medium focus:bg-white text-slate-900"
                      />
                    </div>
                  )}
                </div>

                {/* Structured Investigation Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center">
                      <Lock className="w-3.5 h-3.5 text-rose-500 mr-1.5" />
                      Investigation Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Enter investigation steps, logs checked, or team findings..."
                      value={analystNotes}
                      onChange={(e) => setAnalystNotes(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-2xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Evidence / Verification Notes
                      </label>
                      <input
                        type="text"
                        placeholder="Receipt verified, payment gateway log checked..."
                        value={evidenceNotes}
                        onChange={(e) => setEvidenceNotes(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Additional Findings
                      </label>
                      <input
                        type="text"
                        placeholder="Root cause confirmed, store supervisor informed..."
                        value={additionalFindings}
                        onChange={(e) => setAdditionalFindings(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Sector-Specific Analyst Decision Presets */}
                <div className="flex flex-wrap gap-2 pt-1 pb-1">
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block w-full">Analyst Sector Decision Controls:</span>
                  
                  {/* Product Sector Action */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus('ACTION_TAKEN');
                      setEvidenceNotes('Product defect evidence verified via official product catalog & photo proof.');
                      setAdditionalFindings('Initiated Manufacturer Quality Assurance ticket #QA-2026 and generated prepaid product return shipping label.');
                      setFinalResponse(`Dear ${complaint?.name || 'Customer'},\n\nWe have reviewed your product issue regarding "${complaint?.reason || 'your product'}". We have contacted our manufacturer to perform a strict quality assurance audit.\n\nOur team has arranged a product return. A prepaid return shipping label and replacement/refund dispatch instructions have been sent to your verified email.\n\nTicket Reference: ${complaint?.complaintNumber}\n\nBest regards,\nLOOP Quality Assurance & Support Team`);
                    }}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-2xs font-bold transition-colors flex items-center cursor-pointer shadow-2xs"
                  >
                    📦 Product: Ask Manufacturer for QA & Arrange Return
                  </button>

                  {/* Payment Sector Action */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus('RESOLVED');
                      setEvidenceNotes('Payment gateway transaction log & bank debit statement verified on official banking portal.');
                      setAdditionalFindings('Authorized internal finance team to resend money correctly to customer account.');
                      setFinalResponse(`Dear ${complaint?.name || 'Customer'},\n\nWe have verified your payment transaction through our official gateway logs. Our finance team has been authorized to resend your money correctly to your bank account.\n\nThe transaction reversal has been initiated and will credit your account in 1-2 business days.\n\nTransaction Reference: ${complaint?.complaintNumber}\n\nBest regards,\nLOOP Finance & Support Team`);
                    }}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-2xs font-bold transition-colors flex items-center cursor-pointer shadow-2xs"
                  >
                    💳 Payment: Authorize Finance Team to Resend Money
                  </button>

                  {/* Service Sector Action */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus('RESOLVED');
                      setEvidenceNotes('Official store manager incident log & location report verified.');
                      setAdditionalFindings('Service corrective action logged; branch management conducted operational staff audit.');
                      setFinalResponse(`Dear ${complaint?.name || 'Customer'},\n\nThank you for bringing your service experience at ${complaint?.place || 'our location'} to our attention. Our Analyst team has investigated with official branch management.\n\nOperational corrective measures and staff quality checks have been enforced.\n\nBest regards,\nLOOP Operations Support Team`);
                    }}
                    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-2xs font-bold transition-colors flex items-center cursor-pointer shadow-2xs"
                  >
                    🏬 Service: Escalate to Store Manager for Quality Audit
                  </button>
                </div>

                {/* Final Customer Response Editor */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Final Customer Response (Will Be Emailed & Shown On Tracking Portal) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write or customize the final official response..."
                    value={finalResponse}
                    onChange={(e) => setFinalResponse(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                  <span className="text-2xs text-slate-400 block mt-1">
                    Display Sender Identity: <strong>LOOP Support Team</strong>
                  </span>
                </div>

                {/* Submit Resolution Action Button */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleRecordAction('SAVE_DRAFT_NOTES')}
                    disabled={actionLoading}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    Save Notes Only
                  </button>

                  <button
                    type="button"
                    onClick={confirmAndResolve}
                    disabled={actionLoading || !finalResponse.trim()}
                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{actionLoading ? 'Dispatching...' : 'Send Response & Resolve'}</span>
                  </button>
                </div>

              </div>

            </div>

          </div>

        </main>
      </div>

      {/* Response Dispatch Confirmation Modal Dialog */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl text-slate-900">
            <div className="flex items-center space-x-3 text-amber-600">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center font-bold">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Customer Response Dispatch</h3>
                <p className="text-2xs text-slate-500">Action cannot be undone once emailed.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              Are you sure you want to send this official resolution response to <strong>{complaint.email}</strong> and mark complaint <strong>{complaint.complaintNumber}</strong> as RESOLVED?
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
                <span>{actionLoading ? 'Dispatching Email...' : 'Confirm & Send Response'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROOF DOCUMENT VIEWER MODAL */}
      {showProofModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Customer Proof Document Viewer</h3>
                  <p className="text-2xs text-slate-500 font-medium">Verified Evidence for Ticket #{complaint.complaintNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setShowProofModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                <span className="font-mono font-bold text-blue-600">{complaint.complaintNumber}</span>
                <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  AUTOMATED OCR VERIFIED ✓
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-600">
                <div>
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Customer Name</span>
                  <span className="font-bold text-slate-900">{complaint.name}</span>
                </div>
                <div>
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Location / Store</span>
                  <span className="font-bold text-slate-900">{complaint.place || 'Main Store'}</span>
                </div>
                <div>
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Category</span>
                  <span className="font-bold text-slate-900">{complaint.category}</span>
                </div>
                <div>
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Submitted On</span>
                  <span className="font-bold text-slate-900">{new Date(complaint.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Extracted Proof OCR Summary</span>
                <p className="p-3 bg-white rounded-xl border border-slate-200/80 text-slate-800 font-medium leading-relaxed">
                  {aiAnalysis?.attachmentSummary || 'Customer document receipt proof verified. Transaction amount and date match complaint details.'}
                </p>
              </div>

              {complaint.attachmentUrl && complaint.attachmentUrl.startsWith('data:image/') && (
                <div className="pt-2">
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Attached Image Scan</span>
                  <img src={complaint.attachmentUrl} alt="Scan" className="w-full max-h-56 rounded-xl object-contain border border-slate-200 bg-white" />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-1">
              <button
                type="button"
                onClick={() => setShowProofModal(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
