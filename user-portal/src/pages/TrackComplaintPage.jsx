import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { api } from '../services/api';
import { Search, AlertCircle, CheckCircle2, Clock, ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../components/Badge';

export function TrackComplaintPage() {
  const [searchParams] = useSearchParams();
  const routeParams = useParams();

  const urlId = searchParams.get('id') || routeParams?.id || '';
  const urlEmail = searchParams.get('email') || '';

  const [complaintNumber, setComplaintNumber] = useState(urlId);
  const [email, setEmail] = useState(urlEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trackingResult, setTrackingResult] = useState(null);

  // Auto query if params provided in URL
  useEffect(() => {
    if (urlId && urlEmail) {
      fetchTracking(urlId, urlEmail);
    }
  }, [urlId, urlEmail]);

  const fetchTracking = async (idVal, emailVal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.trackComplaint(idVal, emailVal);
      if (res.success) {
        setTrackingResult(res.complaint);
      } else {
        setError(res.error || 'No matching complaint found. Please verify Complaint ID and Email.');
        setTrackingResult(null);
      }
    } catch (err) {
      setError(err.message || 'No matching complaint found. Please verify Complaint ID and Email.');
      setTrackingResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!complaintNumber.trim() || !email.trim()) {
      setError('Please enter both Complaint ID and Email Address.');
      return;
    }
    fetchTracking(complaintNumber.trim(), email.trim());
  };

  // Helper to build timeline steps safely without exposing internal staff notes
  const getTimelineSteps = (complaint) => {
    if (!complaint) return [];

    const statusOrder = {
      'SUBMITTED': 1,
      'VERIFIED': 2,
      'AI_ANALYZING': 3,
      'AI_ANALYZED': 3,
      'IN_PROGRESS': 4,
      'WAITING_FOR_DEPARTMENT': 4,
      'READY_FOR_USER_RESPONSE': 4,
      'ACTION_TAKEN': 4,
      'RESOLVED': 5,
      'REJECTED': 5
    };

    const currentLevel = statusOrder[complaint.status] || 1;

    return [
      { key: 'SUBMITTED', title: 'Complaint Submitted & Received', completed: currentLevel >= 1 },
      { key: 'VERIFIED', title: 'Email Verified', completed: currentLevel >= 2 },
      { key: 'AI_ANALYSIS', title: 'Automated Priority Assessment', completed: currentLevel >= 3 },
      { key: 'IN_PROGRESS', title: 'Support Investigation & Review', completed: currentLevel >= 4 },
      { key: 'RESOLVED', title: complaint.status === 'REJECTED' ? 'Complaint Closed' : 'Resolution Issued & Delivered', completed: currentLevel >= 5 }
    ];
  };

  const finalResponse = trackingResult ? (trackingResult.response || trackingResult.finalResponse) : null;
  const timelineSteps = trackingResult ? (trackingResult.timeline || getTimelineSteps(trackingResult)) : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Track Complaint Status</h1>
            <p className="mt-2 text-sm text-slate-600">
              Enter your assigned Complaint ID and verified email address to check real-time progress.
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-6 mb-8">
            {error && (
              <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Complaint ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g. LOOP-2026-849201"
                  required
                  value={complaintNumber}
                  onChange={(e) => setComplaintNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Verified Email *
                </label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>{loading ? 'Searching...' : 'Track'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Tracking Result View */}
          {trackingResult && (
            <div className="space-y-6">
              
              {/* Complaint Overview Card */}
              <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-100 gap-2">
                  <div>
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Complaint Ticket</span>
                    <h2 className="text-xl font-mono font-extrabold text-blue-600 tracking-wider">
                      {trackingResult.complaintNumber}
                    </h2>
                  </div>
                  <StatusBadge status={trackingResult.status} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Category</span>
                    <span className="font-bold text-slate-800">{trackingResult.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Location / Place</span>
                    <span className="font-bold text-slate-800">{trackingResult.place}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Submitted Date</span>
                    <span className="font-bold text-slate-800">{trackingResult.createdAt ? new Date(trackingResult.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block mb-1">Reason / Subject:</span>
                  <p className="text-sm text-slate-800 font-medium">{trackingResult.reason}</p>
                </div>
              </div>

              {/* Resolution Timeline */}
              <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-6">
                <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center">
                  <Clock className="w-5 h-5 text-blue-600 mr-2" />
                  Resolution Progress Timeline
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {timelineSteps.map((step) => (
                    <div key={step.key} className="relative flex items-center space-x-4">
                      <div
                        className={`absolute -left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                          step.completed
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs shadow-blue-500/30'
                            : 'bg-white border-slate-300 text-slate-400'
                        }`}
                      >
                        {step.completed ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>}
                      </div>

                      <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                        <span className={`text-xs font-bold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.title}
                        </span>
                        {step.completed && (
                          <span className="text-2xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Official Customer Response (If Resolved) */}
              {finalResponse && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-6 h-6 text-emerald-600" />
                      <div>
                        <h4 className="text-base font-bold text-slate-900">Official Resolution Response</h4>
                        <p className="text-xs text-emerald-800 font-medium">Issued by: {finalResponse.senderLabel || 'LOOP Support Team'}</p>
                      </div>
                    </div>
                    {finalResponse.sentAt && (
                      <span className="text-xs font-bold text-slate-500">
                        {new Date(finalResponse.sentAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="p-4 bg-white/90 rounded-xl border border-emerald-100 text-sm text-slate-800 leading-relaxed font-medium">
                    {finalResponse.responseText}
                  </div>
                </div>
              )}

              {/* User Feedback Module (If Resolved) */}
              {trackingResult.status === 'RESOLVED' && (
                <UserFeedbackForm complaintNumber={trackingResult.complaintNumber} email={email} />
              )}

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

function UserFeedbackForm({ complaintNumber, email }) {
  const [rating, setRating] = useState(5);
  const [resolvedSatisfaction, setResolvedSatisfaction] = useState('Yes');
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState(null);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      const res = await api.submitFeedback({
        complaintNumber,
        userEmail: email,
        rating,
        resolvedSatisfaction,
        feedbackText
      });
      if (res.success) {
        setSubmitted(true);
      } else {
        setErr(res.error || 'Failed to submit feedback.');
      }
    } catch (e) {
      setErr('Error submitting feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
        <h4 className="text-base font-bold text-emerald-900">Thank You for Your Feedback!</h4>
        <p className="text-xs text-emerald-700">Your feedback has been recorded to ensure continuous service quality.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-6 space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h4 className="text-base font-bold text-slate-900">How Was Your Complaint Handled?</h4>
        <p className="text-xs text-slate-500">Please take a moment to evaluate your resolution experience.</p>
      </div>

      {err && (
        <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
          {err}
        </div>
      )}

      <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-2">Overall Satisfaction Rating (1 to 5 Stars)</label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl transition-transform hover:scale-110 cursor-pointer ${
                  star <= rating ? 'text-amber-400' : 'text-slate-300'
                }`}
              >
                ★
              </button>
            ))}
            <span className="font-extrabold text-slate-800 text-sm ml-2">{rating} / 5 Stars</span>
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-2">Was your issue resolved?</label>
          <div className="flex items-center space-x-3">
            {['Yes', 'Partially', 'No'].map((opt) => (
              <label key={opt} className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl border font-bold cursor-pointer transition-all ${
                resolvedSatisfaction === opt ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <input
                  type="radio"
                  name="resolvedSatisfaction"
                  value={opt}
                  checked={resolvedSatisfaction === opt}
                  onChange={() => setResolvedSatisfaction(opt)}
                  className="hidden"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Additional Feedback (Optional)</label>
          <textarea
            rows={3}
            placeholder="Tell us what worked well or what we can improve..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          <span>{submitting ? 'Submitting Feedback...' : 'Submit Feedback'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
