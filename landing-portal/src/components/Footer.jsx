import React from 'react';
import { Layers } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#060910] border-t border-slate-900 py-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Brand Identity */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/30">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white font-mono tracking-tight">
                LOOP
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Complaint Resolution & Feedback Platform
            </p>
          </div>

          {/* Clean Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium">
            <a href="#home" className="hover:text-white transition-colors">
              Home
            </a>
            <a href="#portals" className="hover:text-white transition-colors">
              Portals
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#capabilities" className="hover:text-white transition-colors">
              Capabilities
            </a>
            <a href="#security" className="hover:text-white transition-colors">
              Security
            </a>
          </div>

          {/* Copyright Notice */}
          <div className="text-xs text-slate-400 text-center md:text-right">
            <span>© 2026 LOOP. All rights reserved.</span>
          </div>

        </div>
      </div>
    </footer>
  );
}
