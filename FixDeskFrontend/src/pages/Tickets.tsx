import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus, TicketPriority, UserRole } from '../types';
import { initialTickets, initialBranches } from '../api/mockData';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge, StatusBadge, SlaBadge } from '../components/TicketBadge';
import { Search, Plus, Eye, RotateCcw, ShieldAlert, Building2, User as UserIcon, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Tickets: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get('/api/Tickets');
        if (response.data && response.data.data) {
          setTickets(response.data.data);
        }
      } catch (err) {
        console.warn('Backend API /api/Tickets offline or not responding, using mock list:', err);
      }
    };
    fetchTickets();
  }, []);

  const userRoleNum = Number(user?.role || 3);
  const userBranchId = Number(user?.branchId || 1);

  // Data Isolation Filtering based on User Role & Branch
  const roleFilteredTickets = tickets.filter((t) => {
    if (userRoleNum === UserRole.BranchEmployee) {
      // Branch Employee: Only see their OWN created tickets
      return t.createdUserId === user?.id;
    }
    if (userRoleNum === UserRole.BranchManager) {
      // Branch Manager: Only see tickets belonging to THEIR branch
      return t.branchId === userBranchId;
    }
    if (userRoleNum === UserRole.ITSpecialist || userRoleNum === UserRole.FieldEngineer) {
      // IT Specialist / Field Engineer: Assigned to them OR New unassigned tickets
      return t.assignedUserId === user?.id || t.status === TicketStatus.New;
    }
    // Admin & InventoryManager: See all tickets
    return true;
  });

  // Search & Filter Toolbar filtering
  const filteredTickets = roleFilteredTickets.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketCode.toLowerCase().includes(search.toLowerCase()) ||
      (t.createdUserName && t.createdUserName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = selectedStatus ? String(t.status) === selectedStatus : true;
    const matchesPriority = selectedPriority ? String(t.priority) === selectedPriority : true;
    const matchesCategory = selectedCategory ? String(t.categoryId) === selectedCategory : true;
    const matchesBranch = selectedBranch ? String(t.branchId) === selectedBranch : true;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesBranch;
  });

  const handleResetFilters = () => {
    setSearch('');
    setSelectedStatus('');
    setSelectedPriority('');
    setSelectedCategory('');
    setSelectedBranch('');
  };

  // Scope Info Message Banner
  const renderScopeBanner = () => {
    if (userRoleNum === UserRole.BranchEmployee) {
      return (
        <div className="flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-3 border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200">
          <UserIcon className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            🔒 <strong>Şəxsi İzolasiya Baxışı:</strong> Yalnız sizin şəxsən yaratdığınız müraciətlər göstərilir. Digər filial və ya əməkdaşların məlumatları məxfidir.
          </span>
        </div>
      );
    }
    if (userRoleNum === UserRole.BranchManager) {
      return (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200">
          <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            🏢 <strong>Filial Müdiri Baxışı:</strong> Yalnız sizin filialınıza (<strong>{user?.branchName || 'Baş Ofis'}</strong>) aid müraciətlər göstərilir.
          </span>
        </div>
      );
    }
    if (userRoleNum === UserRole.ITSpecialist || userRoleNum === UserRole.FieldEngineer) {
      return (
        <div className="flex items-center gap-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 p-3 border border-purple-200 dark:border-purple-900/60 text-xs text-purple-900 dark:text-purple-200">
          <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0" />
          <span>
            🛠️ <strong>İT Mütəxəssis Baxışı:</strong> Sizə təyin olunmuş və icra gözləyən yeni (New) müraciətlər göstərilir.
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 p-3 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
        <Lock className="w-4 h-4 text-indigo-500 shrink-0" />
        <span>
          👑 <strong>Sistem Administratoru Baxışı:</strong> Bütün filialların və əməkdaşların müraciətləri göstərilir.
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Müraciətlər Siyahısı (Tickets)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Daxil olan texniki dəstək sorğuları və onların icra vəziyyəti
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Müraciət Yaradın</span>
        </Link>
      </div>

      {/* Scope Banner */}
      {renderScopeBanner()}

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Kod, başlıq və ya göndərən ilə axtar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Bütün Statuslar</option>
            <option value={TicketStatus.New}>Yeni (New)</option>
            <option value={TicketStatus.InProgress}>İcrada (InProgress)</option>
            <option value={TicketStatus.Resolved}>Həll Olundu (Resolved)</option>
            <option value={TicketStatus.Closed}>Bağlandı (Closed)</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Bütün Prioritetlər</option>
            <option value={TicketPriority.Urgent}>Urgent (Təcili - 2s)</option>
            <option value={TicketPriority.High}>High (Yüksək - 8s)</option>
            <option value={TicketPriority.Medium}>Medium (Orta - 24s)</option>
            <option value={TicketPriority.Low}>Low (Aşağı - 48s)</option>
          </select>

          {/* Branch Filter */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Bütün Filiallar</option>
            {initialBranches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button if any applied */}
        {(search || selectedStatus || selectedPriority || selectedCategory || selectedBranch) && (
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="text-xs text-slate-500">
              {filteredTickets.length} müraciət tapıldı
            </span>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Filtrləri Sıfırla
            </button>
          </div>
        )}
      </div>

      {/* Tickets Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3.5 font-bold">Kod</th>
                <th className="px-4 py-3.5 font-bold">Müraciətin Başlığı</th>
                <th className="px-4 py-3.5 font-bold">Filial & Kateqoriya</th>
                <th className="px-4 py-3.5 font-bold">Prioritet</th>
                <th className="px-4 py-3.5 font-bold">Status</th>
                <th className="px-4 py-3.5 font-bold">SLA / Müddət</th>
                <th className="px-4 py-3.5 font-bold text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                    Axtarış meyarlarına və icazələrinizə uyğun müraciət tapılmadı.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {ticket.ticketCode}
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
                      >
                        {ticket.title}
                      </Link>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Göndərən: {ticket.createdUserName || 'İstifadəçi'}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {ticket.branchName || 'Baş Ofis'}
                      </p>
                      <p className="text-xs text-slate-400">{ticket.categoryName}</p>
                    </td>
                    <td className="px-4 py-4">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-4">
                      <SlaBadge isBreached={ticket.isSlaBreached} dueDate={ticket.slaDueDate} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detallar</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
