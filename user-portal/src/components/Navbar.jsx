import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquarePlus, Search, Cpu, User, LogOut, LayoutDashboard, FileText, Menu, X, ShieldCheck } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUserAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand Logo */}
          <Link to="/" onClick={closeMobile} className="flex items-center space-x-2 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              LOOP <span className="text-xs font-semibold text-blue-600 tracking-normal px-2 py-0.5 bg-blue-50 rounded-full border border-blue-100 hidden sm:inline-block">Customer Care</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
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

          {/* Action CTAs (Desktop & Mobile) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              to="/track"
              onClick={closeMobile}
              className={`inline-flex items-center px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium rounded-xl transition-colors border ${
                location.pathname === '/track'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
              <span>Track</span>
            </Link>

            <Link
              to="/complaint"
              onClick={closeMobile}
              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shadow-blue-500/20 transition-all"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
              <span>Submit</span>
            </Link>

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200">
                <Link
                  to="/profile"
                  className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center space-x-1"
                  title="My Profile"
                >
                  <User className="w-4 h-4" />
                  <span className="text-xs font-bold max-w-[100px] truncate">{user?.name || 'Account'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={closeMobile}
                className="hidden sm:inline-flex items-center px-3.5 py-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 md:hidden rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-2 bg-white/95 backdrop-blur-md rounded-b-2xl">
            <Link
              to="/"
              onClick={closeMobile}
              className="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl"
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={closeMobile}
                  className="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl"
                >
                  My Dashboard
                </Link>
                <Link
                  to="/complaints"
                  onClick={closeMobile}
                  className="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl"
                >
                  My Complaints
                </Link>
                <Link
                  to="/feedback"
                  onClick={closeMobile}
                  className="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl"
                >
                  Submit Feedback
                </Link>
                <Link
                  to="/profile"
                  onClick={closeMobile}
                  className="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl"
                >
                  Account Profile ({user?.name || user?.email})
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center space-x-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className="block px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl"
                >
                  Customer Sign In (OTP)
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobile}
                  className="block px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
