import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">LOOP Support</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              AI-Powered Customer Feedback Intelligence Platform. Delivering transparent, fast, and automated resolution workflows.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Customer Privacy & Email Security Guaranteed</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/complaint" className="hover:text-blue-400 transition-colors">Submit Complaint</Link></li>
              <li><Link to="/track" className="hover:text-blue-400 transition-colors">Track Complaint Status</Link></li>
              <li><Link to="/dashboard" className="hover:text-blue-400 transition-colors">Customer Dashboard</Link></li>
              <li><a href="/#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">Support Identity</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              All official communications are dispatched directly via verified system channels.
            </p>
            <div className="inline-block px-3 py-1.5 bg-slate-800 rounded-lg text-xs font-medium text-slate-300">
              LOOP Support Team
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} LOOP Customer Platform. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
