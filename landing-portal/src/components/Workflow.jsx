import React from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Cpu, 
  UserPlus, 
  SearchCode, 
  Building, 
  MessageSquare,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export default function Workflow() {
  const steps = [
    {
      number: '01',
      title: 'Complaint Submission',
      role: 'Citizen / User',
      description: 'User submits complaint with required details, category selection, and optional supporting documentation.',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      number: '02',
      title: 'Verification',
      role: 'Security Gateway',
      description: 'User verifies their email via OTP before complaint submission is finalized, eliminating spam and invalid entries.',
      icon: ShieldCheck,
      color: 'from-cyan-500 to-teal-500'
    },
    {
      number: '03',
      title: 'AI Analysis',
      role: 'Decision-Support Engine',
      description: 'The backend AI analyzes the complaint text, summarizing key points, extracting sentiment, and assisting the administration.',
      icon: Cpu,
      color: 'from-indigo-500 to-blue-500'
    },
    {
      number: '04',
      title: 'Admin Assignment',
      role: 'System Administrator',
      description: 'The complaint reaches the administrator, who assigns it to an appropriate analyst based on current workload and responsibility.',
      icon: UserPlus,
      color: 'from-violet-500 to-indigo-500'
    },
    {
      number: '05',
      title: 'Analyst Investigation',
      role: 'Assigned Analyst',
      description: 'The assigned analyst thoroughly investigates the complaint and coordinates with the appropriate company department.',
      icon: SearchCode,
      color: 'from-amber-500 to-orange-500'
    },
    {
      number: '06',
      title: 'Department Resolution',
      role: 'Concerned Department & Analyst',
      description: 'The concerned department provides the required evidence, action, or remediation report. The analyst reviews and finalizes the resolution.',
      icon: Building,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      number: '07',
      title: 'User Communication & Feedback',
      role: 'User & System',
      description: 'The analyst communicates the verified resolution to the user. The user receives the update and provides satisfaction feedback.',
      icon: MessageSquare,
      color: 'from-blue-500 to-emerald-500'
    }
  ];

  return (
    <section id="workflow" className="py-20 md:py-28 bg-[#080c14] border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <span>RESOLVED IN 7 PHASES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            How LOOP Works
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            A transparent, auditable 7-step lifecycle ensuring that every grievance is accounted for, investigated, and properly resolved.
          </p>
        </div>

        {/* 7-Step Workflow Grid */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {steps.map((step, idx) => {
            const IconComp = step.icon;
            return (
              <div
                key={step.number}
                className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 group"
              >
                {/* Number Badge */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-lg text-white group-hover:border-blue-500/50 transition-colors shadow-inner">
                    {step.number}
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-blue-400">
                    <IconComp className="w-5 h-5" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                      {step.title}
                    </h3>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {step.role}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Governance & Human-in-the-Loop Callout */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900/60 border border-blue-800/40 p-6 flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                Human-in-the-Loop Governance Notice
              </h4>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                AI in LOOP functions strictly as an <strong>analysis and decision-support component</strong> to assist case triage. Authorized human administrators, specialized analysts, and concerned departmental officers remain fully responsible for case investigations, root-cause remediation, and finalized resolutions.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
