import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  BarChart3,
  FileSpreadsheet,
  Bell,
  User,
  Users,
  Settings,
  ShieldAlert,
  LogOut,
  Cpu,
  Building2,
  MessageSquareHeart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function StaffSidebar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
    }`;

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800/80">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-extrabold text-white tracking-tight leading-none">LOOP Staff</h1>
          <p className="text-2xs text-blue-400 font-medium mt-1">Intelligence Workbench</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 text-3xs font-bold uppercase tracking-wider text-slate-500 mb-2">Core Workflow</p>
          <nav className="space-y-1">
            <NavLink to="/staff/dashboard" className={navItemClass}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/staff/complaints" className={navItemClass}>
              <Inbox className="w-4 h-4" />
              <span>Complaints Inbox</span>
            </NavLink>
            <NavLink to="/staff/departments" className={navItemClass}>
              <Building2 className="w-4 h-4" />
              <span>Department Coordination</span>
            </NavLink>
            <NavLink to="/staff/analytics" className={navItemClass}>
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </NavLink>
            <NavLink to="/staff/reports" className={navItemClass}>
              <FileSpreadsheet className="w-4 h-4" />
              <span>Reports</span>
            </NavLink>
          </nav>
        </div>

        <div>
          <p className="px-3 text-3xs font-bold uppercase tracking-wider text-slate-500 mb-2">Account</p>
          <nav className="space-y-1">
            <NavLink to="/staff/notifications" className={navItemClass}>
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </NavLink>
            <NavLink to="/staff/profile" className={navItemClass}>
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </NavLink>
          </nav>
        </div>

        {/* Admin Only Navigation */}
        {isAdmin && (
          <div className="pt-4 border-t border-slate-800/80">
            <p className="px-3 text-3xs font-bold uppercase tracking-wider text-rose-400 mb-2">Administration</p>
            <nav className="space-y-1">
              <NavLink to="/staff/admin/feedback" className={navItemClass}>
                <MessageSquareHeart className="w-4 h-4" />
                <span>Feedback & Quality</span>
              </NavLink>
              <NavLink to="/staff/admin/users" className={navItemClass}>
                <Users className="w-4 h-4" />
                <span>Manage Analysts</span>
              </NavLink>
              <NavLink to="/staff/admin/settings" className={navItemClass}>
                <Settings className="w-4 h-4" />
                <span>System Settings</span>
              </NavLink>
              <NavLink to="/staff/admin/audit-logs" className={navItemClass}>
                <ShieldAlert className="w-4 h-4" />
                <span>Audit Logs</span>
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs ${
              isAdmin ? 'bg-indigo-600' : 'bg-blue-600'
            }`}>
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-1.5">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Staff User'}</p>
              </div>
              <span className={`text-3xs font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                isAdmin ? 'bg-indigo-950 text-indigo-300 border-indigo-800' : 'bg-blue-950 text-blue-300 border-blue-800'
              }`}>
                {user?.role || 'ANALYST'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
