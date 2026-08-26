import React, { useEffect, useState } from 'react';
import { StaffSidebar } from '../components/StaffSidebar';
import { StaffHeader } from '../components/StaffHeader';
import { api } from '../../shared/services/api';
import { BarChart3, PieChart, TrendingUp, Zap, ShieldCheck, Flame, Layers, AlertTriangle, FileCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';

export function StaffAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then(res => {
        if (res.success) setAnalytics(res.analytics);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const COLORS = ['#2563eb', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#06b6d4'];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <StaffSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <StaffHeader
          title="Section Problem Review & Intelligence Analytics"
          subtitle="Review problem concentration across operational sections, AI root causes, and document proof metrics."
        />

        <main className="p-6 space-y-6 flex-1">
          
          {/* Section Problem Concentration Cards */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 custom-shadow space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center">
                  <Layers className="w-5 h-5 text-blue-600 mr-2" />
                  Section Problem Concentration Heatmap
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Identifies which business sections have the highest volume of customer problems.</p>
              </div>
              <span className="text-2xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Automated Category Classifier
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {analytics?.sectionProblems?.map((sec, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span>{sec.sectionName}</span>
                    {sec.criticalCount > 0 && (
                      <span className="text-2xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                        {sec.criticalCount} Critical
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold text-blue-600">{sec.count}</span>
                    <span className="text-xs text-slate-500 font-medium">reported problems</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Operational Root Causes Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 custom-shadow">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
                <Flame className="w-4 h-4 text-rose-600 mr-2" />
                Operational Root Cause Analysis
              </h3>
              <div className="h-64">
                {analytics?.rootCauses && analytics.rootCauses.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.rootCauses} layout="vertical">
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis dataKey="rootCause" type="category" width={160} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ef4444" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">No root cause data</div>
                )}
              </div>
            </div>

            {/* Document Proof Verification Metrics */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 custom-shadow space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <FileCheck className="w-4 h-4 text-emerald-600 mr-2" />
                Document Proof Attachment Analytics
              </h3>
              <p className="text-xs text-slate-500">Proportion of complaints with attached receipts, photo proofs, or screenshots verified by Automated Document OCR.</p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-800 block">Proof Attached & Verified</span>
                  <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
                    {analytics?.proofStats?.find(p => p.attachmentAnalyzed === 1)?.count || 0}
                  </span>
                  <span className="text-2xs text-emerald-700 font-medium">Processed via Automated OCR</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block">Text Only Complaints</span>
                  <span className="text-2xl font-extrabold text-slate-800 mt-1 block">
                    {analytics?.proofStats?.find(p => p.attachmentAnalyzed === 0)?.count || 0}
                  </span>
                  <span className="text-2xs text-slate-500 font-medium">Standard Text Submissions</span>
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
