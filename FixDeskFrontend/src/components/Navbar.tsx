import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserRoleNames, UserRole } from '../types';
import {
  Bell,
  LogOut,
  User as UserIcon,
  Building2,
  ShieldCheck,
  Plus,
  Sun,
  Moon,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Sistemdən çıxış edildi');
    navigate('/login');
  };

  const roleName = user ? UserRoleNames[user.role as UserRole] || 'İstifadəçi' : '';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 md:px-6 backdrop-blur-md transition-all">
      {/* Brand / Title Mobile & Desktop */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-extrabold shadow-md shadow-indigo-500/20">
            FD
          </div>
          <span className="hidden sm:inline-block tracking-tight text-xl">
            Fix<span className="text-indigo-600 dark:text-indigo-400">Desk</span>
          </span>
        </Link>
        {user?.branchName && (
          <span className="hidden md:inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
            {user.branchName}
          </span>
        )}
      </div>

      {/* Right Side Tools & User Profile */}
      <div className="flex items-center gap-3">
        <Link
          to="/tickets/new"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Müraciət</span>
        </Link>

        {/* Theme Toggle Button (Light / Dark mode switch) */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-amber-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title={theme === 'dark' ? 'Ağ rejiminə keç (Light mode)' : 'Tünd rejiminə keç (Dark mode)'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={() => toast('Yeni bildiriş yoxdur', { icon: '🔔' })}
          className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Bildirişlər"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900"></span>
        </button>

        {/* User Info Badge */}
        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-3">
          <div className="hidden text-right lg:block">
            <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
              {user?.fullName || 'İstifadəçi'}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-3 h-3" />
              {roleName}
            </span>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700">
            <UserIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Sistemdən Çıxış"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
