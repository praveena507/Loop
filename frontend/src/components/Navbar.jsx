import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquarePlus, Search, Cpu } from 'lucide-react';

export function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              LOOP <span className="text-xs font-semibold text-blue-600 tracking-normal px-2 py-0.5 bg-blue-50 rounded-full border border-blue-100">AI Support</span>
            </span>
          </Link>

          {/* Public Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              About
            </a>
            <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Public Action CTAs */}
          <div className="flex items-center space-x-3">
            <Link
              to="/track"
              className={`inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-lg transition-colors border ${
                location.pathname === '/track'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Search className="w-4 h-4 mr-2" />
              Track My Complaint
            </Link>

            <Link
              to="/complaint"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all hover:shadow-md hover:shadow-blue-500/30"
            >
              <MessageSquarePlus className="w-4 h-4 mr-2" />
              Submit a Complaint
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
