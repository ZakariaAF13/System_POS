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
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Profit</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg shadow-sm p-4">
            <div className="text-sm text-muted-foreground">Pendapatan</div>
            <div className="text-2xl font-bold mt-1 text-foreground">Rp {kpis.revenue.toLocaleString('id-ID')}</div>
          </div>
          <div className="bg-card border border-border rounded-lg shadow-sm p-4">
            <div className="text-sm text-muted-foreground">Harga Pokok Penjualan</div>
            <div className="text-2xl font-bold mt-1 text-foreground">Rp {kpis.cogs.toLocaleString('id-ID')}</div>
          </div>
          <div className="bg-card border border-border rounded-lg shadow-sm p-4">
            <div className="text-sm text-muted-foreground">Biaya Operasional</div>
            <div className="text-2xl font-bold mt-1 text-foreground">Rp {kpis.expenses.toLocaleString('id-ID')}</div>
          </div>
          <div className="bg-card border border-border rounded-lg shadow-sm p-4">
            <div className="text-sm text-muted-foreground">Laba Bersih</div>
            <div className={`text-2xl font-bold mt-1 ${profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              Rp {profit.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Ringkasan Bulanan</h2>
          </div>
          <table className="min-w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Bulan</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Pendapatan</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">HPP</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Biaya</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Laba</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((m) => {
                const p = m.revenue - m.cogs - m.expenses;
                return (
                  <tr key={m.month} className="border-t border-border">
                    <td className="p-3 text-sm text-foreground">{m.month}</td>
                    <td className="p-3 text-sm text-right">Rp {m.revenue.toLocaleString('id-ID')}</td>
                    <td className="p-3 text-sm text-right">Rp {m.cogs.toLocaleString('id-ID')}</td>
                    <td className="p-3 text-sm text-right">Rp {m.expenses.toLocaleString('id-ID')}</td>
                    <td className={`p-3 text-sm text-right ${p >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>Rp {p.toLocaleString('id-ID')}</td>
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
