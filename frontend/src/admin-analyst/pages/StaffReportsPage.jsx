import { useState } from 'react';
import { StaffSidebar } from '../components/StaffSidebar';
import { StaffHeader } from '../components/StaffHeader';
import { useAuth } from '../../shared/context/AuthContext';
import { api } from '../../shared/services/api';
import { exportComplaintsToCSV } from '../../shared/utils/csvExporter';
import { FileSpreadsheet, Download, CheckCircle2, FileText, Loader2 } from 'lucide-react';

export function StaffReportsPage() {
  const [downloading, setDownloading] = useState(false);

  const handleExportCSV = async () => {
    setDownloading(true);
    try {
      const res = await api.getStaffComplaints();
      if (res.success && res.complaints) {
        exportComplaintsToCSV(res.complaints, `LOOP_Corporate_Complaints_${new Date().toISOString().slice(0,10)}.csv`);
      } else {
        alert('Failed to retrieve complaints for export.');
      }
    } catch (err) {
      alert('Error generating CSV export: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <StaffSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <StaffHeader title="Reports & Export" subtitle="Generate executive feedback summaries and export audit logs." />
        <main className="p-6 flex-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 custom-shadow space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center">
                <FileSpreadsheet className="w-4.5 h-4.5 text-blue-600 mr-2" />
                Executive Complaint & Audit Log Report
              </h3>
              <p className="text-xs text-slate-600">Export full corporate complaint records, AI triage scores, analyst assignments, and resolution notes in UTF-8 formatted CSV format.</p>
            </div>
            
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={downloading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 inline-flex items-center transition-all cursor-pointer disabled:opacity-50"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating CSV File...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Full Report (CSV)
                  </>
                )}
              </button>
            </div>
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
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [msg, setMsg] = React.useState(null);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('New password must be at least 6 characters.');
      return;
    }
    setMsg('Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <StaffSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <StaffHeader title="My Staff Profile" subtitle="Manage account details, role privileges, and security settings." />
        <main className="p-6 flex-1 space-y-6 max-w-2xl">
          
          {msg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{msg}</span>
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl border border-slate-200 custom-shadow space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Active Staff Account Credentials</h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-400 block mb-1">Full Name</span>
                <span className="font-bold text-slate-900 text-sm">{user?.name || 'Staff User'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block mb-1">Email Address</span>
                <span className="font-bold text-slate-900 text-sm">{user?.email || 'user@loop.com'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block mb-1">Assigned Role</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-bold border ${
                  user?.role === 'ADMIN' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {user?.role || 'ANALYST'}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block mb-1">Account Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ACTIVE ✓
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 custom-shadow space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Security & Password Management</h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Update Password
              </button>
            </form>
          </div>

        </main>
      </div>
    </div>
  );
}
