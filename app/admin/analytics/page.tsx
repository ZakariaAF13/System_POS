'use client';

import { useMemo } from 'react';

export default function AnalyticsPage() {
  const metrics = useMemo(
    () => ({
      revenue: 125_500_000,
      orders: 1389,
      avgOrder: 90_300,
      returningRate: 0.36,
    }),
    []
  );

  const weekly = useMemo(
    () => [12, 18, 14, 22, 28, 25, 31],
    []
  );

  const topMenus = useMemo(
    () => [
      { name: 'Ayam Bakar', sold: 423, revenue: 21_150_000 },
      { name: 'Nasi Goreng', sold: 389, revenue: 19_450_000 },
      { name: 'Es Teh Manis', sold: 612, revenue: 6_120_000 },
    ],
    []
  );

  const maxWeekly = Math.max(...weekly, 1);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Pendapatan</div>
            <div className="text-2xl font-bold mt-1">Rp {metrics.revenue.toLocaleString('id-ID')}</div>
            <div className="text-xs text-emerald-600 mt-2">+8.2% dari minggu lalu</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Jumlah Order</div>
            <div className="text-2xl font-bold mt-1">{metrics.orders.toLocaleString('id-ID')}</div>
            <div className="text-xs text-emerald-600 mt-2">+3.1% dari minggu lalu</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Rata-rata Order</div>
            <div className="text-2xl font-bold mt-1">Rp {metrics.avgOrder.toLocaleString('id-ID')}</div>
            <div className="text-xs text-gray-500 mt-2">stabil</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Returning Customer</div>
            <div className="text-2xl font-bold mt-1">{(metrics.returningRate * 100).toFixed(0)}%</div>
            <div className="text-xs text-emerald-600 mt-2">+1.2 pt</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Trend Order (7 hari)</h2>
              <span className="text-sm text-gray-500">Mingguan</span>
            </div>
            <div className="flex items-end gap-2 h-40">
              {weekly.map((v, i) => (
                <div key={i} className="flex-1">
                  <div
                    className="bg-gradient-to-t from-orange-500 to-red-500 rounded-t"
                    style={{ height: `${(v / maxWeekly) * 100}%` }}
                    title={`${v}k`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-4">Menu Terlaris</h2>
            <ul className="space-y-3">
              {topMenus.map((m) => (
                <li key={m.name} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-gray-500">Terjual {m.sold.toLocaleString('id-ID')} porsi</div>
                  </div>
                  <div className="text-sm font-semibold">Rp {m.revenue.toLocaleString('id-ID')}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
