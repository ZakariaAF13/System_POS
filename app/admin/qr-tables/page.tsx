'use client';

import { useMemo, useState } from 'react';

export default function QRTablesPage() {
  const [query, setQuery] = useState('');
  const tables = useMemo(
    () => [
      { id: 'A1', seats: 2, status: 'occupied' },
      { id: 'A2', seats: 2, status: 'available' },
      { id: 'B1', seats: 4, status: 'available' },
      { id: 'B2', seats: 4, status: 'occupied' },
      { id: 'C1', seats: 6, status: 'available' },
      { id: 'C2', seats: 6, status: 'available' },
      { id: 'D1', seats: 8, status: 'occupied' },
      { id: 'D2', seats: 8, status: 'available' },
    ],
    []
  );

  const filtered = tables.filter((t) => t.id.toLowerCase().includes(query.toLowerCase()));

  const viewQR = (id: string) => window.alert(`Lihat QR meja ${id}`);
  const downloadQR = (id: string) => window.alert(`Unduh QR meja ${id}`);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">QR Tables</h1>
          <button className="px-4 py-2 bg-slate-900 text-white rounded">Tambah Meja</button>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari meja (misal: A1)"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((t) => (
            <div key={t.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-gray-500">Meja</div>
                  <div className="text-2xl font-bold">{t.id}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  t.status === 'available' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {t.status === 'available' ? 'Tersedia' : 'Dipakai'}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">Kursi: {t.seats}</div>

              <div className="mt-4 flex items-center justify-between">
                <button className="px-3 py-1 border rounded" onClick={() => viewQR(t.id)}>Lihat QR</button>
                <button className="px-3 py-1 border rounded" onClick={() => downloadQR(t.id)}>Unduh</button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full p-6 text-center bg-white rounded-lg shadow text-gray-500 text-sm">
              Tidak ada meja
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
