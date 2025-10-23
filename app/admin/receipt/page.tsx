'use client';

import { useMemo, useState } from 'react';

export default function ReceiptPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'paid' | 'unpaid'>('all');

  const receipts = useMemo(
    () => [
      { id: 'R-202510-001', table: 'A1', customer: 'Andi', total: 125000, status: 'paid', date: '2025-10-23 10:21' },
      { id: 'R-202510-002', table: 'A2', customer: 'Budi', total: 98000, status: 'unpaid', date: '2025-10-23 10:45' },
      { id: 'R-202510-003', table: 'B3', customer: 'Cici', total: 212000, status: 'paid', date: '2025-10-23 11:05' },
    ],
    []
  );

  const filtered = receipts.filter((r) => {
    const matchQuery = `${r.id} ${r.customer} ${r.table}`.toLowerCase().includes(query.toLowerCase());
    const matchStatus = status === 'all' ? true : r.status === status;
    return matchQuery && matchStatus;
  });

  const printReceipt = (id: string) => {
    // Placeholder action
    window.alert(`Cetak struk ${id}`);
  };

  const downloadPDF = (id: string) => {
    // Placeholder action
    window.alert(`Unduh PDF untuk ${id}`);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Receipt</h1>

        <div className="bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari ID, pelanggan, atau meja..."
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="all">Semua Status</option>
              <option value="paid">Lunas</option>
              <option value="unpaid">Belum Lunas</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Tanggal</th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Receipt ID</th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Meja</th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Pelanggan</th>
                <th className="text-right p-3 text-sm font-medium text-gray-700">Total</th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Status</th>
                <th className="text-right p-3 text-sm font-medium text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3 text-sm text-gray-700">{r.date}</td>
                  <td className="p-3 text-sm text-gray-900 font-medium">{r.id}</td>
                  <td className="p-3 text-sm text-gray-700">{r.table}</td>
                  <td className="p-3 text-sm text-gray-700">{r.customer}</td>
                  <td className="p-3 text-sm text-right text-gray-900">Rp {r.total.toLocaleString('id-ID')}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${r.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {r.status === 'paid' ? 'Lunas' : 'Belum Lunas'}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-right">
                    <button className="px-3 py-1 border rounded mr-2" onClick={() => printReceipt(r.id)}>Cetak</button>
                    <button className="px-3 py-1 border rounded" onClick={() => downloadPDF(r.id)}>PDF</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500 text-sm">Tidak ada data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
