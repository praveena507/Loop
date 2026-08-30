import React from 'react';
import { ArrowRight, ExternalLink, Shield, UserCheck, Layers } from 'lucide-react';

export default function FinalCTA({ onNavigatePortal }) {
  return (
    <section className="py-20 md:py-24 bg-[#090d16] border-t border-slate-900 relative overflow-hidden">
      
      {/* Background Accent Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="glass-card rounded-3xl p-8 sm:p-12 md:p-16 border border-slate-800 text-center shadow-2xl relative overflow-hidden">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <Layers className="w-3.5 h-3.5" />
            <span>DIRECT DEPLOYMENT ACCESS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Ready to Access LOOP?
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Choose your workspace and continue to the LOOP platform.
          </p>

          {/* Dual Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={() => onNavigatePortal('USER_PORTAL')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-200 active:scale-[0.98] border border-blue-400/30 group"
            >
              <UserCheck className="w-5 h-5 text-blue-200" />
              <span>User Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigatePortal('ADMIN_ANALYST_PORTAL')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-lg shadow-black/40 hover:shadow-slate-800/20 transition-all duration-200 active:scale-[0.98] border border-slate-700 hover:border-slate-600 group"
            >
              <Shield className="w-5 h-5 text-indigo-400" />
              <span>Admin & Analyst Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
