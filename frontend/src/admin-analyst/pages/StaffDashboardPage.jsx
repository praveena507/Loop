import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StaffSidebar } from '../components/StaffSidebar';
import { StaffHeader } from '../components/StaffHeader';
import { api } from '../../shared/services/api';
import { useAuth } from '../../shared/context/AuthContext';
import { StatusBadge, PriorityBadge, SentimentBadge } from '../../shared/components/Badge';
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
          const inProgress = list.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ACTION_TAKEN').length;
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

  const criticalComplaints = complaints.filter(c => c.priority === 'CRITICAL' && c.status !== 'RESOLVED');

  // Chart Color Palettes
  const SENTIMENT_COLORS = ['#ef4444', '#94a3b8', '#10b981']; // Negative (red), Neutral (slate), Positive (emerald)
  const PRIORITY_COLORS = ['#3b82f6', '#f59e0b', '#f97316', '#f43f5e'];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <StaffSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <StaffHeader
          title={isAdmin ? "Operations Dashboard" : "Analyst Workspace"}
          subtitle={isAdmin ? "Welcome back, Admin. Real-time complaint metrics & system intelligence." : "Welcome back. Overview of your assigned complaints and SLA velocity."}
        />

        <main className="p-6 space-y-6 flex-1">
          
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 custom-shadow">
            <div className="flex items-center space-x-2 text-xs text-slate-500 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Database Connection Active • {complaints.length} Total Records Loaded</span>
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
                className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Syncing...' : 'Sync Live Metrics'}</span>
              </button>
            </div>
          </div>

          {/* Critical Alerts Banner */}
          {criticalComplaints.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-900">
                    {criticalComplaints.length} Critical Complaint{criticalComplaints.length > 1 ? 's' : ''} Require Immediate Analyst Attention
                  </h3>
                  <p className="text-xs text-rose-700 mt-0.5">High financial impact or operational glitch reported.</p>
                </div>
              </div>
              <Link
                to="/staff/complaints?priority=CRITICAL"
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
              >
                Review Critical Complaints
              </Link>
            </div>
          )}

          {/* Analyst Workflow Navigation Sections */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 custom-shadow space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Analyst Case Coordination Navigation</h3>
              <span className="text-2xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">Active Lifecycle</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs">
              <Link to="/staff/complaints?assignedToMe=true" className="bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 p-2 rounded-xl transition-all text-center group flex flex-col justify-center items-center">
                <div className="font-extrabold text-2xs text-slate-900 group-hover:text-blue-600 truncate w-full">MY CASES</div>
                <div className="text-3xs text-slate-500 truncate w-full">Assigned</div>
              </Link>

              <Link to="/staff/departments" className="bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 p-2 rounded-xl transition-all text-center group flex flex-col justify-center items-center">
                <div className="font-extrabold text-2xs text-slate-900 group-hover:text-blue-600 truncate w-full">DEPARTMENTS</div>
                <div className="text-3xs text-slate-500 truncate w-full">Coordination</div>
              </Link>

              <Link to="/staff/complaints?status=WAITING_FOR_DEPARTMENT" className="bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 p-2 rounded-xl transition-all text-center group flex flex-col justify-center items-center">
                <div className="font-extrabold text-2xs text-amber-700 truncate w-full">PENDING DEPT</div>
                <div className="text-3xs text-slate-500 truncate w-full">Awaiting</div>
              </Link>

              <Link to="/staff/complaints?status=IN_PROGRESS" className="bg-slate-50 hover:bg-sky-50 hover:border-sky-300 border border-slate-200 p-2 rounded-xl transition-all text-center group flex flex-col justify-center items-center">
                <div className="font-extrabold text-2xs text-sky-700 truncate w-full">INVESTIGATING</div>
                <div className="text-3xs text-slate-500 truncate w-full">Under Review</div>
              </Link>

              <Link to="/staff/complaints?status=READY_FOR_USER_RESPONSE" className="bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 p-2 rounded-xl transition-all text-center group flex flex-col justify-center items-center">
                <div className="font-extrabold text-2xs text-indigo-700 truncate w-full">READY DEPT</div>
                <div className="text-3xs text-slate-500 truncate w-full">Verified</div>
              </Link>

              <Link to="/staff/complaints?status=RESOLVED" className="bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 p-2 rounded-xl transition-all text-center group flex flex-col justify-center items-center">
                <div className="font-extrabold text-2xs text-emerald-700 truncate w-full">RESOLVED</div>
                <div className="text-3xs text-slate-500 truncate w-full">Dispatched</div>
              </Link>

              <Link to="/staff/complaints?status=ESCALATED" className="bg-slate-50 hover:bg-rose-50 hover:border-rose-300 border border-slate-200 p-2 rounded-xl transition-all text-center group flex flex-col justify-center items-center">
                <div className="font-extrabold text-2xs text-rose-700 truncate w-full">ESCALATED</div>
                <div className="text-3xs text-slate-500 truncate w-full">Admin Review</div>
              </Link>

              <Link to="/staff/admin/feedback" className="bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 p-2 rounded-xl transition-all text-center group flex flex-col justify-center items-center">
                <div className="font-extrabold text-2xs text-purple-700 truncate w-full">FEEDBACK</div>
                <div className="text-3xs text-slate-500 truncate w-full">Insights</div>
              </Link>
            </div>
          </div>

          {/* KPI Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <Link
              to="/staff/complaints"
              className="bg-white p-5 rounded-2xl border border-slate-200 custom-shadow hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer block"
              title="Click to view all complaints"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider group-hover:text-blue-600 transition-colors">Total</span>
                <Inbox className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">{stats.total}</p>
              <span className="text-2xs text-slate-500 font-medium">All Time Submissions</span>
            </Link>

            <Link
              to="/staff/complaints?status=SUBMITTED"
              className="bg-white p-5 rounded-2xl border border-slate-200 custom-shadow hover:border-amber-300 hover:shadow-md transition-all group cursor-pointer block"
              title="Click to view awaiting complaints"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider group-hover:text-amber-600 transition-colors">New</span>
                <Zap className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-extrabold text-amber-600">{stats.new}</p>
              <span className="text-2xs text-slate-500 font-medium">Awaiting Analyst Action</span>
            </Link>

            <Link
              to="/staff/complaints?priority=CRITICAL"
              className="bg-white p-5 rounded-2xl border border-slate-200 custom-shadow hover:border-rose-300 hover:shadow-md transition-all group cursor-pointer block"
              title="Click to view high-risk issues"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider group-hover:text-rose-600 transition-colors">Critical</span>
                <AlertTriangle className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-extrabold text-rose-600">{stats.critical}</p>
              <span className="text-2xs text-slate-500 font-medium">High Risk Issues</span>
            </Link>

            <Link
              to="/staff/complaints?status=IN_PROGRESS"
              className="bg-white p-5 rounded-2xl border border-slate-200 custom-shadow hover:border-sky-300 hover:shadow-md transition-all group cursor-pointer block"
              title="Click to view in-progress complaints"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider group-hover:text-sky-600 transition-colors">In Progress</span>
                <Clock className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-extrabold text-sky-600">{stats.inProgress}</p>
              <span className="text-2xs text-slate-500 font-medium">Under Investigation</span>
            </Link>

            <Link
              to="/staff/complaints?status=RESOLVED"
              className="bg-white p-5 rounded-2xl border border-slate-200 custom-shadow hover:border-emerald-300 hover:shadow-md transition-all group cursor-pointer block"
              title="Click to view resolved complaints"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider group-hover:text-emerald-600 transition-colors">Resolved</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-600">{stats.resolved}</p>
              <span className="text-2xs text-slate-500 font-medium">Responses Sent</span>
            </Link>

            <Link
              to="/staff/reports"
              className="bg-white p-5 rounded-2xl border border-slate-200 custom-shadow hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer block"
              title="Click to view performance reports"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider group-hover:text-indigo-600 transition-colors">Rate</span>
                <TrendingUp className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-extrabold text-indigo-600">{stats.resolutionRate}%</p>
              <span className="text-2xs text-slate-500 font-medium">Completion SLA</span>
            </Link>
          </div>

          {/* Visual Intelligence Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sentiment Analysis Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 custom-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center">
                  <PieIcon className="w-4 h-4 text-blue-600 mr-2" />
                  Sentiment Breakdown
                </h3>
                <span className="text-2xs font-semibold text-slate-400">Automated AI</span>
              </div>
              <div className="h-48">
                {analytics?.sentiment && analytics.sentiment.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.sentiment}
                        dataKey="count"
                        nameKey="sentiment"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        innerRadius={45}
                        paddingAngle={4}
                      >
                        {analytics.sentiment.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">No sentiment data</div>
                )}
              </div>
            </div>

            {/* Priority Distribution Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 custom-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center">
                  <BarChart2 className="w-4 h-4 text-amber-600 mr-2" />
                  Priority Distribution
                </h3>
                <span className="text-2xs font-semibold text-slate-400">AI Scoring</span>
              </div>
              <div className="h-48">
                {analytics?.priority && analytics.priority.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.priority}>
                      <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">No priority data</div>
                )}
              </div>
            </div>

            {/* Top Issue Themes Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 custom-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center">
                  <Flame className="w-4 h-4 text-rose-600 mr-2" />
                  Top Customer Themes
                </h3>
                <span className="text-2xs font-semibold text-slate-400">Clusters</span>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {analytics?.theme && analytics.theme.length > 0 ? (
                  analytics.theme.map((t, i) => (
                    <Link
                      key={i}
                      to={`/staff/complaints?search=${encodeURIComponent(t.theme)}`}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 text-xs transition-colors cursor-pointer block"
                      title={`Click to filter complaints by "${t.theme}"`}
                    >
                      <span className="font-semibold text-slate-800 truncate max-w-[180px]">{t.theme}</span>
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{t.count}</span>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-8">No themes extracted</p>
                )}
              </div>
            </div>

          </div>

          {/* Recent Complaints Table */}
          <div className="bg-white rounded-2xl border border-slate-200 custom-shadow overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Customer Complaints</h3>
                <p className="text-xs text-slate-500 mt-0.5">Click any record to inspect automated analysis and resolve.</p>
              </div>
              <Link
                to="/staff/complaints"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center"
              >
                <span>View Full Inbox</span>
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-2xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="py-3.5 px-6">Complaint ID</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Status</th>
                    {isAdmin && <th className="py-3.5 px-4">Assigned Analyst</th>}
                    <th className="py-3.5 px-4">Created</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {complaints.slice(0, 8).map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-blue-600">
                        {c.complaintNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {c.name}
                        <span className="block text-2xs font-normal text-slate-400">{c.email}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{c.category}</td>
                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.status} />
                      </td>
                      {isAdmin && (
                        <td className="py-3.5 px-4">
                          {c.assignedAnalystName ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-2xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              👤 {c.assignedAnalystName}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-2xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              ⚡ Unassigned
                            </span>
                          )}
                        </td>
                      )}
                      <td className="py-3.5 px-4 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="py-3.5 px-6 text-right">
                        <Link
                          to={`/staff/complaints/${c.id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition-colors text-2xs"
                        >
                          Review
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
