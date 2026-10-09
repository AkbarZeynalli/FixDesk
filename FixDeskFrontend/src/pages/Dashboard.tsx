import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { DashboardSummary } from '../types';
import { mockDashboardSummary, initialTickets } from '../api/mockData';
import { StatCard } from '../components/StatCard';
import { PriorityBadge, StatusBadge, SlaBadge } from '../components/TicketBadge';
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertTriangle,
  Flame,
  Building2,
  FolderTree,
  UserCheck,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary>(mockDashboardSummary);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/api/Dashboard/summary');
        if (response.data && response.data.data) {
          setSummary(response.data.data);
        }
      } catch (err) {
        console.warn('Backend API Dashboard not reached, using mock summary data:', err);
        setSummary(mockDashboardSummary);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const breachedTicketsList = initialTickets.filter((t) => t.isSlaBreached);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            İdarəetmə Paneli (Dashboard)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real vaxt rejimində müraciət statistikası, SLA izləməsi və İT performans analitikası
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
        >
          <Flame className="w-4 h-4 text-amber-300" />
          <span>Yeni Müraciət Yarat</span>
        </Link>
      </div>

      {/* SLA Alert Banner if any breached tickets */}
      {summary.slaBreachedTickets > 0 && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-900 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-rose-600 p-2 text-white">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                Xəbərdarlıq: {summary.slaBreachedTickets} Müraciətin SLA Müddəti Keçib!
              </h3>
              <p className="mt-0.5 text-xs text-rose-700 dark:text-rose-300">
                Aşağıdakı müraciətlər təyin olunmuş son icra müddətini keçib və təcili müdaxilə tələb edir:
              </p>
              <div className="mt-3 space-y-2">
                {breachedTicketsList.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 p-2.5 border border-rose-200 dark:border-rose-900/60 shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                        {ticket.ticketCode}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {ticket.title}
                      </span>
                      <span className="text-xs text-slate-500">({ticket.branchName})</span>
                    </div>
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      Bax <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Ümumi Müraciətlər"
          value={summary.totalTickets}
          subtitle="Sistemdəki bütün müraciətlər"
          icon={Ticket}
          color="indigo"
        />
        <StatCard
          title="Yeni Müraciətlər"
          value={summary.openTickets}
          subtitle="Baxılma gözləyir"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="İcrada Olanlar"
          value={summary.inProgressTickets}
          subtitle="İT Mütəxəssis işləyir"
          icon={FolderTree}
          color="amber"
        />
        <StatCard
          title="Həll Olunanlar"
          value={summary.resolvedTickets}
          subtitle="Uğurla tamamlanan"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="SLA Gecikənlər"
          value={summary.slaBreachedTickets}
          subtitle="Müddəti aşmış"
          icon={AlertTriangle}
          color="rose"
          isAlert={summary.slaBreachedTickets > 0}
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Branch Ticket Distribution Chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Filiallar Üzrə Müraciət Bölgüsü
              </h2>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.branchStatistics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="branchName" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" name="Müraciət Sayı" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Kateqoriyalar Üzrə Statistik
              </h2>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.categoryStatistics}
                  dataKey="count"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={5}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                  }
                >
                  {summary.categoryStatistics.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* IT Specialist Performance Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            İT Mütəxəssislərinin Performansı və Orta Həll Vaxtı
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">İT Mütəxəssis</th>
                <th className="px-4 py-3 text-center">Təyin Edilmiş</th>
                <th className="px-4 py-3 text-center">Həll Olunan</th>
                <th className="px-4 py-3 text-right">Orta Həll Müddəti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {summary.specialistPerformances.map((spec) => (
                <tr key={spec.specialistId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {spec.specialistName}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-indigo-600 dark:text-indigo-400">
                    {spec.assignedCount}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                    {spec.resolvedCount}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium">
                    {spec.avgResolutionTimeHours} saat
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

