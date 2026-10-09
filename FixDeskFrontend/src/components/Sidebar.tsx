import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  BookOpen,
  Boxes,
  Building2,
  FolderTree,
  Users,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  title: string;
  path: string;
  icon: React.ElementType;
  roles?: (UserRole | number)[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Müraciətlər',
    path: '/tickets',
    icon: Ticket,
  },
  {
    title: 'Yeni Müraciət',
    path: '/tickets/new',
    icon: PlusCircle,
  },
  {
    title: 'Bilik Bazası (FAQ)',
    path: '/knowledge-base',
    icon: BookOpen,
  },
  {
    title: 'İnventar və Anbar',
    path: '/inventory',
    icon: Boxes,
    roles: [UserRole.Admin, UserRole.ITSpecialist, UserRole.FieldEngineer, UserRole.InventoryManager],
  },
  {
    title: 'Filiallar',
    path: '/branches',
    icon: Building2,
    roles: [UserRole.Admin, UserRole.BranchManager],
  },
  {
    title: 'Kateqoriyalar',
    path: '/categories',
    icon: FolderTree,
    roles: [UserRole.Admin],
  },
  {
    title: 'İstifadəçilər',
    path: '/users',
    icon: Users,
    roles: [UserRole.Admin],
  },
];

export const Sidebar: React.FC = () => {
  const { hasRole } = useAuth();

  return (
    <aside className="w-64 shrink-0 hidden md:block bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-4rem)] p-4 transition-colors duration-200">
      <div className="mb-4 px-3 py-2 text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
        Əsas Menyu
      </div>
      <nav className="space-y-1.5">
        {navItems.map((item) => {
          if (item.roles && !hasRole(item.roles)) {
            return null;
          }

          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={true}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-slate-100 hover:bg-indigo-50/70 dark:hover:bg-slate-800/80'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.title}</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
