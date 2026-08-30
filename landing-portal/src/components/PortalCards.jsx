import React from 'react';
import { 
  UserCheck, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  Lock, 
  FilePlus, 
  MailCheck, 
  Activity, 
  Sparkles,
  Users,
  Briefcase,
  GitPullRequest
} from 'lucide-react';

export default function PortalCards({ onNavigatePortal }) {
  return (
    <section id="portals" className="py-20 md:py-28 bg-[#090d16] relative">
      
      {/* Decorative subtle background accents */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>ROLE-BASED WORKSPACES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Choose Your Portal
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Select the appropriate workspace to continue. Each portal operates as an independent, secure environment tailored for specific stakeholder duties.
          </p>
        </div>

        {/* The Two Primary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* CARD 1: USER PORTAL */}
          <div className="glass-card glass-card-hover rounded-3xl p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border border-slate-800 hover:border-blue-500/60 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-xl group">
            
            {/* Top Badge */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full">
                Public / Client Gateway
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Deployed
              </span>
            </div>

            <div>
              {/* Icon & Title / Profile Trigger */}
              <button
                type="button"
                onClick={() => onNavigatePortal('USER_PORTAL')}
                className="flex items-center gap-4 mb-4 text-left w-full group/title focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl p-1 -m-1 transition-colors hover:bg-slate-800/30"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover/title:scale-105 group-hover/title:bg-blue-600/25 transition-all shrink-0">
                  <UserCheck className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight group-hover/title:text-blue-300 transition-colors flex items-center gap-2">
                    <span>User Portal</span>
                    <ExternalLink className="w-4 h-4 opacity-50 group-hover/title:opacity-100 transition-opacity text-blue-400" />
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    For Citizens, Clients & Grievance Filers
                  </p>
                </div>
              </button>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
                Submit complaints, verify your email, monitor complaint status, receive resolution updates, and provide feedback.
              </p>

              {/* Feature Checklist */}
              <div className="space-y-3.5 mb-8 pb-8 border-b border-slate-800/80">
                <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                  Core Portal Capabilities
                </div>
                {[
                  'Submit a complaint with categories & attachments',
                  'One-Time Password (OTP) email verification',
                  'Real-time complaint lifecycle tracking',
                  'Receive structured resolution reports',
                  'Submit satisfaction feedback & ratings'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div>
              <button
                onClick={() => onNavigatePortal('USER_PORTAL')}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-200 active:scale-[0.99] border border-blue-400/30 group/btn"
              >
                <span>Enter User Portal</span>
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
              <p className="text-center text-[11px] text-slate-500 mt-2.5">
                Opens external deployed User Portal application
              </p>
            </div>

          </div>

          {/* CARD 2: ADMIN & ANALYST PORTAL */}
          <div className="glass-card glass-card-hover rounded-3xl p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border border-slate-800 hover:border-indigo-500/60 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-xl group">
            
            {/* Top Badge */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full">
                Operations / Staff Gateway
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Deployed
              </span>
            </div>

            <div>
              {/* Icon & Title / Profile Trigger */}
              <button
                type="button"
                onClick={() => onNavigatePortal('ADMIN_ANALYST_PORTAL')}
                className="flex items-center gap-4 mb-4 text-left w-full group/title focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl p-1 -m-1 transition-colors hover:bg-slate-800/30"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover/title:scale-105 group-hover/title:bg-indigo-600/25 transition-all shrink-0">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight group-hover/title:text-indigo-300 transition-colors flex items-center gap-2">
                    <span>Admin & Analyst Portal</span>
                    <ExternalLink className="w-4 h-4 opacity-50 group-hover/title:opacity-100 transition-opacity text-indigo-400" />
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    For System Admins, Analysts & Departments
                  </p>
                </div>
              </button>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
                Manage complaints, assign cases based on workload, investigate issues, coordinate with departments, and complete resolutions.
              </p>

              {/* Feature Checklist */}
              <div className="space-y-3.5 mb-8 pb-8 border-b border-slate-800/80">
                <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                  Core Portal Capabilities
                </div>
                {[
                  'Admin central complaint inbox & analytics',
                  'Intelligent workload-based analyst assignment',
                  'Deep case investigation & evidence review',
                  'Cross-department task routing & coordination',
                  'Comprehensive resolution sign-off & publishing'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div>
              <button
                onClick={() => onNavigatePortal('ADMIN_ANALYST_PORTAL')}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-base shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all duration-200 active:scale-[0.99] border border-indigo-400/30 group/btn"
              >
                <span>Enter Admin & Analyst Portal</span>
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
              <p className="text-center text-[11px] text-slate-500 mt-2.5">
                Opens external deployed Admin & Analyst Portal application
              </p>
            </div>

          </div>

        </div>

        {/* Isolation Guarantee Footnote */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-400 max-w-2xl mx-auto">
            Both portals operate as separate, secure workspaces with dedicated authentication and role-based access boundaries.
          </p>
        </div>

      </div>
    </section>
  );
}
