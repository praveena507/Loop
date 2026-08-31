import React from 'react';
import { 
  ArrowRight, 
  ExternalLink, 
  FileEdit, 
  Cpu, 
  UserCheck, 
  Search, 
  Building2, 
  BellRing, 
  MessageSquare,
  Shield,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export default function Hero({ onNavigatePortal }) {
  const workflowNodes = [
    {
      step: '01',
      title: 'Complaint Raised',
      desc: 'User registers grievance with details',
      icon: FileEdit,
      accent: 'text-blue-400',
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10'
    },
    {
      step: '02',
      title: 'AI Analysis',
      desc: 'Summarization & category scoring',
      icon: Cpu,
      accent: 'text-indigo-400',
      border: 'border-indigo-500/30',
      bg: 'bg-indigo-500/10'
    },
    {
      step: '03',
      title: 'Admin Assignment',
      desc: 'Workload-balanced distribution',
      icon: UserCheck,
      accent: 'text-sky-400',
      border: 'border-sky-500/30',
      bg: 'bg-sky-500/10'
    },
    {
      step: '04',
      title: 'Analyst Investigation',
      desc: 'Fact check & policy verification',
      icon: Search,
      accent: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10'
    },
    {
      step: '05',
      title: 'Dept Resolution',
      desc: 'Remediation & evidence upload',
      icon: Building2,
      accent: 'text-purple-400',
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/10'
    },
    {
      step: '06',
      title: 'User Notification',
      desc: 'Verified email & tracker update',
      icon: BellRing,
      accent: 'text-teal-400',
      border: 'border-teal-500/30',
      bg: 'bg-teal-500/10'
    },
    {
      step: '07',
      title: 'Feedback',
      desc: 'Satisfaction rating & closure',
      icon: MessageSquare,
      accent: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10'
    }
  ];

  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-radial-gradient">
      
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Tag */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/70 text-slate-300 text-xs font-medium backdrop-blur-md shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Centralized Complaint Lifecycle & Resolution Architecture</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            One Platform. Every Complaint.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
              A Clear Resolution.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            LOOP connects users, administrators, analysts, and concerned departments through a structured complaint resolution workflow.
          </p>

          {/* Dual CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <button
              onClick={() => onNavigatePortal('USER_PORTAL')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-200 active:scale-[0.98] border border-blue-400/30 group"
            >
              <span>Access User Portal</span>
              <ExternalLink className="w-4 h-4 text-blue-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigatePortal('ADMIN_ANALYST_PORTAL')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-semibold text-base shadow-lg shadow-black/40 hover:shadow-slate-800/20 transition-all duration-200 active:scale-[0.98] border border-slate-700 hover:border-slate-600 group"
            >
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Admin & Analyst Portal</span>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Quick Sub-label */}
          <div className="mt-4 flex flex-col items-center justify-center gap-1.5">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct redirection to deployed dedicated production workspaces</span>
            </p>
            <span className="text-2xs font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-xs">
              ⚡ Evaluator Pass Active: Direct Access with Zero Login Barrier
            </span>
          </div>
        </div>


        {/* Workflow Visual Representation */}
        <div className="mt-16 sm:mt-20">
          <div className="text-center mb-6">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-slate-400">
              End-to-End Governance Lifecycle
            </h2>
          </div>

          <div className="glass-card rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-800/90 overflow-x-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 min-w-[700px] lg:min-w-0">
              {workflowNodes.map((node, index) => {
                const IconComponent = node.icon;
                return (
                  <div
                    key={node.step}
                    className="relative flex flex-col p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors group"
                  >
                    {/* Step number badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs text-slate-500 font-bold">
                        {node.step}
                      </span>
                      <div className={`p-2 rounded-lg ${node.bg} ${node.border} border`}>
                        <IconComponent className={`w-4 h-4 ${node.accent}`} />
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                      {node.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {node.desc}
                    </p>

                    {/* Step Connector Arrow for Large Screens */}
                    {index < workflowNodes.length - 1 && (
                      <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 text-slate-600 pointer-events-none">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
