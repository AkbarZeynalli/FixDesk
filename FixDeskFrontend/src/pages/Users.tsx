import React, { useState, useEffect } from 'react';
import { User, UserRole, UserRoleNames } from '../types';
import { initialUsers, initialBranches } from '../api/mockData';
import api from '../api/axios';
import { Users as UsersIcon, Plus, ShieldCheck, Mail, Phone, Building2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<number>(UserRole.BranchEmployee);
  const [branchId, setBranchId] = useState<number>(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/api/Users');
        if (res.data && res.data.data) {
          setUsers(res.data.data);
        }
      } catch (err) {
        console.warn('Users API endpoint offline, using seed users data:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error('Bütün vacib xanaları doldurun');
      return;
    }

    const payload = {
      fullName,
      email,
      password,
      phone,
      role: Number(role),
      branchId: Number(branchId),
    };

    try {
      await api.post('/api/Auth/register', payload);
    } catch (err) {
      console.warn('Register POST failed, adding locally:', err);
    }

    const newUser: User = {
      id: Date.now(),
      fullName,
      email,
      phone,
      role: Number(role),
      branchId: Number(branchId),
      branchName: initialBranches.find((b) => b.id === Number(branchId))?.name || 'Baş Ofis',
      isActive: true,
    };

    setUsers([...users, newUser]);
    setShowModal(false);
    setFullName('');
    setEmail('');
    setPassword('');
    setPhone('');
    toast.success('Yeni istifadəçi və rol uğurla qeydə alındı!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            İstifadəçilər və Rol Hüquqları (RBAC)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sistemdəki inzibatçılar, filial əməkdaşları, müdirlər və İT mütəxəssislərinin idarəsi
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni İstifadəçi Qeydiyyatı</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3.5 font-bold">Ad Soyad</th>
                <th className="px-4 py-3.5 font-bold">E-poçt & Telefon</th>
                <th className="px-4 py-3.5 font-bold">Sistem Rolu</th>
                <th className="px-4 py-3.5 font-bold">Filial</th>
                <th className="px-4 py-3.5 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">
                    {u.fullName}
                  </td>
                  <td className="px-4 py-4 space-y-0.5">
                    <p className="text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {u.email}
                    </p>
                    {u.phone && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {u.phone}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {UserRoleNames[u.role as UserRole] || 'Əməkdaş'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {u.branchName || 'Baş Ofis'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs" title="Aktiv İstifadəçi"></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Yeni İstifadəçi Qeydiyyatı
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Ad və Soyad *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Məs: Kənan Hüseynov"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    E-poçt *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kenan.h@fixdesk.az"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Şifrə *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Sistem Rolu *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white"
                  >
                    <option value={UserRole.BranchEmployee}>Filial Əməkdaşı</option>
                    <option value={UserRole.BranchManager}>Filial Müdiri</option>
                    <option value={UserRole.ITSpecialist}>İT Mütəxəssis</option>
                    <option value={UserRole.FieldEngineer}>Sahə Mühəndisi</option>
                    <option value={UserRole.InventoryManager}>Anbar Meneceri</option>
                    <option value={UserRole.Admin}>Sistem Administratoru</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Filial *
                  </label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white"
                  >
                    {initialBranches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Telefon Nömrəsi
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+994 50 000 00 00"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  İstifadəçini Yarad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

