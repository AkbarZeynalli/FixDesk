import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Ticket, TicketStatus, TicketComment, UserRole } from '../types';
import { initialTickets, initialUsers } from '../api/mockData';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSignalR } from '../context/SignalRContext';
import { PriorityBadge, StatusBadge, SlaBadge } from '../components/TicketBadge';
import {
  ArrowLeft,
  UserCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  Send,
  Building2,
  FolderTree,
  User as UserIcon,
  ShieldCheck,
  Check,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const { joinTicketGroup, leaveTicketGroup, onReceiveComment, onReceiveStatusUpdate, isConnected } = useSignalR();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  // Specialist assign state
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<number>(2);

  // Status update state
  const [newStatus, setNewStatus] = useState<number>(1);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Comment post state
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await api.get(`/api/Tickets/${id}`);
        if (response.data && response.data.data) {
          const t = response.data.data;
          setTicket(t);
          setNewStatus(t.status);
          if (t.assignedUserId) setSelectedSpecialistId(t.assignedUserId);
          if (t.resolutionNotes) setResolutionNotes(t.resolutionNotes);
        }
      } catch (err) {
        console.warn('Backend API /api/Tickets/{id} call failed, using mock data:', err);
        const found = initialTickets.find((t) => String(t.id) === id);
        if (found) {
          setTicket(found);
          setNewStatus(found.status);
          if (found.assignedUserId) setSelectedSpecialistId(found.assignedUserId);
          if (found.resolutionNotes) setResolutionNotes(found.resolutionNotes);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  // SignalR Room Subscription & Live Updates
  useEffect(() => {
    if (!ticket) return;

    const ticketNumId = Number(ticket.id);
    joinTicketGroup(ticketNumId);

    // Listen to incoming live comments
    const unsubscribeComment = onReceiveComment((incomingComment: TicketComment) => {
      setTicket((prevTicket) => {
        if (!prevTicket) return prevTicket;
        const exists = prevTicket.comments?.some((c) => c.id === incomingComment.id);
        if (exists) return prevTicket;
        return {
          ...prevTicket,
          comments: [...(prevTicket.comments || []), incomingComment],
        };
      });
      toast.success(`⚡ Yeni şərh: ${incomingComment.userName}`);
    });

    // Listen to incoming status updates
    const unsubscribeStatus = onReceiveStatusUpdate((updatedTicket: Ticket) => {
      setTicket((prevTicket) => {
        if (!prevTicket) return prevTicket;
        return {
          ...prevTicket,
          status: updatedTicket.status,
          resolutionNotes: updatedTicket.resolutionNotes || prevTicket.resolutionNotes,
          resolvedDate: updatedTicket.resolvedDate || prevTicket.resolvedDate,
        };
      });
      setNewStatus(updatedTicket.status);
      if (updatedTicket.resolutionNotes) setResolutionNotes(updatedTicket.resolutionNotes);
      toast.success('⚡ Müraciətin statusu canlı yeniləndi!');
    });

    return () => {
      leaveTicketGroup(ticketNumId);
      unsubscribeComment();
      unsubscribeStatus();
    };
  }, [ticket?.id]);

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Müraciət Tapılmadı</h2>
        <p className="text-slate-500">Daxil etdiyiniz ID üzrə müraciət mövcud deyil.</p>
        <Link to="/tickets" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Müraciətlərə Qayıt
        </Link>
      </div>
    );
  }

  // Handle assign IT specialist
  const handleAssignSpecialist = async () => {
    try {
      await api.put(`/api/Tickets/${ticket.id}/assign`, { specialistUserId: selectedSpecialistId });
      toast.success('İcraçı mütəxəssis təyin olundu!');
    } catch (err) {
      console.warn('Backend assign failed, updating local state:', err);
    }

    const assignedUser = initialUsers.find((u) => u.id === Number(selectedSpecialistId));
    setTicket({
      ...ticket,
      assignedUserId: Number(selectedSpecialistId),
      assignedUserName: assignedUser?.fullName || 'İT Mütəxəssis',
    });
    toast.success('İcraçı mütəxəssis yeniləndi');
  };

  // Handle status update
  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(newStatus) === TicketStatus.Resolved && !resolutionNotes.trim()) {
      toast.error('Həll olundu statusu üçün həll qeydlərini (Resolution Notes) yazmalısınız');
      return;
    }

    try {
      await api.put(`/api/Tickets/${ticket.id}/status`, {
        status: Number(newStatus),
        resolutionNotes,
      });
      toast.success('Müraciət statusu yeniləndi');
    } catch (err) {
      console.warn('Backend status update failed, updating local state:', err);
    }

    setTicket({
      ...ticket,
      status: Number(newStatus),
      resolutionNotes,
      resolvedDate: Number(newStatus) === TicketStatus.Resolved ? new Date().toISOString() : ticket.resolvedDate,
    });
    toast.success('Müraciət statusu uğurla saxlanıldı');
  };

  // Handle post comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    const newCommentObj: TicketComment = {
      id: Date.now(),
      ticketId: ticket.id,
      userId: user?.id || 1,
      userName: user?.fullName || 'İstifadəçi',
      commentText,
      createdDate: new Date().toISOString(),
    };

    try {
      await api.post(`/api/Tickets/${ticket.id}/comments`, { commentText });
    } catch (err) {
      console.warn('Backend post comment error, updating locally:', err);
    }

    const updatedComments = [...(ticket.comments || []), newCommentObj];
    setTicket({ ...ticket, comments: updatedComments });
    setCommentText('');
    setSubmittingComment(false);
    toast.success('Şərh əlavə edildi');
  };

  const isITOrAdmin = hasRole([UserRole.Admin, UserRole.ITSpecialist, UserRole.FieldEngineer]);

  return (
    <div className="space-y-6">
      {/* Header Back Button & Code Title */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/tickets')}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {ticket.ticketCode}
              </span>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
              {isConnected && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800" title="SignalR Canlı Bağlantı Aktivdir">
                  <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500 animate-pulse" />
                  Live Chat
                </span>
              )}
            </div>
            <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {ticket.title}
            </h1>
          </div>
        </div>
        <div>
          <SlaBadge isBreached={ticket.isSlaBreached} dueDate={ticket.slaDueDate} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Details & Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Description Box */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Müraciətin Təsviri
            </h2>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
              {ticket.description}
            </div>

            {/* Resolution Notes Box if resolved */}
            {ticket.resolutionNotes && (
              <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-900 p-4 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Həll Qeydi (Resolution Notes):
                </div>
                <p className="text-sm text-emerald-900 dark:text-emerald-200">
                  {ticket.resolutionNotes}
                </p>
                {ticket.resolvedDate && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                    Həll tarixi: {new Date(ticket.resolvedDate).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Müzakirə və Canlı Şərhlər ({ticket.comments?.length || 0})
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">Real-time SignalR active</span>
            </div>

            {/* Comment List */}
            <div className="space-y-3">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((c) => (
                  <div
                    key={c.id}
                    className="flex gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3.5"
                  >
                    <div className="h-8 w-8 shrink-0 rounded-full bg-indigo-600/10 text-indigo-600 font-bold flex items-center justify-center text-xs">
                      {c.userName.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {c.userName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(c.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line">
                        {c.commentText}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">Hələ heç bir şərh yazılmayıb.</p>
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handlePostComment} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Şərhinizi bura qeyd edin..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Göndər</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Control Panel & Metadata */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4 text-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Müraciət Məlumatları
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4 text-slate-400" /> Göndərən Əməkdaş:
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {ticket.createdUserName || 'Əməkdaş'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" /> Filial:
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {ticket.branchName || 'Baş Ofis'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <FolderTree className="w-4 h-4 text-slate-400" /> Kateqoriya:
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {ticket.categoryName}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-500" /> İcraçı Mütəxəssis:
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {ticket.assignedUserName || 'Təyin edilməyib'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" /> Yaradılma Tarixi:
                </span>
                <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                  {new Date(ticket.createdDate).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Management Controls for Admin / IT Specialist */}
          {isITOrAdmin && (
            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-slate-900 p-5 shadow-xs space-y-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  İT İdarəetmə Paneli
                </h3>
              </div>

              {/* Assign Specialist Form */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  İcraçı Mütəxəssis Təyin Et
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedSpecialistId}
                    onChange={(e) => setSelectedSpecialistId(Number(e.target.value))}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:border-indigo-500"
                  >
                    {initialUsers
                      .filter((u) => u.role === UserRole.ITSpecialist || u.role === UserRole.Admin)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={handleAssignSpecialist}
                    className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-all cursor-pointer"
                  >
                    Təyin Et
                  </button>
                </div>
              </div>

              {/* Change Status Form */}
              <form onSubmit={handleStatusUpdate} className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Statusu Yenilə
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:border-indigo-500"
                >
                  <option value={TicketStatus.New}>Yeni (New)</option>
                  <option value={TicketStatus.InProgress}>İcrada (InProgress)</option>
                  <option value={TicketStatus.PendingApproval}>Təsdiq Gözləyir (PendingApproval)</option>
                  <option value={TicketStatus.Resolved}>Həll Olundu (Resolved)</option>
                  <option value={TicketStatus.Closed}>Bağlandı (Closed)</option>
                  <option value={TicketStatus.Cancelled}>Ləğv Edildi (Cancelled)</option>
                </select>

                {/* Resolution Notes required when Resolved */}
                {Number(newStatus) === TicketStatus.Resolved && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      Həll Qeydləri (Resolution Notes) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Nasazlığın necə aradan qaldırıldığını qeyd edin..."
                      className="w-full rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 dark:bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Statusu Yadda Saxla</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
