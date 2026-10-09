import React from 'react';
import { TicketPriority, TicketStatus, TicketPriorityNames, TicketStatusNames } from '../types';
import { AlertTriangle, Clock, Flame, CheckCircle, ShieldAlert, XCircle } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TicketPriority | number;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const p = Number(priority);
  switch (p) {
    case TicketPriority.Urgent:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border border-red-200 dark:border-red-800">
          <Flame className="w-3 h-3 text-red-600 dark:text-red-400 animate-pulse" />
          {TicketPriorityNames[TicketPriority.Urgent]}
        </span>
      );
    case TicketPriority.High:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
          <AlertTriangle className="w-3 h-3 text-orange-600 dark:text-orange-400" />
          {TicketPriorityNames[TicketPriority.High]}
        </span>
      );
    case TicketPriority.Medium:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          {TicketPriorityNames[TicketPriority.Medium]}
        </span>
      );
    case TicketPriority.Low:
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          {TicketPriorityNames[TicketPriority.Low]}
        </span>
      );
  }
};

interface StatusBadgeProps {
  status: TicketStatus | number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const s = Number(status);
  switch (s) {
    case TicketStatus.New:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping"></span>
          {TicketStatusNames[TicketStatus.New]}
        </span>
      );
    case TicketStatus.InProgress:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
          {TicketStatusNames[TicketStatus.InProgress]}
        </span>
      );
    case TicketStatus.PendingApproval:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          {TicketStatusNames[TicketStatus.PendingApproval]}
        </span>
      );
    case TicketStatus.Resolved:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          {TicketStatusNames[TicketStatus.Resolved]}
        </span>
      );
    case TicketStatus.Closed:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {TicketStatusNames[TicketStatus.Closed]}
        </span>
      );
    case TicketStatus.Cancelled:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          {TicketStatusNames[TicketStatus.Cancelled]}
        </span>
      );
    default:
      return <span className="text-xs">{s}</span>;
  }
};

interface SlaBadgeProps {
  isBreached: boolean;
  dueDate?: string;
}

export const SlaBadge: React.FC<SlaBadgeProps> = ({ isBreached, dueDate }) => {
  if (isBreached) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-rose-600 text-white shadow-sm animate-pulse">
        <ShieldAlert className="w-3.5 h-3.5" />
        SLA Keçib!
      </span>
    );
  }

  if (!dueDate) return null;

  const due = new Date(dueDate).getTime();
  const now = Date.now();
  const diffMs = due - now;

  if (diffMs <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-rose-600 text-white shadow-sm">
        <ShieldAlert className="w-3.5 h-3.5" />
        SLA Keçib!
      </span>
    );
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const isWarning = hours < 1;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${
        isWarning
          ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
          : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
      }`}
    >
      <Clock className="w-3 h-3" />
      {hours > 0 ? `${hours}s ${mins}dəq` : `${mins} dəq qalıb`}
    </span>
  );
};

