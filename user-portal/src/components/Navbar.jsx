import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquarePlus, Search, Cpu, User, LogOut, LayoutDashboard, FileText } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUserAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              LOOP <span className="text-xs font-semibold text-blue-600 tracking-normal px-2 py-0.5 bg-blue-50 rounded-full border border-blue-100">Customer Support</span>
            </span>
          </Link>

          {/* Public Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/dashboard' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  My Dashboard
                </Link>
                <Link
                  to="/complaints"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/complaints' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  My Complaints
                </Link>
              </>
            ) : (
              <>
                <a href="/#how-it-works" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                  How It Works
                </a>
                <a href="/#about" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                  About
                </a>
                <a href="/#faq" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                  FAQ
                </a>
              </>
            )}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            <Link
              to="/track"
              className={`inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-xl transition-colors border ${
                location.pathname === '/track'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Search className="w-4 h-4 mr-1.5" />
              <span>Track</span>
            </Link>

            <Link
              to="/complaint"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shadow-blue-500/20 transition-all"
            >
              <MessageSquarePlus className="w-4 h-4 mr-1.5" />
              <span>Submit</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <Link
                  to="/profile"
                  className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center space-x-1"
                  title="My Profile"
                >
                  <User className="w-4 h-4" />
                  <span className="text-xs font-bold max-w-[100px] truncate hidden sm:inline">{user?.name || 'Account'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-3.5 py-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
