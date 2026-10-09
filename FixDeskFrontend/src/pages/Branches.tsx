import React, { useState, useEffect } from 'react';
import { Branch } from '../types';
import { initialBranches } from '../api/mockData';
import api from '../api/axios';
import { Building2, Plus, MapPin, Ticket, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const Branches: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get('/api/Branches');
        if (res.data && res.data.data) {
          setBranches(res.data.data);
        }
      } catch (err) {
        console.warn('Branches API offline, using mock data:', err);
      }
    };
    fetchBranches();
  }, []);

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.post('/api/Branches', { name, code, address });
    } catch (err) {
      console.warn('Branch POST error, adding locally:', err);
    }

    const newBranch: Branch = {
      id: Date.now(),
      name,
      code: code || `BR-${branches.length + 1}`,
      address: address || 'Ünvan daxil edilməyib',
      isActive: true,
      ticketCount: 0,
    };

    setBranches([...branches, newBranch]);
    setShowModal(false);
    setName('');
    setCode('');
    setAddress('');
    toast.success('Yeni filial uğurla yaradıldı!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Filiallar İdarəedilməsi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sistemdə qeydiyyatda olan bütün filiallar və onların müraciət aktivliyi
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Filial Əlavə Et</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {branches.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md">
                {b.code}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> Aktiv
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{b.name}</h3>

            {b.address && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {b.address}
              </p>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Ticket className="w-3.5 h-3.5 text-indigo-500" /> Toplam Ticket:
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{b.ticketCount || 0}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Yeni Filial Yarat</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBranch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Filialın Adı *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Məs: Şəki Filialı"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Filial Kodu (SKU)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="BR-SHEKI"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Ünvan
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="M.Ə. Rəsulzadə pr. 12"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white"
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
                  Yadda Saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

