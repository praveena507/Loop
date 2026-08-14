import React, { useState, useEffect } from 'react';
import { Bell, Search, Shield, User } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import { api } from '../../shared/services/api';

export function StaffHeader({ title, subtitle }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    api.getNotifications()
      .then(res => {
        if (res.success) setNotifications(res.notifications || []);
      })
      .catch(() => {});
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs font-medium text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        {/* Role Badge */}
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
          user?.role === 'ADMIN' 
            ? 'bg-rose-50 text-rose-700 border-rose-200' 
            : 'bg-blue-50 text-blue-700 border-blue-200'
        }`}>
          <Shield className="w-3 h-3 mr-1" />
          {user?.role || 'ANALYST'}
        </span>

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-2xs text-slate-500">{unreadCount} unread</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <p className="p-4 text-xs text-slate-400 text-center">No notifications</p>
                ) : (
                  notifications.slice(0, 5).map(n => (
                    <div key={n.id} className="p-3 hover:bg-slate-50 text-xs">
                      <p className="font-semibold text-slate-800">{n.message}</p>
                      <p className="text-2xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleTimeString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <span className="text-xs font-semibold text-slate-800 hidden sm:inline">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
