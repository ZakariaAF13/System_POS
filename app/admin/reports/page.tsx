'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface OrderRow {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

type Range = 'daily' | 'monthly' | 'yearly';

export default function ReportsPage() {
  return <ReportsContent />;
}

function ReportsContent() {
  const [range, setRange] = useState<Range>('daily');
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const where = useMemo(() => {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    let end: Date;
    if (range === 'daily') {
      end = new Date(start);
      end.setDate(end.getDate() + 1);
    } else if (range === 'monthly') {
      end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    } else {
      end = new Date(d.getFullYear() + 1, 0, 1);
    }
    return { start: start.toISOString(), end: end.toISOString() };
  }, [range, date]);

  const load = async () => {
    setLoading(true);
    setError('');
    let query = supabase
      .from('orders')
      .select('id, total_amount, status, created_at')
      .gte('created_at', where.start)
      .lt('created_at', where.end)
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) setError(error.message);
    setRows((data as OrderRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, where.start, where.end]);

  const total = useMemo(() => rows.reduce((s, r) => s + (Number(r.total_amount) || 0), 0), [rows]);

  const exportCSV = () => {
    const headers = ['Tanggal', 'Order ID', 'Status', 'Total'];
    const csvRows = rows.map((r) => [
      new Date(r.created_at).toLocaleString('id-ID'),
      r.id,
      r.status,
      String(Number(r.total_amount))
    ]);
    const csv = [headers, ...csvRows]
      .map((line) => line.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileBase = `laporan_${range}_${date}`;
    a.download = `${fileBase}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Laporan</h1>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

        <div className="bg-card border border-border rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4 md:items-end">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Jenis Laporan</label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as Range)}
              className="border border-border bg-background text-foreground rounded px-3 py-2"
            >
              <option value="daily">Harian</option>
              <option value="monthly">Bulanan</option>
              <option value="yearly">Tahunan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Tanggal Acuan</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-border bg-background text-foreground rounded px-3 py-2"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={load} className="px-4 py-2 bg-slate-900 text-white rounded">Terapkan</button>
            <button onClick={exportCSV} className="px-4 py-2 border border-border rounded">Export CSV</button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Ringkasan</h2>
            <div className="text-foreground font-semibold">Total: Rp {total.toLocaleString('id-ID')}</div>
          </div>
          {loading ? (
            <div className="p-4">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="p-4 text-muted-foreground">Tidak ada data.</div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Tanggal</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-3 text-sm text-muted-foreground">{new Date(r.created_at).toLocaleString('id-ID')}</td>
                    <td className="p-3 text-sm text-foreground">{r.id}</td>
                    <td className="p-3 text-sm text-muted-foreground">{r.status}</td>
                    <td className="p-3 text-sm text-foreground text-right">Rp {Number(r.total_amount).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
