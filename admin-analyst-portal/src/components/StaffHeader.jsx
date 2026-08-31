import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, RefreshCw, ArrowRightLeft } from 'lucide-react';

export function StaffHeader({ title, subtitle }) {
  const { user, isAdmin, switchRole, loading } = useAuth();

  const handleToggleRole = async () => {
    const target = isAdmin ? 'ANALYST' : 'ADMIN';
    await switchRole(target);
    window.location.reload();
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 py-3.5 px-6 sm:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-30 shadow-xs">
      <div>
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{title}</h1>
          <span className={`text-2xs font-extrabold uppercase px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
            isAdmin ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700' : 'bg-blue-950/80 text-blue-300 border-blue-700'
          }`}>
            {isAdmin ? <ShieldCheck className="w-3 h-3 text-indigo-400" /> : <UserCheck className="w-3 h-3 text-blue-400" />}
            <span>{isAdmin ? 'System Admin Mode' : 'Lead Analyst Mode'}</span>
          </span>
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-3 flex-wrap gap-y-2">
        {/* Quick Evaluator Role Switcher */}
        <button
          onClick={handleToggleRole}
          disabled={loading}
          className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer inline-flex items-center space-x-1.5 shadow-sm ${
            isAdmin
              ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border-blue-500/40 hover:border-blue-500'
              : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/40 hover:border-indigo-500'
          }`}
          title={isAdmin ? "Switch immediately to Lead Analyst workbench view" : "Switch immediately to System Administrator view"}
        >
          <ArrowRightLeft className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isAdmin ? 'Switch to Lead Analyst View' : 'Switch to Admin View'}</span>
        </button>

        {/* Current User Badge */}
        <div className="flex items-center space-x-2.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs ${
            isAdmin ? 'bg-indigo-600' : 'bg-blue-600'
          }`}>
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-none">{user?.name || 'Staff User'}</p>
            <p className="text-3xs text-slate-400 font-medium mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

