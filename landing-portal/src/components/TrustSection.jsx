import React from 'react';
import { ShieldCheck, Lock, Eye, MailCheck, Database, History, FileCheck } from 'lucide-react';

export default function TrustSection() {
  const trustPoints = [
    {
      title: 'Role-Based Access',
      desc: 'Users, administrators, and analysts are strictly partitioned into distinct authorization scopes, preventing unauthorized operational access.',
      icon: Lock
    },
    {
      title: 'Controlled Complaint Visibility',
      desc: 'Sensitive complaint records and departmental correspondence are accessible only to authorized handling personnel and the complainant.',
      icon: Eye
    },
    {
      title: 'Verified User Communication',
      desc: 'OTP-verified email communication confirms authentic requester identities and prevents fraudulent or automated ticket spam.',
      icon: MailCheck
    },
    {
      title: 'Centralized Case Tracking',
      desc: 'Unified state machine ensures a single, definitive source of truth across submission, investigation, and resolution steps.',
      icon: Database
    },
    {
      title: 'Auditable Complaint Lifecycle',
      desc: 'Every administrative reassignment, departmental handoff, and analyst note creates a verifiable timeline of resolution actions.',
      icon: History
    }
  ];

  return (
    <section id="security" className="py-20 md:py-28 bg-[#080c14] border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>OPERATIONAL INTEGRITY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Structured. Secure. Accountable.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Engineered with strict governance principles and transparent workflows to uphold public trust and organizational compliance.
          </p>
        </div>

        {/* 5 Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {trustPoints.map((point, idx) => {
            const IconComponent = point.icon;
            return (
              <div
                key={point.title}
                className={`glass-card rounded-2xl p-7 border border-slate-800/80 hover:border-emerald-500/40 transition-all ${
                  idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-5">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {point.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {point.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
