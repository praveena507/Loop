import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

export function StaffHeader({ title, subtitle }) {
  const { user, isAdmin } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 sm:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-30 shadow-xs">
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{title}</h1>
          <span className={`text-2xs font-extrabold uppercase px-2 py-0.5 rounded border ${
            isAdmin ? 'bg-indigo-950 text-indigo-300 border-indigo-800' : 'bg-blue-950 text-blue-300 border-blue-800'
          }`}>
            {isAdmin ? 'Admin View' : 'Analyst View'}
          </span>
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs ${
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
