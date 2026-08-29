import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  HelpCircle,
  Layers,
  Sparkles
} from 'lucide-react';

export function StatusBadge({ status, className = '' }) {
  const configs = {
    'SUBMITTED': { label: 'Submitted', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', icon: Clock },
    'VERIFIED': { label: 'Email Verified', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: CheckCircle2 },
    'AI_ANALYZING': { label: 'AI Analyzing', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: Sparkles },
    'AI_ANALYZED': { label: 'Under Review', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: Layers },
    'IN_PROGRESS': { label: 'In Progress', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', icon: Zap },
    'WAITING_FOR_DEPARTMENT': { label: 'Department Review', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: Clock },
    'READY_FOR_USER_RESPONSE': { label: 'Action Taken', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', icon: CheckCircle2 },
    'ACTION_TAKEN': { label: 'Action Taken', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', icon: CheckCircle2 },
    'RESOLVED': { label: 'Resolved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: ShieldCheck },
    'REJECTED': { label: 'Closed', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: AlertCircle }
  };

  const config = configs[status] || { label: status || 'Pending', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', icon: HelpCircle };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border} ${className}`}>
      <Icon className="w-3.5 h-3.5 mr-1.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}

export function CategoryBadge({ category }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      {category || 'General'}
    </span>
  );
}
