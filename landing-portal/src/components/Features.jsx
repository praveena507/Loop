import React from 'react';
import { 
  Cpu, 
  Users, 
  ShieldCheck, 
  Network, 
  Activity, 
  CheckCheck, 
  ThumbsUp, 
  Sparkles,
  Layers
} from 'lucide-react';

export default function Features() {
  const capabilities = [
    {
      title: 'AI-Assisted Analysis',
      desc: 'Use AI to analyze complaint information and support faster case understanding and priority determination.',
      icon: Cpu,
      accent: 'text-indigo-400',
      border: 'border-indigo-500/30',
      bg: 'bg-indigo-500/10'
    },
    {
      title: 'Controlled Case Assignment',
      desc: 'Administrators assign complaints according to analyst workload and responsibility to avoid backlogs.',
      icon: Users,
      accent: 'text-blue-400',
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Role-Based Access',
      desc: 'Users, administrators, and analysts access only the functionality relevant to their designated role.',
      icon: ShieldCheck,
      accent: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Department Coordination',
      desc: 'Analysts coordinate with the appropriate department to investigate and resolve issues with complete traceability.',
      icon: Network,
      accent: 'text-cyan-400',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-500/10'
    },
    {
      title: 'Status Tracking',
      desc: 'Users can monitor the progress of their complaint through each stage of the resolution lifecycle in real time.',
      icon: Activity,
      accent: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10'
    },
    {
      title: 'Resolution Communication',
      desc: 'Verified resolution updates and investigative findings are communicated directly and securely back to the user.',
      icon: CheckCheck,
      accent: 'text-teal-400',
      border: 'border-teal-500/30',
      bg: 'bg-teal-500/10'
    },
    {
      title: 'Feedback Loop',
      desc: 'User feedback helps evaluate resolution quality and continually improves organizational complaint handling.',
      icon: ThumbsUp,
      accent: 'text-rose-400',
      border: 'border-rose-500/30',
      bg: 'bg-rose-500/10'
    }
  ];

  return (
    <section id="capabilities" className="py-20 md:py-28 bg-[#090d16] border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>ENTERPRISE ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Built for Structured Complaint Resolution
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            A comprehensive suite of operational capabilities engineered for accountability, speed, and cross-departmental coordination.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((item, index) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.title}
                className={`glass-card rounded-2xl p-7 border border-slate-800/80 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between group ${
                  index === 6 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`p-3 rounded-xl ${item.bg} ${item.border} border`}>
                      <IconComp className={`w-6 h-6 ${item.accent}`} />
                    </div>
                    <span className="font-mono text-xs text-slate-600 font-semibold">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Integrated Platform Feature</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
