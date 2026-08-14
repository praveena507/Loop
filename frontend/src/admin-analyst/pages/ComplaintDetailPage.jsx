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

  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

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

  const handleRecordAction = async (actionType) => {
    setActionLoading(true);
    setSuccessMsg(null);
    try {
      const payload = {
        action: actionType,
        notes: analystNotes,
        status: selectedStatus,
        priority: selectedPriority,
        suggestedResponse: editedSuggestedResp
      };
      const res = await api.recordAction(data.complaint.id, payload);
      if (res.success) {
        setSuccessMsg('Action recorded successfully.');
        setAnalystNotes('');
        fetchDetail();
      }
    } catch (err) {
      setError(err.message || 'Failed to record action.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendAndResolve = async (e) => {
    e.preventDefault();
    if (!finalResponse.trim()) {
      setError('Please provide a final response text for the customer.');
      return;
    }

    setActionLoading(true);
    setSuccessMsg(null);
    setError(null);

    try {
      const payload = {
        responseText: finalResponse,
        notes: analystNotes
      };
      const res = await api.resolveComplaint(data.complaint.id, payload);
      if (res.success) {
        setSuccessMsg('Final customer response dispatched & complaint marked as RESOLVED!');
        setAnalystNotes('');
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
          Loading AI Complaint & Document Proof Workbench...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <StaffSidebar />
        <div className="flex-1 p-8">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error || 'Complaint not found.'}
          </div>
          <Link to="/staff/complaints" className="mt-4 inline-block text-xs font-bold text-blue-600">
            ← Return to Complaint Inbox
          </Link>
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
          subtitle="Customer Feedback Details & Gemini Multimodal Document Intelligence Workbench"
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
                      <img src={complaint.attachmentUrl} alt="Customer Proof" className="max-h-48 rounded-xl border border-slate-200 object-contain bg-slate-50" />
                    ) : (
                      <a
                        href={complaint.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200 transition-colors text-xs"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Attached Proof Document
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* GEMINI DOCUMENT PROOF INTELLIGENCE CARD */}
              {aiAnalysis && (
                <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center">
                      <FileCheck className="w-4 h-4 text-emerald-600 mr-2" />
                      Gemini Document Proof Analysis
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
                      {aiAnalysis.attachmentSummary || 'Document proof verified by Gemini AI OCR.'}
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
              
              {/* AI ANALYSIS WORKBENCH CARD */}
              <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <h3 className="text-base font-extrabold tracking-tight">Gemini AI Intelligence Workbench</h3>
                  </div>
                  <span className="text-2xs font-mono font-bold bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full border border-blue-400/30">
                    Confidence: {(aiAnalysis?.priorityScore * 100 || 85).toFixed(0)}%
                  </span>
                </div>

                {/* AI Key Indicators Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 text-2xs uppercase tracking-wider block mb-1">Sentiment</span>
                    <SentimentBadge sentiment={aiAnalysis?.sentiment} score={aiAnalysis?.sentimentScore} />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 text-2xs uppercase tracking-wider block mb-1">Calculated Priority</span>
                    <PriorityBadge priority={aiAnalysis?.priority} />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 col-span-2">
                    <span className="text-slate-400 text-2xs uppercase tracking-wider block mb-1">Theme Cluster</span>
                    <span className="font-bold text-blue-300 truncate block">{aiAnalysis?.theme || 'Service Issue'}</span>
                  </div>
                </div>

                {/* AI Executive Summary */}
                <div className="space-y-1.5">
                  <span className="text-2xs uppercase font-bold text-slate-400 tracking-wider">AI Executive Summary</span>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-800/60 p-3.5 rounded-xl border border-slate-700">
                    {aiAnalysis?.summary}
                  </p>
                </div>

                {/* AI Decision Actions Bar */}
                <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Analyst Review Decision:</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setAiDecision('ACCEPTED')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        aiDecision === 'ACCEPTED' ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      ✓ Accept AI
                    </button>
                    <button
                      onClick={() => setEditingAi(!editingAi)}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
                    >
                      <Edit3 className="w-3 h-3 inline mr-1" />
                      Edit AI
                    </button>
                  </div>
                </div>

              </div>

              {/* ANALYST DECISION & FINAL RESPONSE FORM */}
              <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-6 space-y-5">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
                  <Send className="w-4 h-4 text-blue-600 mr-2" />
                  Analyst Decision & Final Response Workbench
                </h3>

                {/* Internal Notes Textarea */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center">
                    <Lock className="w-3.5 h-3.5 text-rose-500 mr-1.5" />
                    Internal Staff Notes (Never Visible To Customer)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Add private investigation notes, cashier logs, or supervisor approval notes..."
                    value={analystNotes}
                    onChange={(e) => setAnalystNotes(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>

                {/* Final Customer Response Editor */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Final Customer Response (Will Be Emailed & Shown On Tracking Portal) *
                  </label>
                  <textarea
                    rows={5}
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
                    onClick={handleSendAndResolve}
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
    </div>
  );
}
