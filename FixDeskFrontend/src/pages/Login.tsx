import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Headset, ShieldCheck, Sun, Moon, UserCheck } from 'lucide-react';
import { UserRole, UserRoleNames } from '../types';
import { initialUsers } from '../api/mockData';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@fixdesk.az');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Zəhmət olmasa email və şifrəni daxil edin');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast.success('Xoş gəldiniz! Sistemə uğurla daxil oldunuz.');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Giriş məlumatları yanlışdır');
    }
  };

  const handleQuickFillRole = (targetEmail: string) => {
    setEmail(targetEmail);
    setPassword('Admin123!');
    toast.success(`${targetEmail} seçildi`);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 transition-colors duration-200">
      {/* Theme Toggle Top Right */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 p-2.5 text-slate-600 dark:text-slate-300 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:scale-105 transition-all cursor-pointer"
        title="Rejimi dəyiş"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
      </button>

      <div className="w-full max-w-xl space-y-6 rounded-3xl bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl border border-slate-200 dark:border-slate-800">
        {/* Header Branding */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/30">
            <Headset className="h-8 w-8" />
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Fix<span className="text-indigo-600 dark:text-indigo-400">Desk</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Korporativ Texniki Dəstək Sistemi • Rol Təcrübəsi (RBAC)
          </p>
        </div>

        {/* Demo Roles Quick Selection Box */}
        <div className="rounded-2xl bg-indigo-50/60 dark:bg-slate-900/80 p-4 border border-indigo-200 dark:border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Sürətli Giriş Hesabları (Bütün 6 Rol):
            </span>
            <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">Şifrə: Admin123!</span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {initialUsers.map((u) => {
              const isSelected = email.toLowerCase() === u.email.toLowerCase();
              const roleTitle = UserRoleNames[u.role as UserRole] || 'İstifadəçi';
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickFillRole(u.email)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold truncate">{roleTitle}</span>
                    {isSelected && <UserCheck className="w-3.5 h-3.5 shrink-0 text-white" />}
                  </div>
                  <p className="text-[10px] opacity-80 truncate mt-0.5">{u.fullName.split(' ')[0]}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              E-poçt Ünvanı
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fixdesk.az"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Şifrə
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span>Seçilmiş Hesabla Sistemə Giriş Et</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 pt-1">
          FixDesk ITSM v1.0 • Multi-Role RBAC Authorized
        </div>
      </div>
    </div>
  );
};
