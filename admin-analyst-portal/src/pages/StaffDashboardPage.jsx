import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StaffSidebar } from '../components/StaffSidebar';
import { StaffHeader } from '../components/StaffHeader';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge, SentimentBadge } from '../components/Badge';
import {
  Inbox,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  ArrowUpRight,
  Flame,
  Zap,
  RefreshCw,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export function StaffDashboardPage() {
  const { user, isAdmin } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    critical: 0,
    inProgress: 0,
    resolved: 0,
    resolutionRate: 0
  });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = () => {
    setLoading(true);
    Promise.all([
      api.getStaffComplaints(),
      api.getAnalytics()
    ])
      .then(([resComp, resAna]) => {
        if (resComp.success && Array.isArray(resComp.complaints)) {
          const list = resComp.complaints;
          setComplaints(list);

          const total = list.length;
          const newCount = list.filter(c => c.status === 'SUBMITTED' || c.status === 'VERIFIED' || c.status === 'AI_ANALYZED').length;
          const critical = list.filter(c => (c.priority === 'CRITICAL' || c.priority === 'HIGH' || c.priority === 'P1') && c.status !== 'RESOLVED').length;
          const inProgress = list.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ACTION_TAKEN' || c.status === 'WAITING_FOR_DEPARTMENT' || c.status === 'READY_FOR_USER_RESPONSE').length;
          const resolved = list.filter(c => c.status === 'RESOLVED').length;
          const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

          setStats({
            total,
            new: newCount,
            critical,
            inProgress,
            resolved,
            resolutionRate
          });
        }
        if (resAna.success) {
          setAnalytics(resAna.analytics || {});
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const criticalComplaints = complaints.filter(c => (c.priority === 'CRITICAL' || c.priority === 'P1') && c.status !== 'RESOLVED');

  // Chart Color Palettes
  const SENTIMENT_COLORS = ['#ef4444', '#94a3b8', '#10b981']; // Negative (red), Neutral (slate), Positive (emerald)
  const PRIORITY_COLORS = ['#3b82f6', '#f59e0b', '#f97316', '#f43f5e'];

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <StaffSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <StaffHeader
          title={isAdmin ? "Operations Dashboard" : "Analyst Workbench"}
          subtitle={isAdmin ? "Real-time complaint triage, workload metrics & system intelligence." : "Overview of your assigned complaints and SLA velocity."}
        />

        <main className="p-6 space-y-6 flex-1">
          
          <div className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl border border-slate-700/80 custom-shadow">
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Database Connection Active • {complaints.length} Records In Scope</span>
            </div>
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <Link
                  to="/staff/admin/users"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center space-x-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Manage Analysts</span>
                </Link>
              )}
              <button
                onClick={loadDashboardData}
                className="px-3.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold text-xs rounded-xl border border-blue-500/30 transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Syncing...' : 'Sync Live Metrics'}</span>
              </button>
            </div>
          </div>

          {/* Critical Alerts Banner */}
          {criticalComplaints.length > 0 && (
            <div className="bg-rose-950/60 border border-rose-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-200">
                    {criticalComplaints.length} Critical Complaint{criticalComplaints.length > 1 ? 's' : ''} Require Immediate Attention
                  </h3>
                  <p className="text-xs text-rose-300/80 mt-0.5">High financial impact or operational risk detected.</p>
                </div>
              </div>
              <Link
                to="/staff/complaints?priority=CRITICAL"
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
              >
                Review Critical
              </Link>
            </div>
          )}

          {/* Workflow Navigation Quick Links */}
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 custom-shadow space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Analyst Case Coordination Navigation</h3>
              <span className="text-2xs font-bold text-blue-400 bg-blue-950 px-2.5 py-0.5 rounded-full border border-blue-800">Active Lifecycle</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs">
              <Link to="/staff/complaints?assignedToMe=true" className="bg-slate-900 hover:bg-blue-900/30 hover:border-blue-500 border border-slate-700 p-2.5 rounded-xl transition-all text-center group flex flex-col justify-center items-center">
                <div className="font-extrabold text-2xs text-white group-hover:text-blue-400 truncate w-full">MY CASES</div>
                <div className="text-3xs text-slate-400 truncate w-full">Assigned</div>
              </Link>

              <Link to="/staff/departments" className="bg-slate-900 hover:bg-blue-900/30 hover:border-blue-500 border border-slate-700 p-2.5 rounded-xl transition-all text-center group flex flex-col justify-center items-center">
                <div className="font-extrabold text-2xs text-white group-hover:text-blue-400 truncate w-full">DEPARTMENTS</div>
                <div className="text-3xs text-slate-400 truncate w-full">Coordination</div>
              </Link>

              <Link to="/staff/complaints?status=WAITING_FOR_DEPARTMENT" className="bg-slate-900 hover:bg-amber-900/30 hover:border-amber-500 border border-slate-700 p-2.5 rounded-xl transition-all text-center group flex flex-col justify-center items-center">
                <div className="font-extrabold text-2xs text-amber-400 truncate w-full">PENDING DEPT</div>
                <div className="text-3xs text-slate-400 truncate w-full">Awaiting</div>
              </Link>

              <Link to="/staff/complaints?status=IN_PROGRESS" className="bg-slate-900 hover:bg-sky-900/30 hover:border-sky-500 border border-slate-700 p-2.5 rounded-xl transition-all text-center group flex flex-col justify-center items-center">
                <div className="font-extrabold text-2xs text-sky-400 truncate w-full">INVESTIGATING</div>
                <div className="text-3xs text-slate-400 truncate w-full">Under Review</div>
              </Link>

              <Link to="/staff/complaints?status=READY_FOR_USER_RESPONSE" className="bg-slate-900 hover:bg-teal-900/30 hover:border-teal-500 border border-slate-700 p-2.5 rounded-xl transition-all text-center group flex flex-col justify-center items-center">
                <div className="font-extrabold text-2xs text-teal-400 truncate w-full">READY DEPT</div>
                <div className="text-3xs text-slate-400 truncate w-full">Verified</div>
              </Link>

              <Link to="/staff/complaints?status=RESOLVED" className="bg-slate-900 hover:bg-emerald-900/30 hover:border-emerald-500 border border-slate-700 p-2.5 rounded-xl transition-all text-center group flex flex-col justify-center items-center">
                <div className="font-extrabold text-2xs text-emerald-400 truncate w-full">RESOLVED</div>
                <div className="text-3xs text-slate-400 truncate w-full">Dispatched</div>
              </Link>

              <Link to="/staff/complaints?status=ESCALATED" className="bg-slate-900 hover:bg-rose-900/30 hover:border-rose-500 border border-slate-700 p-2.5 rounded-xl transition-all text-center group flex flex-col justify-center items-center">
                <div className="font-extrabold text-2xs text-rose-400 truncate w-full">ESCALATED</div>
                <div className="text-3xs text-slate-400 truncate w-full">Admin Review</div>
              </Link>

              <Link to="/staff/admin/feedback" className="bg-slate-900 hover:bg-purple-900/30 hover:border-purple-500 border border-slate-700 p-2.5 rounded-xl transition-all text-center group flex flex-col justify-center items-center">
                <div className="font-extrabold text-2xs text-purple-400 truncate w-full">FEEDBACK</div>
                <div className="text-3xs text-slate-400 truncate w-full">Insights</div>
              </Link>
            </div>
          </div>

          {/* KPI Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <Link
              to="/staff/complaints"
              className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 custom-shadow hover:border-blue-500 transition-all group block"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider group-hover:text-blue-400 transition-colors">Total</span>
                <Inbox className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-extrabold text-white group-hover:text-blue-400 transition-colors">{stats.total}</p>
              <span className="text-2xs text-slate-400 font-medium">All In Scope</span>
            </Link>

            <Link
              to="/staff/complaints?status=SUBMITTED"
              className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 custom-shadow hover:border-amber-500 transition-all group block"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider group-hover:text-amber-400 transition-colors">New / Awaiting</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-extrabold text-amber-400">{stats.new}</p>
              <span className="text-2xs text-slate-400 font-medium">Awaiting Action</span>
            </Link>

            <Link
              to="/staff/complaints?priority=CRITICAL"
              className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 custom-shadow hover:border-rose-500 transition-all group block"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider group-hover:text-rose-400 transition-colors">Critical</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-extrabold text-rose-400">{stats.critical}</p>
              <span className="text-2xs text-slate-400 font-medium">High Risk</span>
            </Link>

            <Link
              to="/staff/complaints?status=IN_PROGRESS"
              className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 custom-shadow hover:border-sky-500 transition-all group block"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider group-hover:text-sky-400 transition-colors">In Progress</span>
                <Clock className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-extrabold text-sky-400">{stats.inProgress}</p>
              <span className="text-2xs text-slate-400 font-medium">Active Investigation</span>
            </Link>

            <Link
              to="/staff/complaints?status=RESOLVED"
              className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 custom-shadow hover:border-emerald-500 transition-all group block"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider group-hover:text-emerald-400 transition-colors">Resolved</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-400">{stats.resolved}</p>
              <span className="text-2xs text-slate-400 font-medium">Completed Tickets</span>
            </Link>

            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 custom-shadow">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Resolution Rate</span>
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-extrabold text-white">{stats.resolutionRate}%</p>
              <span className="text-2xs text-slate-400 font-medium">SLA Performance</span>
            </div>
          </div>

          {/* Recent Complaints Table */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700/80 custom-shadow overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white">Recent Case Activity</h3>
                <p className="text-xs text-slate-400">Latest complaints received in your workbench queue.</p>
              </div>
              <Link
                to="/staff/complaints"
                className="text-xs font-bold text-blue-400 hover:underline flex items-center"
              >
                <span>View Full Inbox</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="py-3.5 px-6">Ticket ID</th>
                    <th className="py-3.5 px-6">Complainant</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Priority</th>
                    <th className="py-3.5 px-6">Assigned Analyst</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {complaints.slice(0, 8).map((c) => (
                    <tr key={c.id} className="hover:bg-slate-700/40 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-blue-400">
                        {c.complaintNumber}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-white">{c.name}</div>
                        <div className="text-2xs text-slate-400">{c.email}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-medium">
                        {c.category}
                      </td>
                      <td className="py-4 px-6">
                        <PriorityBadge priority={c.priority || 'MEDIUM'} />
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {c.assignedAnalystName ? (
                          <span className="font-bold text-slate-200">{c.assignedAnalystName}</span>
                        ) : (
                          <span className="text-amber-400 font-semibold italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/staff/complaints/${c.id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white font-bold rounded-lg border border-blue-500/30 transition-colors"
                        >
                          <span>Review</span>
                          <ArrowUpRight className="w-3 h-3 ml-1" />
                        </Link>
                      </td>
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
