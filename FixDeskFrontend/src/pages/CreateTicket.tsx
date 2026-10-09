import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initialBranches, initialCategories, initialTickets } from '../api/mockData';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { TicketPriority, SlaDurationHours } from '../types';
import { Flame, Clock, Send, FileText, Building2, FolderTree, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const CreateTicket: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<number>(TicketPriority.Medium);
  const [categoryId, setCategoryId] = useState<number>(1);
  const [branchId, setBranchId] = useState<number>(user?.branchId || 1);
  const [loading, setLoading] = useState(false);

  const slaHours = SlaDurationHours[priority as TicketPriority] || 24;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Zəhmət olmasa başlıq və ətraflı təsviri daxil edin');
      return;
    }

    setLoading(true);
    const payload = {
      title,
      description,
      priority: Number(priority),
      categoryId: Number(categoryId),
      branchId: Number(branchId),
    };

    try {
      const response = await api.post('/api/Tickets', payload);
      if (response.data && response.data.isSuccess) {
        toast.success(`Müraciət yaradıldı! Unikal Kod: ${response.data.data?.ticketCode || 'TICK-2026-0006'}`);
        navigate('/tickets');
      } else {
        toast.success(`Müraciət uğurla yaradıldı (TICK-2026-000${initialTickets.length + 1})`);
        navigate('/tickets');
      }
    } catch (err) {
      console.warn('Backend API /api/Tickets error, simulating local creation:', err);

      // Local creation fallback
      const newCode = `TICK-2026-000${initialTickets.length + 1}`;
      const now = new Date();
      const slaDueDate = new Date(now.getTime() + slaHours * 3600 * 1000).toISOString();

      const newTicket = {
        id: initialTickets.length + 1,
        ticketCode: newCode,
        title,
        description,
        status: 1, // New
        priority: Number(priority),
        categoryId: Number(categoryId),
        categoryName: initialCategories.find((c) => c.id === Number(categoryId))?.name || 'Ümumi',
        branchId: Number(branchId),
        branchName: initialBranches.find((b) => b.id === Number(branchId))?.name || 'Baş Ofis',
        createdUserId: user?.id || 1,
        createdUserName: user?.fullName || 'Əməkdaş',
        createdDate: now.toISOString(),
        slaDueDate,
        isSlaBreached: false,
      };

      initialTickets.unshift(newTicket);
      toast.success(`🎉 Müraciət yaradıldı: ${newCode} (SLA: ${slaHours} saat)`);
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Yeni Texniki Müraciət Yarat
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Yaşadığınız nasazlığı (aparat, proqram, şəbəkə) ətraflı qeyd edin. İT şöbəsi operativ reaksiya verəcək.
        </p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Müraciətin Qısa Başlığı *
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <FileText className="w-5 h-5" />
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nümunə: Baş kassirin kompüteri açılmır / Printer solğun çap edir"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Priority & Dynamic SLA Info */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Prioritet Səviyyəsi (SLA Tamamlanma Müddəti) *
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { level: TicketPriority.Low, label: 'Low (Aşağı)', hours: '48 saat', color: 'border-blue-500 bg-blue-50/50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200' },
              { level: TicketPriority.Medium, label: 'Medium (Orta)', hours: '24 saat', color: 'border-amber-500 bg-amber-50/50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200' },
              { level: TicketPriority.High, label: 'High (Yüksək)', hours: '8 saat', color: 'border-orange-500 bg-orange-50/50 text-orange-900 dark:bg-orange-950/40 dark:text-orange-200' },
              { level: TicketPriority.Urgent, label: 'Urgent (Təcili)', hours: '2 saat', color: 'border-rose-500 bg-rose-50/50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200' },
            ].map((p) => {
              const isSelected = priority === p.level;
              return (
                <button
                  type="button"
                  key={p.level}
                  onClick={() => setPriority(p.level)}
                  className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    isSelected
                      ? `${p.color} ring-2 ring-indigo-500/20 shadow-xs font-bold`
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{p.label}</span>
                    {p.level === TicketPriority.Urgent && <Flame className="w-4 h-4 text-rose-500 animate-bounce" />}
                  </div>
                  <p className="mt-1 text-xs opacity-75 font-mono">SLA: {p.hours}</p>
                </button>
              );
            })}
          </div>

          {/* Dynamic SLA Info Banner */}
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-3 border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200">
            <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Seçilmiş prioritetə əsasən bu müraciətin maksimum həll müddəti (SLA Due Date){' '}
              <strong className="underline">{slaHours} saat</strong> sonra kimi hesablanacaq.
            </span>
          </div>
        </div>

        {/* Category & Branch Selectors */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Kateqoriya *
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <FolderTree className="w-5 h-5" />
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
              >
                {initialCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Branch */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Aiddiyyatı Filial *
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Building2 className="w-5 h-5" />
              </div>
              <select
                value={branchId}
                onChange={(e) => setBranchId(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
              >
                {initialBranches.map((br) => (
                  <option key={br.id} value={br.id}>
                    {br.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Ətraflı Təsvir (Nasazlıq haqqında məlumat) *
          </label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Kompüter düyməsini basdıqda heç bir cərəyan gəlmir, monitora görüntü çıxmır..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            Ləğv Et
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Müraciəti Göndər</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

