'use client';

import { useMemo } from 'react';

export default function ProfitPage() {
  const kpis = useMemo(
    () => ({
      revenue: 125_500_000,
      cogs: 62_200_000,
      expenses: 18_450_000,
    }),
    []
  );

  const profit = kpis.revenue - kpis.cogs - kpis.expenses;

  const monthly = useMemo(
    () => [
      { month: 'Jan', revenue: 18_200_000, cogs: 9_100_000, expenses: 2_000_000 },
      { month: 'Feb', revenue: 16_900_000, cogs: 8_400_000, expenses: 1_950_000 },
      { month: 'Mar', revenue: 19_500_000, cogs: 9_700_000, expenses: 1_980_000 },
      { month: 'Apr', revenue: 20_800_000, cogs: 10_200_000, expenses: 2_100_000 },
      { month: 'Mei', revenue: 22_700_000, cogs: 11_300_000, expenses: 2_250_000 },
      { month: 'Jun', revenue: 27_400_000, cogs: 13_500_000, expenses: 3_170_000 },
    ],
    []
  );

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profit</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Pendapatan</div>
            <div className="text-2xl font-bold mt-1">Rp {kpis.revenue.toLocaleString('id-ID')}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Harga Pokok Penjualan</div>
            <div className="text-2xl font-bold mt-1">Rp {kpis.cogs.toLocaleString('id-ID')}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Biaya Operasional</div>
            <div className="text-2xl font-bold mt-1">Rp {kpis.expenses.toLocaleString('id-ID')}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Laba Bersih</div>
            <div className={`text-2xl font-bold mt-1 ${profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              Rp {profit.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Ringkasan Bulanan</h2>
          </div>
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Bulan</th>
                <th className="text-right p-3 text-sm font-medium text-gray-700">Pendapatan</th>
                <th className="text-right p-3 text-sm font-medium text-gray-700">HPP</th>
                <th className="text-right p-3 text-sm font-medium text-gray-700">Biaya</th>
                <th className="text-right p-3 text-sm font-medium text-gray-700">Laba</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((m) => {
                const p = m.revenue - m.cogs - m.expenses;
                return (
                  <tr key={m.month} className="border-t">
                    <td className="p-3 text-sm text-gray-900">{m.month}</td>
                    <td className="p-3 text-sm text-right">Rp {m.revenue.toLocaleString('id-ID')}</td>
                    <td className="p-3 text-sm text-right">Rp {m.cogs.toLocaleString('id-ID')}</td>
                    <td className="p-3 text-sm text-right">Rp {m.expenses.toLocaleString('id-ID')}</td>
                    <td className={`p-3 text-sm text-right ${p >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>Rp {p.toLocaleString('id-ID')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
