import React, { useEffect, useState } from 'react';
import { StaffSidebar } from '../components/StaffSidebar';
import { StaffHeader } from '../components/StaffHeader';
import { api } from '../../shared/services/api';
import { Users, UserPlus, Shield, Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react';

export function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ANALYST');
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const res = await api.createAdminUser({ name, email, password, role });
      if (res.success) {
        setSuccess('Staff user created successfully.');
        setName('');
        setEmail('');
        setPassword('');
        setShowModal(false);
        fetchUsers();
      }
    } catch (err) {
      setError(err.message || 'Failed to create user.');
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

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff account?')) return;
    try {
      await api.deleteAdminUser(id);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <StaffSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <StaffHeader
          title="Admin User Management"
          subtitle="Manage staff analysts, system administrators, role privileges, and security status."
        />

        <main className="p-6 space-y-6 flex-1">
          
          {success && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              Staff Accounts Directory
            </h3>

            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff User</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 custom-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-2xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="py-3.5 px-6">Staff Member</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Active Cases</th>
                    <th className="py-3.5 px-4">High Priority</th>
                    <th className="py-3.5 px-4">Workload Capacity</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Last Activity</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {users.map(u => {
                    const capacityPct = u.workloadPercentage || Math.min(100, Math.round(((u.pendingCount || 0) / 15) * 100));

                    return (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-6 font-bold text-slate-900">
                          {u.name}
                          <span className="block text-2xs font-normal text-slate-400">{u.email}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-bold border ${
                            u.role === 'ADMIN' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            <Shield className="w-3 h-3 mr-1" />
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-600">{u.pendingCount || 0}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-rose-600">{u.highPriorityCount || 0}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-md text-2xs font-extrabold border ${
                            capacityPct > 75 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {capacityPct}% Capacity
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2.5 py-0.5 rounded-full text-2xs font-bold border transition-colors cursor-pointer ${
                              u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-300'
                            }`}
                          >
                            {u.status}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {u.lastActivity ? new Date(u.lastActivity).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete User"
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

      {/* Modal for Creating User */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 custom-shadow max-w-md w-full p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Staff Member</h3>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Staff Email</label>
                <input
                  type="email"
                  required
                  placeholder="alex@loop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Role Privilege</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="ANALYST">ANALYST</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
