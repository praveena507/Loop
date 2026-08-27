import React from 'react';

export function StatusBadge({ status }) {
  const map = {
    SUBMITTED: { label: 'Submitted', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
    EMAIL_VERIFIED: { label: 'Verified', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    AI_ANALYZING: { label: 'AI Analyzing', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    AI_ANALYZED: { label: 'AI Analyzed', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    ASSIGNED: { label: 'Assigned', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    UNDER_REVIEW: { label: 'Under Review', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    IN_PROGRESS: { label: 'In Progress', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    WAITING_FOR_DEPARTMENT: { label: 'Awaiting Dept Response', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
    READY_FOR_ANALYST_REVIEW: { label: 'Dept Report Received', bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-300' },
    READY_FOR_USER_RESPONSE: { label: 'Ready for User Response', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300' },
    ACTION_TAKEN: { label: 'Action Taken', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    RESOLVED: { label: 'Resolved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    ESCALATED: { label: 'Escalated', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    RESPONSE_SENT: { label: 'Response Sent', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    CLOSED: { label: 'Closed', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' }
  };

  const style = map[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {style.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const map = {
    CRITICAL: { label: 'Critical', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    HIGH: { label: 'High', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    MEDIUM: { label: 'Medium', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    LOW: { label: 'Low', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' }
  };

  const style = map[priority?.toUpperCase()] || { label: priority || 'Medium', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      {style.label}
    </span>
  );
}

export function SentimentBadge({ sentiment, score }) {
  const map = {
    NEGATIVE: { label: 'Negative', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    NEUTRAL: { label: 'Neutral', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
    POSITIVE: { label: 'Positive', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
  };

  const style = map[sentiment?.toUpperCase()] || { label: sentiment || 'Neutral', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      {style.label} {score ? `(${(score * 100).toFixed(0)}%)` : ''}
    </span>
  );
}
