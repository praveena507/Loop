import React from 'react';
import { StaffSidebar } from '../components/StaffSidebar';
import { StaffHeader } from '../components/StaffHeader';
import { FileSpreadsheet, Download, CheckCircle2 } from 'lucide-react';

export function StaffReportsPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <StaffSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <StaffHeader title="Reports & Export" subtitle="Generate executive feedback summaries and export audit logs." />
        <main className="p-6 flex-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 custom-shadow">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center">
              <FileSpreadsheet className="w-4 h-4 text-blue-600 mr-2" />
              Executive Complaint Summary
            </h3>
            <p className="text-xs text-slate-600 mb-4">Export full complaint logs and AI analysis in CSV or JSON formats.</p>
            <button
              onClick={() => alert('Exporting complaint report dataset...')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Export Full Report (CSV)
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export function StaffNotificationsPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <StaffSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <StaffHeader title="Staff Notifications" subtitle="Real-time alerts regarding new critical complaints and SLA milestones." />
        <main className="p-6 flex-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 custom-shadow">
            <p className="text-xs text-slate-500">All notifications are up to date.</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export function StaffProfilePage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <StaffSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <StaffHeader title="My Staff Profile" subtitle="Manage account information and security settings." />
        <main className="p-6 flex-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 custom-shadow max-w-xl">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Active Staff Credentials</h3>
            <div className="space-y-3 text-xs text-slate-700">
              <div><span className="font-bold text-slate-400 block">Role:</span> Staff Analyst</div>
              <div><span className="font-bold text-slate-400 block">Status:</span> Active</div>
              <div><span className="font-bold text-slate-400 block">Security:</span> Authenticated via JWT</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
