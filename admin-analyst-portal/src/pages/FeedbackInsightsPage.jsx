import React, { useState, useEffect } from 'react';
import { StaffHeader } from '../components/StaffHeader';
import { StaffSidebar } from '../components/StaffSidebar';
import { 
  MessageSquareHeart, 
  Star, 
  ThumbsUp, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  Filter, 
  RefreshCw 
} from 'lucide-react';

export function FeedbackInsightsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('loop_staff_token');
      const res = await fetch('/api/feedback/insights', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.error || 'Failed to load feedback insights.');
      }
    } catch (err) {
      console.error('Error fetching feedback insights:', err);
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <StaffSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <StaffHeader />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Banner */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                <MessageSquareHeart className="w-4 h-4" />
                <span>Executive Complaint Governance</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Feedback & Quality Insights</h1>
              <p className="text-slate-400 text-sm mt-1">
                Real customer feedback metrics, department resolution performance, and Gemini AI process improvement intelligence.
              </p>
            </div>

            <button
              onClick={fetchInsights}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all border border-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">Calculating quality insights and aggregating database metrics...</div>
          ) : error ? (
            <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-6 rounded-2xl text-center space-y-2">
              <AlertTriangle className="w-8 h-8 mx-auto" />
              <div className="font-semibold">{error}</div>
            </div>
          ) : (
            <>
              {/* Executive Metrics Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Average Customer Rating</span>
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white flex items-baseline space-x-1">
                    <span>{data.metrics.averageRating}</span>
                    <span className="text-sm font-normal text-slate-400">/ 5.0</span>
                  </div>
                  <div className="text-2xs text-slate-500">Based on {data.metrics.totalFeedback} verified user submissions</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Resolution Success Rate</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-400">
                    {data.metrics.resolutionSuccessRate}%
                  </div>
                  <div className="text-2xs text-slate-500">Complaints marked as Fully Resolved by users</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Total Feedback Entries</span>
                    <MessageSquareHeart className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">
                    {data.metrics.totalFeedback}
                  </div>
                  <div className="text-2xs text-slate-500">Dispatched post-resolution surveys</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Overall Sentiment</span>
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-bold text-white uppercase tracking-tight">
                    {data.aiAnalysis.overallSentiment}
                  </div>
                  <div className="text-2xs text-slate-500">AI evaluated quality indicator</div>
                </div>
              </div>

              {/* Gemini AI Process Improvement Intelligence Panel */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl space-y-5">
                <div className="flex items-center space-x-2 text-blue-400 border-b border-slate-800/80 pb-4">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-bold text-white tracking-tight">Gemini AI Feedback Intelligence</h2>
                  <span className="text-3xs font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800 uppercase font-bold">
                    Aggregated Analysis
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
                    <h3 className="font-semibold text-slate-200 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      <span>Common Complaint & Feedback Themes</span>
                    </h3>
                    <ul className="space-y-1.5 text-slate-400 pl-3 list-disc">
                      {data.aiAnalysis.commonThemes.map((theme, i) => (
                        <li key={i}>{theme}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
                    <h3 className="font-semibold text-slate-200 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span>Customer Dissatisfaction Reasons</span>
                    </h3>
                    <ul className="space-y-1.5 text-slate-400 pl-3 list-disc">
                      {data.aiAnalysis.dissatisfactionReasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
                    <h3 className="font-semibold text-slate-200 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>Recommended Process Improvements</span>
                    </h3>
                    <ul className="space-y-1.5 text-slate-400 pl-3 list-disc">
                      {data.aiAnalysis.processImprovementRecommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Department Performance Metrics Grid */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <h2 className="text-base font-bold text-white">Department Resolution Performance</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Department Name</th>
                        <th className="p-3">Cases Received</th>
                        <th className="p-3">Reports Completed</th>
                        <th className="p-3">Pending Investigation</th>
                        <th className="p-3">P1 High Priority</th>
                        <th className="p-3">Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {data.metrics.departmentMetrics.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-slate-500">No department performance data recorded yet.</td>
                        </tr>
                      ) : (
                        data.metrics.departmentMetrics.map((dept, idx) => {
                          const rate = dept.totalRequests > 0 ? Math.round((dept.completedRequests / dept.totalRequests) * 100) : 0;
                          return (
                            <tr key={idx} className="hover:bg-slate-950/40">
                              <td className="p-3 font-semibold text-white">{dept.departmentName}</td>
                              <td className="p-3 font-mono">{dept.totalRequests}</td>
                              <td className="p-3 font-mono text-emerald-400">{dept.completedRequests}</td>
                              <td className="p-3 font-mono text-amber-400">{dept.pendingRequests}</td>
                              <td className="p-3 font-mono text-rose-400">{dept.p1Count}</td>
                              <td className="p-3 font-semibold">
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${rate}%` }}></div>
                                  </div>
                                  <span>{rate}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Verified User Submissions Table */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h2 className="text-base font-bold text-white">Verified Customer Feedback Log</h2>

                {data.feedback.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">No user feedback submitted yet. Feedback is collected after complaint resolution.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                        <tr>
                          <th className="p-3">Complaint #</th>
                          <th className="p-3">User Email</th>
                          <th className="p-3">Rating</th>
                          <th className="p-3">Issue Resolved?</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">User Comments</th>
                          <th className="p-3">Submitted Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {data.feedback.map((fb) => (
                          <tr key={fb.id} className="hover:bg-slate-950/40">
                            <td className="p-3 font-mono font-bold text-blue-400">{fb.complaintNumber}</td>
                            <td className="p-3 text-slate-400">{fb.userEmail}</td>
                            <td className="p-3 font-semibold">
                              <div className="flex items-center space-x-1 text-amber-400">
                                <span>{fb.rating}</span>
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-2xs font-extrabold uppercase ${
                                fb.resolvedSatisfaction === 'Yes' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                                fb.resolvedSatisfaction === 'Partially' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                'bg-rose-950 text-rose-300 border border-rose-800'
                              }`}>
                                {fb.resolvedSatisfaction}
                              </span>
                            </td>
                            <td className="p-3 text-slate-400">{fb.category}</td>
                            <td className="p-3 text-slate-300 max-w-xs truncate">{fb.feedbackText || 'No comments provided.'}</td>
                            <td className="p-3 text-slate-500">{new Date(fb.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
