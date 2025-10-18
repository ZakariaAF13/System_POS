'use client';

import { useEffect, useMemo, useState } from 'react';
import { createSupabaseClientWithKey } from '@/lib/supabase';
import { Plus, Pencil, Trash2 } from 'lucide-react';

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  available: boolean;
};

export default function MenuPage() {
  const supabase = useMemo(() => createSupabaseClientWithKey('pos-admin'), []);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{
    id?: string;
    name: string;
    description: string;
    price: string;
    category: string;
    available: boolean;
  }>({ name: '', description: '', price: '', category: '', available: true });
  const [error, setError] = useState<string>('');

  const resetForm = () => setForm({ name: '', description: '', price: '', category: '', available: true, id: undefined });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category')
        .order('name');
      if (error) throw error;
      setItems((data as MenuItem[]) || []);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat data menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const onEdit = (item: MenuItem) => {
    setForm({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      category: item.category,
      available: item.available,
    });
  };

  const onDelete = async (id: string) => {
    if (!confirm('Hapus menu ini?')) return;
    try {
      setSaving(true);
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;
      await fetchItems();
    } catch (e: any) {
      setError(e.message || 'Gagal menghapus menu');
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        category: form.category.trim(),
        available: form.available,
      };
      if (!payload.name || isNaN(payload.price) || !payload.category) {
        throw new Error('Nama, harga, dan kategori wajib diisi');
      }
      if (form.id) {
        const { error } = await supabase
          .from('menu_items')
          .update(payload)
          .eq('id', form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert(payload);
        if (error) throw error;
      }
      resetForm();
      await fetchItems();
    } catch (e: any) {
      setError(e.message || 'Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Kelola Menu</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
        )}

        <form onSubmit={onSubmit} className="bg-white border rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            placeholder="Nama Menu"
            className="md:col-span-2 px-3 py-2 border rounded"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            placeholder="Deskripsi"
            className="md:col-span-2 px-3 py-2 border rounded"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <input
            placeholder="Harga"
            type="number"
            min="0"
            className="px-3 py-2 border rounded"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            required
          />
          <input
            placeholder="Kategori"
            className="px-3 py-2 border rounded"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            required
          />
          <label className="flex items-center gap-2 md:col-span-1">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))}
            />
            <span>Tersedia</span>
          </label>
          <div className="md:col-span-6 flex gap-2 justify-end">
            {form.id && (
              <button type="button" onClick={resetForm} className="px-4 py-2 border rounded">
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-slate-900 text-white rounded disabled:opacity-50"
            >
              {form.id ? 'Simpan Perubahan' : 'Tambah Menu'}
            </button>
          </div>
        </form>

        <div className="bg-white border rounded-xl">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Daftar Menu</h2>
            <button onClick={resetForm} className="flex items-center gap-2 px-3 py-2 border rounded">
              <Plus className="w-4 h-4" /> Baru
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left p-3">Nama</th>
                  <th className="text-left p-3">Deskripsi</th>
                  <th className="text-left p-3">Kategori</th>
                  <th className="text-right p-3">Harga</th>
                  <th className="text-center p-3">Status</th>
                  <th className="text-right p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">Memuat...</td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">Belum ada data</td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3 text-gray-600">{item.description}</td>
                      <td className="p-3">{item.category}</td>
                      <td className="p-3 text-right">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${item.available ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                          {item.available ? 'Tersedia' : 'Tidak'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => onEdit(item)} className="inline-flex items-center gap-1 px-3 py-1 border rounded mr-2">
                          <Pencil className="w-4 h-4" /> Edit
                        </button>
                        <button disabled={saving} onClick={() => onDelete(item.id)} className="inline-flex items-center gap-1 px-3 py-1 border rounded text-red-600">
                          <Trash2 className="w-4 h-4" /> Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
}
