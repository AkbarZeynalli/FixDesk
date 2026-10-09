import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { initialCategories } from '../api/mockData';
import api from '../api/axios';
import { FolderTree, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/api/Categories');
        if (res.data && res.data.data) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.warn('Categories API offline, using mock data:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.post('/api/Categories', { name, description });
    } catch (err) {
      console.warn('Categories POST error, adding locally:', err);
    }

    const newCat: Category = {
      id: Date.now(),
      name,
      description: description || 'Kateqoriya təsviri daxil edilməyib',
      isActive: true,
      ticketCount: 0,
    };

    setCategories([...categories, newCat]);
    setShowModal(false);
    setName('');
    setDescription('');
    toast.success('Yeni kateqoriya əlavə edildi!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Kateqoriyaların İdarə Edilməsi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hardware, Software, Network və digər texniki müraciət kateqoriyalarının idarəsi
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Kateqoriya</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <FolderTree className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 font-mono">ID: {c.id}</span>
            </div>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{c.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {c.description}
            </p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Yeni Kateqoriya Yarat</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Kateqoriya Adı *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Məs: Təhlükəsizlik və VPN"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Təsviri
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Bu kateqoriyaya hansı məsələlər daxildir..."
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

