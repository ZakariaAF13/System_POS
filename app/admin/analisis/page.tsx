'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AnalisisItem {
  id: string;
  title: string;
  description?: string | null;
  created_at?: string;
}

export default function AnalisisPage() {
  return <AnalisisCRUD />;
}

function AnalisisCRUD() {
  const [items, setItems] = useState<AnalisisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<AnalisisItem>>({ title: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const load = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase
      .from('analisis')
      .select('id, title, description, created_at')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    setItems((data as AnalisisItem[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.title.trim()) {
      setError('Judul wajib diisi');
      return;
    }
    if (editingId) {
      const { error } = await supabase
        .from('analisis')
        .update({ title: form.title, description: form.description ?? null })
        .eq('id', editingId);
      if (error) return setError(error.message);
    } else {
      const { error } = await supabase
        .from('analisis')
        .insert({ title: form.title, description: form.description ?? null });
      if (error) return setError(error.message);
    }
    setForm({ title: '', description: '' });
    setEditingId(null);
    await load();
  };

  const onEdit = (item: AnalisisItem) => {
    setEditingId(item.id);
    setForm({ title: item.title, description: item.description ?? '' });
  };

  const onDelete = async (id: string) => {
    setError('');
    const { error } = await supabase.from('analisis').delete().eq('id', id);
    if (error) return setError(error.message);
    await load();
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">CRUD Analisis</h1>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

        <form onSubmit={onSubmit} className="bg-white p-4 rounded-lg shadow mb-6 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
            <input
              value={form.title || ''}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500"
              placeholder="Judul analisis"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500"
              placeholder="Deskripsi singkat"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-md">
              {editingId ? 'Simpan Perubahan' : 'Tambah'}
            </button>
            {editingId && (
              <button
                type="button"
                className="px-4 py-2 rounded-md border"
                onClick={() => {
                  setEditingId(null);
                  setForm({ title: '', description: '' });
                }}
              >
                Batal
              </button>
            )}
          </div>
        </form>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Daftar Analisis</h2>
            <button onClick={load} className="text-sm text-slate-700 underline">Refresh</button>
          </div>
          {loading ? (
            <div className="p-4">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-4 text-gray-500">Belum ada data.</div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 text-sm rounded border"
                      onClick={() => onEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 text-sm rounded bg-red-600 text-white"
                      onClick={() => onDelete(item.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
