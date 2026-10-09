import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: (UserRole | number)[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Yüklənir...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center p-6 text-center">
        <div className="rounded-full bg-rose-100 p-4 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Giriş Məhdudlaşdırılıb</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md">
          Sizin bu səhifəyə baxmaq üçün kifayət qədər icazəniz (rolunuz) yoxdur. Zəhmət olmasa sistem administratoruna müraciət edin.
        </p>
      </div>
    );
  }

  return <Outlet />;
};

