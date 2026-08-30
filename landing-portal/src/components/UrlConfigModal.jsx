import React from 'react';
import { AlertTriangle, X, Terminal, CheckCircle2 } from 'lucide-react';

export default function UrlConfigModal({ isOpen, onClose, configData }) {
  if (!isOpen || !configData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              Portal URL Configuration Required
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              The environment variable for <strong className="text-slate-200">{configData.portalName}</strong> is not configured yet.
            </p>
          </div>
        </div>

        {/* Instructions Body */}
        <div className="space-y-4 text-sm text-slate-300">
          <p>
            To link this gateway directly to your live deployment, add the environment variable in your deployment platform (e.g. Vercel) or local <code className="text-blue-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">.env</code> file:
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-200 flex items-center justify-between">
            <div className="truncate pr-2">
              <span className="text-slate-500"># Required variable:</span><br />
              <span className="text-blue-400">{configData.envKey}</span>=https://your-deployed-app.vercel.app
            </div>
            <Terminal className="w-4 h-4 text-slate-500 shrink-0" />
          </div>

          <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-3.5 flex gap-3 text-xs text-blue-200">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-100">For Evaluators / Local Review:</span><br />
              For local testing, start your portals with <code className="bg-blue-900/50 px-1 rounded">npm run dev</code> and set the local URL in <code className="bg-blue-900/50 px-1 rounded">.env</code>.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-colors border border-slate-700"
          >
            Understood
          </button>
        </div>

      </div>
    </div>
  );
}
