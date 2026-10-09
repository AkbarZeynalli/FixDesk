import React, { useState, useEffect } from 'react';
import { KnowledgeBaseArticle } from '../types';
import { initialKnowledgeBase, initialCategories } from '../api/mockData';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { BookOpen, Search, Eye, Plus, ChevronRight, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export const KnowledgeBase: React.FC = () => {
  const { hasRole, user } = useAuth();
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>(initialKnowledgeBase);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<KnowledgeBaseArticle | null>(null);

  // New article modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategoryId, setNewCategoryId] = useState<number>(1);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await api.get('/api/KnowledgeBase');
        if (response.data && response.data.data) {
          setArticles(response.data.data);
        }
      } catch (err) {
        console.warn('KnowledgeBase API endpoint offline, using initial mock dataset:', err);
      }
    };
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.content.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory ? String(art.categoryId) === selectedCategory : true;
    return matchesSearch && matchesCat;
  });

  const handleArticleClick = (art: KnowledgeBaseArticle) => {
    setActiveArticle(art);
    // increment view count
    art.viewCount += 1;
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Məqalə başlığı və məzmununu tam doldurun');
      return;
    }

    const payload = {
      title: newTitle,
      content: newContent,
      categoryId: newCategoryId,
    };

    try {
      await api.post('/api/KnowledgeBase', payload);
    } catch (err) {
      console.warn('KnowledgeBase POST API error, creating locally:', err);
    }

    const created: KnowledgeBaseArticle = {
      id: Date.now(),
      title: newTitle,
      content: newContent,
      categoryId: newCategoryId,
      categoryName: initialCategories.find((c) => c.id === newCategoryId)?.name || 'Ümumi',
      authorName: user?.fullName || 'İT Mütəxəssis',
      viewCount: 1,
      createdDate: new Date().toISOString(),
    };

    setArticles([created, ...articles]);
    setShowCreateModal(false);
    setNewTitle('');
    setNewContent('');
    toast.success('Yeni məqalə Bilik Bazasına əlavə edildi!');
  };

  const canCreate = hasRole([UserRole.Admin, UserRole.ITSpecialist, UserRole.FieldEngineer]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bilik Bazası və Təlimatlar (Knowledge Base / FAQ)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tez-tez verilən suallar, profilaktik təlimatlar və İT nasazlıqlarının müstəqil həll yolları
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Məqalə Əlavə Et</span>
          </button>
        )}
      </div>

      {/* Search & Category Filter bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Bilik bazasında axtarın (məs: printer, 1C, Wi-Fi, şifrə)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Bütün Kateqoriyalar</option>
            {initialCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map((art) => (
          <div
            key={art.id}
            onClick={() => handleArticleClick(art)}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-block rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {art.categoryName || 'Kateqoriya'}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {art.viewCount} baxış
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-2">
                {art.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {art.content}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
              <span>Müəllif: {art.authorName || 'İT Mütəxəssis'}</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                Oxu <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Article Reader Drawer / Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="inline-block rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                  {activeArticle.categoryName}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {activeArticle.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              {activeArticle.content}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>Yazan: {activeArticle.authorName}</span>
              <span>Baxış sayı: {activeArticle.viewCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Create Article Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Yeni Bilik Bazası Məqaləsi
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Məqalə Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Məs: VPN Bağlantı Xətası Həlli"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Kateqoriya *
                </label>
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white"
                >
                  {initialCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Məzmun və Addım-Addım Təlimat *
                </label>
                <textarea
                  rows={6}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="1. Başlat menyusuna daxil olun..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  Yayımla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

