import React, { useEffect, useState } from 'react';
import { StaffSidebar } from '../components/StaffSidebar';
import { StaffHeader } from '../components/StaffHeader';
import { api } from '../../shared/services/api';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Mail,
  Key,
  RefreshCw,
  Edit2,
  Sparkles,
  Lock,
  Send
} from 'lucide-react';

export function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Password Visibility Toggle per User
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // Add User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Analyst@12345');
  const [role, setRole] = useState('ANALYST');
  const [sendEmailNotification, setSendEmailNotification] = useState(true);

  // Edit Password Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editPassword, setEditPassword] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Feedback Banner
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    api.getAdminUsers()
      .then(res => {
        if (res.success) setUsers(res.users || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleGeneratePassword = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setPassword(`Analyst@${randomSuffix}`);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !email.trim() || !password) {
      setError('Please provide analyst name, email, and password.');
      return;
    }

    try {
      const res = await api.createAdminUser({
        name: name.trim(),
        email: email.trim(),
        password: password,
        role: role.toUpperCase(),
        sendEmailNotification
      });

      if (res.success) {
        setSuccess(res.message || `Analyst account created successfully and credentials dispatched to ${email}!`);
        setName('');
        setEmail('');
        setPassword('Analyst@12345');
        setShowModal(false);
        fetchUsers();
      }
    } catch (err) {
      setError(err.message || 'Failed to create analyst account.');
    }
  };

  const handleResendCredentials = async (user) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await api.resendAdminUserCredentials(user.id);
      if (res.success) {
        setSuccess(`Login credentials email successfully re-dispatched to ${user.email}!`);
      }
    } catch (err) {
      alert(err.message || 'Failed to send credentials email.');
    }
  };

  const handleOpenEditPassword = (user) => {
    setEditingUser(user);
    setEditPassword(user.plainPassword || 'Analyst@12345');
  };

  const handleSaveUpdatedPassword = async (e) => {
    e.preventDefault();
    if (!editPassword || editPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    setEditLoading(true);
    try {
      const res = await api.updateAdminUser(editingUser.id, {
        password: editPassword,
        sendCredentialsEmail: true
      });
      if (res.success) {
        setSuccess(`Password updated for ${editingUser.name}. Updated credentials email sent to ${editingUser.email}.`);
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      alert(err.message || 'Failed to update password.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.updateAdminUser(user.id, { status: newStatus });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete staff account for "${user.name}" (${user.email})?`)) return;
    try {
      const res = await api.deleteAdminUser(user.id);
      if (res.success) {
        setSuccess(`Staff account for ${user.name} deleted.`);
        fetchUsers();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <StaffSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <StaffHeader
          title="Manage Analysts & Staff Credentials"
          subtitle="Add, delete, update passwords, and inspect analyst credentials with automated email notification dispatch."
        />

        <main className="p-6 space-y-6 flex-1">
          
          {success && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{success}</span>
              </div>
              <button onClick={() => setSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center">
                <Users className="w-5 h-5 text-indigo-600 mr-2" />
                Analyst & Admin Staff Directory ({users.length})
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Admin can inspect passwords, add new analysts, dispatch email login details, or delete analyst accounts.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={fetchUsers}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Directory</span>
              </button>

              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all inline-flex items-center space-x-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-indigo-200" />
                <span>Add Analyst Account</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 custom-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-3xs uppercase tracking-wider text-slate-500 font-extrabold">
                    <th className="py-3.5 px-5">Staff Member & Email</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-5">Analyst Password (Admin Visible)</th>
                    <th className="py-3.5 px-4">Active Cases</th>
                    <th className="py-3.5 px-4">Workload Capacity</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-5 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {users.map(u => {
                    const isPasswordVisible = visiblePasswords[u.id];
                    const activePlainPassword = u.plainPassword || (u.role === 'ADMIN' ? 'Admin@12345' : 'Analyst@12345');
                    const capacityPct = u.workloadPercentage || Math.min(100, Math.round(((u.pendingCount || 0) / 15) * 100));

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-extrabold text-slate-900">{u.name}</div>
                          <div className="font-mono text-2xs text-slate-500 flex items-center space-x-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{u.email}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-3xs font-extrabold border ${
                            u.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            <Shield className="w-3 h-3 mr-1" />
                            {u.role}
                          </span>
                        </td>

                        {/* Visible Password Field for Admin */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300 text-slate-900 font-bold select-all min-w-[120px] inline-block">
                              {isPasswordVisible ? activePlainPassword : '••••••••••••'}
                            </span>

                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(u.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                              title={isPasswordVisible ? "Hide Password" : "Show Plain Password"}
                            >
                              {isPasswordVisible ? <EyeOff className="w-4 h-4 text-blue-600" /> : <Eye className="w-4 h-4" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditPassword(u)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Change Password"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-amber-600">
                          {u.pendingCount || 0} active
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-md text-3xs font-extrabold border ${
                            capacityPct > 75 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {capacityPct}% Capacity
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2.5 py-0.5 rounded-full text-3xs font-extrabold border transition-colors cursor-pointer ${
                              u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-300'
                            }`}
                          >
                            {u.status}
                          </button>
                        </td>

                        <td className="py-3.5 px-5 text-right space-x-1">
                          <button
                            onClick={() => handleResendCredentials(u)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                            title="Resend Login Credentials Email"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                            title="Delete Staff Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

      {/* Modal for Creating Analyst / Staff User */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 custom-shadow max-w-md w-full p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Add New Analyst Account</h3>
                  <p className="text-2xs text-slate-500">Set credentials & dispatch email notification to analyst.</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Analyst Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Michael Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Analyst Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="michael.v@loop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Assigned Password *
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-3xs font-extrabold text-indigo-600 hover:underline flex items-center"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Generate Random
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Analyst@12345"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="text-3xs text-slate-400 mt-1">Admin can view and update this password anytime.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Role Privilege
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-800"
                >
                  <option value="ANALYST">ANALYST (Complaint Case Coordinator)</option>
                  <option value="ADMIN">ADMIN (System Administrator)</option>
                </select>
              </div>

              <div className="bg-indigo-50/70 border border-indigo-200/80 p-3 rounded-xl flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendNotif"
                  checked={sendEmailNotification}
                  onChange={(e) => setSendEmailNotification(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="sendNotif" className="text-xs text-indigo-900 font-medium cursor-pointer">
                  Send credentials email to analyst automatically
                </label>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-500/20"
                >
                  Create Analyst Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Editing Password */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 custom-shadow max-w-md w-full p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Change Password</h3>
                  <p className="text-2xs text-slate-500">Update password for {editingUser.name} ({editingUser.email})</p>
                </div>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdatedPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  New Password *
                </label>
                <input
                  type="text"
                  required
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-3xs text-slate-400 mt-1">Saving this will update the analyst's login password & dispatch an email notice.</p>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Update & Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
