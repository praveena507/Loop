import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Zap,
  HelpCircle,
  Smile,
  Meh,
  Frown,
  Layers,
  Sparkles
} from 'lucide-react';

export function StatusBadge({ status, className = '' }) {
  const configs = {
    'SUBMITTED': { label: 'Submitted', bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700', icon: Clock },
    'VERIFIED': { label: 'Email Verified', bg: 'bg-blue-950', text: 'text-blue-300', border: 'border-blue-800', icon: CheckCircle2 },
    'AI_ANALYZING': { label: 'AI Analyzing', bg: 'bg-indigo-950', text: 'text-indigo-300', border: 'border-indigo-800', icon: Sparkles },
    'AI_ANALYZED': { label: 'Awaiting Action', bg: 'bg-purple-950', text: 'text-purple-300', border: 'border-purple-800', icon: Layers },
    'IN_PROGRESS': { label: 'In Progress', bg: 'bg-sky-950', text: 'text-sky-300', border: 'border-sky-800', icon: Zap },
    'WAITING_FOR_DEPARTMENT': { label: 'Waiting for Dept', bg: 'bg-amber-950', text: 'text-amber-300', border: 'border-amber-800', icon: Clock },
    'READY_FOR_USER_RESPONSE': { label: 'Ready for Review', bg: 'bg-teal-950', text: 'text-teal-300', border: 'border-teal-800', icon: CheckCircle2 },
    'ACTION_TAKEN': { label: 'Action Recorded', bg: 'bg-cyan-950', text: 'text-cyan-300', border: 'border-cyan-800', icon: CheckCircle2 },
    'ESCALATED': { label: 'Escalated', bg: 'bg-rose-950', text: 'text-rose-300', border: 'border-rose-800', icon: AlertTriangle },
    'RESOLVED': { label: 'Resolved', bg: 'bg-emerald-950', text: 'text-emerald-300', border: 'border-emerald-800', icon: ShieldCheck },
    'REJECTED': { label: 'Closed / Rejected', bg: 'bg-rose-950', text: 'text-rose-400', border: 'border-rose-900', icon: AlertCircle }
  };

  const config = configs[status] || { label: status || 'Unknown', bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700', icon: HelpCircle };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border} ${className}`}>
      <Icon className="w-3.5 h-3.5 mr-1.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}

export function PriorityBadge({ priority, className = '' }) {
  const configs = {
    'CRITICAL': { label: 'Critical (P1)', bg: 'bg-rose-950', text: 'text-rose-300', border: 'border-rose-800', icon: Flame },
    'P1': { label: 'Critical (P1)', bg: 'bg-rose-950', text: 'text-rose-300', border: 'border-rose-800', icon: Flame },
    'HIGH': { label: 'High (P2)', bg: 'bg-orange-950', text: 'text-orange-300', border: 'border-orange-800', icon: AlertTriangle },
    'P2': { label: 'High (P2)', bg: 'bg-orange-950', text: 'text-orange-300', border: 'border-orange-800', icon: AlertTriangle },
    'MEDIUM': { label: 'Medium (P3)', bg: 'bg-amber-950', text: 'text-amber-300', border: 'border-amber-800', icon: Clock },
    'P3': { label: 'Medium (P3)', bg: 'bg-amber-950', text: 'text-amber-300', border: 'border-amber-800', icon: Clock },
    'LOW': { label: 'Low (P4)', bg: 'bg-blue-950', text: 'text-blue-300', border: 'border-blue-800', icon: Zap },
    'P4': { label: 'Low (P4)', bg: 'bg-blue-950', text: 'text-blue-300', border: 'border-blue-800', icon: Zap }
  };

  const config = configs[priority?.toUpperCase()] || { label: priority || 'Medium', bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700', icon: Clock };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-extrabold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border} ${className}`}>
      <Icon className="w-3 h-3 mr-1 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}

export function SentimentBadge({ sentiment, score, className = '' }) {
  const configs = {
    'NEGATIVE': { label: 'Negative', bg: 'bg-rose-950', text: 'text-rose-300', border: 'border-rose-800', icon: Frown },
    'NEUTRAL': { label: 'Neutral', bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700', icon: Meh },
    'POSITIVE': { label: 'Positive', bg: 'bg-emerald-950', text: 'text-emerald-300', border: 'border-emerald-800', icon: Smile }
  };

  const config = configs[sentiment?.toUpperCase()] || { label: sentiment || 'Neutral', bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700', icon: Meh };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}>
      <Icon className="w-3 h-3 mr-1 shrink-0" />
      <span>{config.label} {score !== undefined && score !== null && `(${Math.round(score * 100)}%)`}</span>
    </span>
  );
}

export function CategoryBadge({ category }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
      {category || 'General'}
    </span>
  );
}
