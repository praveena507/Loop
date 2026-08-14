import React, { useEffect, useState } from 'react';
import { StaffSidebar } from '../components/StaffSidebar';
import { StaffHeader } from '../components/StaffHeader';
import { api } from '../../shared/services/api';
import { ShieldAlert, Cpu, Lock } from 'lucide-react';

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditLogs()
      .then(res => {
        if (res.success) setLogs(res.logs || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <StaffSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <StaffHeader title="Admin Audit Logs" subtitle="Comprehensive security audit log trail of all administrative and analyst actions." />
        <main className="p-6 flex-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 custom-shadow overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs text-slate-500 font-medium">
              <span>Showing last <strong>{logs.length}</strong> security events</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-2xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="py-3.5 px-6">Timestamp</th>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Entity</th>
                    <th className="py-3.5 px-4">Entity ID</th>
                    <th className="py-3.5 px-6">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {logs.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-6 text-slate-500">{new Date(l.createdAt).toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{l.userName || l.userEmail || l.userId}</td>
                      <td className="py-3.5 px-4 text-blue-600 font-bold">{l.action}</td>
                      <td className="py-3.5 px-4 text-slate-600">{l.entity}</td>
                      <td className="py-3.5 px-4 text-slate-400">{l.entityId}</td>
                      <td className="py-3.5 px-6 text-slate-500">{l.ipAddress || '127.0.0.1'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.getAdminSettings()
      .then(res => {
        if (res.success) setSettings(res.settings);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <StaffSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <StaffHeader title="Workspace Settings" subtitle="System operational parameters, SLA targets, and Gemini AI configuration." />
        <main className="p-6 flex-1 space-y-6 max-w-xl">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 custom-shadow space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <Cpu className="w-4 h-4 text-blue-600 mr-2" />
              AI Intelligence Model Parameters
            </h3>
            <div className="space-y-3 pt-2">
              <div>
                <span className="text-slate-400 font-bold block">Active Gemini Model:</span>
                <span className="text-slate-800 font-mono font-bold">{settings?.aiModel || 'Gemini 2.5 Flash'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Resolution SLA Target:</span>
                <span className="text-slate-800 font-bold">{settings?.slaHours || 24} Hours</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Support Email Sender Label:</span>
                <span className="text-slate-800 font-bold">LOOP Support Team</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
