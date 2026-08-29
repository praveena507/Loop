import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { api } from '../services/api';
import { useUserAuth } from '../context/UserAuthContext';
import { Star, CheckCircle2, AlertCircle, ArrowRight, MessageSquareHeart } from 'lucide-react';

export function UserFeedbackPage() {
  const [searchParams] = useSearchParams();
  const { user } = useUserAuth();
  const navigate = useNavigate();

  const [complaintNumber, setComplaintNumber] = useState(searchParams.get('id') || '');
  const [userEmail, setUserEmail] = useState(searchParams.get('email') || user?.email || '');
  const [rating, setRating] = useState(5);
  const [resolvedSatisfaction, setResolvedSatisfaction] = useState('Yes');
  const [feedbackText, setFeedbackText] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaintNumber.trim() || !userEmail.trim()) {
      setError('Please provide both Complaint ID and your Email Address.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.submitFeedback({
        complaintNumber: complaintNumber.trim(),
        userEmail: userEmail.trim(),
        rating,
        resolvedSatisfaction,
        feedbackText: feedbackText.trim()
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.error || 'Failed to submit feedback.');
      }
    } catch (err) {
      setError(err.message || 'Error submitting feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-14 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-lg w-full">
          
          <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-8">
            
            {submitted ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">Thank You for Your Feedback!</h2>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your feedback on ticket <strong className="font-mono text-blue-600">{complaintNumber}</strong> has been saved. We appreciate your assistance in helping us improve customer service quality.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100">
                    <MessageSquareHeart className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Resolution Feedback</h1>
                  <p className="mt-1 text-xs text-slate-500">
                    Share your experience on how your grievance was handled.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>{error}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Complaint Ticket ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. LOOP-2026-849201"
                      value={complaintNumber}
                      onChange={(e) => setComplaintNumber(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Verified Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Resolution Satisfaction Rating (1 to 5 Stars) *
                    </label>
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
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Was your issue resolved? *
                    </label>
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
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Additional Comments / Feedback
                    </label>
                    <textarea
                      rows={3}
                      placeholder="What went well or what could we do better?"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{loading ? 'Submitting...' : 'Submit Resolution Feedback'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
