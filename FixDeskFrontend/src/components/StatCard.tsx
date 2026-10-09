import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple';
  trend?: string;
  isAlert?: boolean;
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    iconBg: 'bg-blue-600 text-white',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-900',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/50',
    iconBg: 'bg-indigo-600 text-white',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-900',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    iconBg: 'bg-emerald-600 text-white',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-900',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    iconBg: 'bg-amber-600 text-white',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-900',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/50',
    iconBg: 'bg-rose-600 text-white',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-900',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/50',
    iconBg: 'bg-purple-600 text-white',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-900',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  trend,
  isAlert = false,
}) => {
  const styles = colorMap[color];

  return (
    <div
      className={`relative p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-xs transition-all duration-200 hover:shadow-md ${
        styles.border
      } ${isAlert ? 'ring-2 ring-rose-500/50 animate-pulse' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {value}
            </h3>
            {trend && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
        <div className={`p-3.5 rounded-xl ${styles.iconBg} shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

