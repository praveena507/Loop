import React, { useState } from 'react';
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
  MessageSquareHeart,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function StaffSidebar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight leading-none">LOOP Staff</h1>
            <p className="text-2xs text-blue-400 font-medium mt-1">Intelligence Workbench</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 text-3xs font-bold uppercase tracking-wider text-slate-500 mb-2">Core Workflow</p>
          <nav className="space-y-1">
            <NavLink to="/staff/dashboard" onClick={() => setMobileOpen(false)} className={navItemClass}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/staff/complaints" onClick={() => setMobileOpen(false)} className={navItemClass}>
              <Inbox className="w-4 h-4" />
              <span>Complaints Inbox</span>
            </NavLink>
            <NavLink to="/staff/departments" onClick={() => setMobileOpen(false)} className={navItemClass}>
              <Building2 className="w-4 h-4" />
              <span>Department Coordination</span>
            </NavLink>
            <NavLink to="/staff/analytics" onClick={() => setMobileOpen(false)} className={navItemClass}>
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </NavLink>
            <NavLink to="/staff/reports" onClick={() => setMobileOpen(false)} className={navItemClass}>
              <FileSpreadsheet className="w-4 h-4" />
              <span>Reports</span>
            </NavLink>
          </nav>
        </div>

        <div>
          <p className="px-3 text-3xs font-bold uppercase tracking-wider text-slate-500 mb-2">Account</p>
          <nav className="space-y-1">
            <NavLink to="/staff/notifications" onClick={() => setMobileOpen(false)} className={navItemClass}>
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </NavLink>
            <NavLink to="/staff/profile" onClick={() => setMobileOpen(false)} className={navItemClass}>
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
              <NavLink to="/staff/admin/feedback" onClick={() => setMobileOpen(false)} className={navItemClass}>
                <MessageSquareHeart className="w-4 h-4" />
                <span>Feedback & Quality</span>
              </NavLink>
              <NavLink to="/staff/admin/users" onClick={() => setMobileOpen(false)} className={navItemClass}>
                <Users className="w-4 h-4" />
                <span>Manage Analysts</span>
              </NavLink>
              <NavLink to="/staff/admin/settings" onClick={() => setMobileOpen(false)} className={navItemClass}>
                <Settings className="w-4 h-4" />
                <span>System Settings</span>
              </NavLink>
              <NavLink to="/staff/admin/audit-logs" onClick={() => setMobileOpen(false)} className={navItemClass}>
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
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-950 text-slate-300 flex-col shrink-0 min-h-screen border-r border-slate-800/80">
        {sidebarContent}
      </aside>

      {/* Mobile Floating Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-5 right-5 z-40 p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center transition-all cursor-pointer"
        aria-label="Open Navigation Menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Modal Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setMobileOpen(false)}></div>
          <aside className="relative w-72 max-w-[80vw] bg-slate-950 text-slate-300 flex flex-col h-full z-10 border-r border-slate-800 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
