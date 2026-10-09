import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../types';
import { initialInventory, initialCategories } from '../api/mockData';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Boxes, Plus, AlertTriangle, Search, PlusCircle, MinusCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const Inventory: React.FC = () => {
  const { hasRole } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form
  const [name, setName] = useState('');
  const [modelOrSku, setModelOrSku] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [unit, setUnit] = useState('Ədəd');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [minQuantityWarning, setMinQuantityWarning] = useState<number>(5);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await api.get('/api/Inventory');
        if (response.data && response.data.data) {
          setInventory(response.data.data);
        }
      } catch (err) {
        console.warn('Backend API /api/Inventory call failed, using mock data:', err);
      }
    };
    fetchInventory();
  }, []);

  const handleUpdateQuantity = async (id: number, delta: number) => {
    const target = inventory.find((item) => item.id === id);
    if (!target) return;

    const newQty = Math.max(0, target.quantity + delta);

    try {
      await api.put(`/api/Inventory/${id}/quantity`, { newQuantity: newQty });
    } catch (err) {
      console.warn('Backend update quantity error, updating locally:', err);
    }

    setInventory(
      inventory.map((item) =>
        item.id === id
          ? { ...item, quantity: newQty, lastUpdatedDate: new Date().toISOString().split('T')[0] }
          : item
      )
    );
    toast.success(`${target.name} stok miqdarı yeniləndi: ${newQty} ${target.unit}`);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !modelOrSku.trim()) {
      toast.error('Zəhmət olmasa avadanlıq adı və SKU modelini daxil edin');
      return;
    }

    const payload = {
      name,
      modelOrSku,
      quantity,
      unit,
      categoryId,
      minQuantityWarning,
    };

    try {
      await api.post('/api/Inventory', payload);
    } catch (err) {
      console.warn('Inventory POST failed, adding locally:', err);
    }

    const newItem: InventoryItem = {
      id: Date.now(),
      name,
      modelOrSku,
      quantity,
      unit,
      categoryId,
      categoryName: initialCategories.find((c) => c.id === categoryId)?.name || 'Hardware',
      minQuantityWarning,
      lastUpdatedDate: new Date().toISOString().split('T')[0],
    };

    setInventory([newItem, ...inventory]);
    setShowAddModal(false);
    setName('');
    setModelOrSku('');
    toast.success('Yeni avadanlıq anbara əlavə olundu!');
  };

  const filteredItems = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.modelOrSku.toLowerCase().includes(search.toLowerCase())
  );

  const isManager = hasRole([
    UserRole.Admin,
    UserRole.ITSpecialist,
    UserRole.FieldEngineer,
    UserRole.InventoryManager,
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Avadanlıq və Anbar Uçotu (Inventory & Warehouse)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            İT ehtiyat hissələri, kompüterlər, şəbəkə avadanlıqları və stoku azalan malların izlənməsi
          </p>
        </div>
        {isManager && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Mal Əlavə Et</span>
          </button>
        )}
      </div>

      {/* Search Toolbar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Avadanlıq adı və ya SKU / Model ilə axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3.5 font-bold">Avadanlıq Adı</th>
                <th className="px-4 py-3.5 font-bold">Model / SKU</th>
                <th className="px-4 py-3.5 font-bold">Kateqoriya</th>
                <th className="px-4 py-3.5 font-bold text-center">Stok Miqdarı</th>
                <th className="px-4 py-3.5 font-bold">Vəziyyət</th>
                <th className="px-4 py-3.5 font-bold text-right">Miqdar Dəyişdir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map((item) => {
                const isLowStock =
                  item.minQuantityWarning && item.quantity <= item.minQuantityWarning;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-500">
                      {item.modelOrSku}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-block rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {item.categoryName || 'Hardware'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-extrabold text-base text-slate-900 dark:text-white">
                      {item.quantity}{' '}
                      <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                    </td>
                    <td className="px-4 py-4">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-950/80 px-2.5 py-0.5 text-xs font-bold text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-900 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Kritik Stok! (&le;{item.minQuantityWarning})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-900">
                          Kifayət Qədər Var
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {isManager ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="1 Ədəd Azalt"
                          >
                            <MinusCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="1 Ədəd Artır"
                          >
                            <PlusCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Yalnız Baxış</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Anbara Yeni Avadanlıq Daxil Et
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Avadanlığın Adı *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Məs: Dell OptiPlex 7090 Desktop"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Model / SKU Kodu *
                </label>
                <input
                  type="text"
                  required
                  value={modelOrSku}
                  onChange={(e) => setModelOrSku(e.target.value)}
                  placeholder="COMP-DELL-7090"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Başlanğıc Miqdar *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Ölçü Vahidı *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="Ədəd">Ədəd</option>
                    <option value="Dəst">Dəst</option>
                    <option value="Qutu">Qutu</option>
                    <option value="Metr">Metr</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  Anbara Əlavə Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

