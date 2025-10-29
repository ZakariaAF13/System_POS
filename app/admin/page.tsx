'use client';

import React, { useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Download, FileSpreadsheet, Printer, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminHomePage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement | null>(null);

  const statsCards = [
    { title: 'Total Sales Today', value: 'Rp 12.458', change: '+12.5%', trend: 'up', color: 'blue' },
    { title: 'Monthly Total', value: 'Rp 348.920', change: '+8.2%', trend: 'up', color: 'green' },
    { title: 'Yearly Total', value: 'Rp 4,2M', change: '+15.8%', trend: 'up', color: 'purple' },
    { title: 'Active Cashiers', value: '8', change: '2 online', trend: 'neutral', color: 'orange' },
    { title: 'Estimated Profit', value: 'Rp 89.420', change: '+18.3%', trend: 'up', color: 'emerald' },
  ];

  const topSellingProducts = [
    { id: 1, name: 'Margherita Pizza', sales: 342, revenue: 'Rp 3.420', status: 'Popular', img: '🍕' },
    { id: 2, name: 'Caesar Salad', sales: 289, revenue: 'Rp 2.312', status: 'Popular', img: '🥗' },
    { id: 3, name: 'Grilled Salmon', sales: 256, revenue: 'Rp 5.120', status: 'Popular', img: '🐟' },
    { id: 4, name: 'Beef Burger', sales: 234, revenue: 'Rp 2.808', status: 'Popular', img: '🍔' },
    { id: 5, name: 'Pasta Carbonara', sales: 198, revenue: 'Rp 2.376', status: 'Popular', img: '🍝' },
  ];

  const leastSellingProducts = [
    { id: 1, name: 'Escargot', sales: 12, revenue: 'Rp 240', status: 'Low Demand', img: '🐌' },
    { id: 2, name: 'Caviar Platter', sales: 8, revenue: 'Rp 640', status: 'Low Demand', img: '🥄' },
    { id: 3, name: 'Vegan Wrap', sales: 15, revenue: 'Rp 135', status: 'Low Demand', img: '🌯' },
    { id: 4, name: 'Green Smoothie', sales: 23, revenue: 'Rp 138', status: 'Low Demand', img: '🥤' },
    { id: 5, name: 'Tofu Stir Fry', sales: 28, revenue: 'Rp 252', status: 'Low Demand', img: '🥘' },
  ];

  const salesData = {
    daily: [420, 520, 480, 650, 580, 720, 690],
    monthly: [12400, 15200, 14800, 18900, 17200, 21500, 19800],
    yearly: [145000, 182000, 168000, 225000, 198000, 248000, 235000],
  } as const;

  const cashiersToday = [
    { id: 'K001', name: 'Rani', loginAt: '08:05', status: 'online' as const },
    { id: 'K002', name: 'Budi', loginAt: '09:10', status: 'online' as const },
    { id: 'K003', name: 'Sari', loginAt: '07:50', status: 'offline' as const },
  ];

  const shifts = [
    { id: 'K001', name: 'Rani', shift: 'Pagi', start: '08:00', end: '16:00', hours: 8, active: true },
    { id: 'K002', name: 'Budi', shift: 'Siang', start: '12:00', end: '20:00', hours: 8, active: false },
    { id: 'K003', name: 'Sari', shift: 'Pagi', start: '08:00', end: '16:00', hours: 8, active: false },
  ];

  const activityLog = [
    { id: 'A-10021', type: 'cancel' as const, cashier: 'Rani', ref: 'ORD-2391', amount: 0, at: '10:12', note: 'Transaksi dibatalkan' },
    { id: 'A-10022', type: 'refund' as const, cashier: 'Budi', ref: 'ORD-2395', amount: 25000, at: '11:03', note: 'Refund sebagian' },
    { id: 'A-10023', type: 'discount' as const, cashier: 'Rani', ref: 'ORD-2398', amount: 10000, at: '11:25', note: 'Diskon member' },
  ];

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300',
      green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300',
      purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300',
      orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300',
      emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300',
    };
    return colors[color] || colors.blue;
  };

  const formatCurrencyIDR = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const exportCSV = () => {
    const rows: string[][] = [];
    rows.push(['Stats']);
    rows.push(['Title', 'Value', 'Change']);
    statsCards.forEach((s) => rows.push([s.title, s.value, s.change]));
    rows.push([]);
    rows.push(['Top Selling Products']);
    rows.push(['Name', 'Sales', 'Revenue', 'Status']);
    topSellingProducts.forEach((p) => rows.push([p.name, String(p.sales), p.revenue, p.status]));
    rows.push([]);
    rows.push(['Least Selling Products']);
    rows.push(['Name', 'Sales', 'Revenue', 'Status']);
    leastSellingProducts.forEach((p) => rows.push([p.name, String(p.sales), p.revenue, p.status]));
    const csv = rows.map((r) => r.map((v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPage = () => {
    window.print();
  };

  return (
    <div className="p-0" ref={contentRef}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, John! 👋</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your restaurant today</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className={`bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl border p-6 hover:shadow-lg transition-all duration-200 hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
              {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
              {stat.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{stat.value}</h3>
            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getColorClass(stat.color)}`}>{stat.change}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className={`lg:col-span-2 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl border p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sales Trend</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Overview of sales performance</p>
            </div>
            <div className="flex gap-2">
              {(['daily', 'monthly', 'yearly'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    selectedPeriod === period
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {salesData[selectedPeriod].map((value, index) => {
              const maxValue = Math.max(...salesData[selectedPeriod]);
              const height = (value / maxValue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-orange-500 to-red-600 rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer relative group"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded">
                      {formatCurrencyIDR(value)}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedPeriod === 'daily' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] : index + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className={`bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl border p-6`}>
          <h3 className={`text-lg font-bold mb-6 text-gray-900 dark:text-white`}>Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={exportCSV} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-all duration-200`}>
              <FileSpreadsheet className="w-5 h-5 text-green-500" />
              <span className="font-medium">Export to Excel</span>
            </button>
            <button onClick={printPage} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-all duration-200`}>
              <Download className="w-5 h-5 text-red-500" />
              <span className="font-medium">Export to PDF</span>
            </button>
            <button onClick={() => router.push('/admin/receipt')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-all duration-200`}>
              <Printer className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Customize Receipt</span>
            </button>
            <button onClick={() => router.push('/admin/qr-tables')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-all duration-200`}>
              <QrCode className="w-5 h-5 text-purple-500" />
              <span className="font-medium">Generate QR Table</span>
            </button>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <label className={`block text-sm font-medium mb-2 text-gray-900 dark:text-white`}>Date Range</label>
            <input
              type="date"
              className={`w-full px-3 py-2 rounded-lg border bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 mb-2`}
            />
            <input
              type="date"
              className={`w-full px-3 py-2 rounded-lg border bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl border p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-bold text-gray-900 dark:text-white`}>Top Selling Products</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Best performers this month</p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b border-gray-200 dark:border-gray-700`}>
                  <th className={`text-left py-3 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400`}>Product</th>
                  <th className={`text-center py-3 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400`}>Sales</th>
                  <th className={`text-right py-3 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400`}>Revenue</th>
                  <th className={`text-right py-3 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400`}>Status</th>
                </tr>
              </thead>
              <tbody>
                {topSellingProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 flex items-center justify-center text-2xl">
                          {product.img}
                        </div>
                        <span className={`font-medium text-sm text-gray-900 dark:text-white`}>{product.name}</span>
                      </div>
                    </td>
                    <td className={`text-center py-3 px-2 font-semibold text-gray-900 dark:text-white`}>{product.sales}</td>
                    <td className={`text-right py-3 px-2 font-semibold text-green-600 dark:text-green-400`}>{product.revenue}</td>
                    <td className="text-right py-3 px-2">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">{product.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className={`bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl border p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-bold text-gray-900 dark:text-white`}>Least Selling Products</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Need attention this month</p>
            </div>
            <TrendingDown className="w-6 h-6 text-red-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b border-gray-200 dark:border-gray-700`}>
                  <th className={`text-left py-3 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400`}>Product</th>
                  <th className={`text-center py-3 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400`}>Sales</th>
                  <th className={`text-right py-3 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400`}>Revenue</th>
                  <th className={`text-right py-3 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400`}>Status</th>
                </tr>
              </thead>
              <tbody>
                {leastSellingProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-2xl">
                          {product.img}
                        </div>
                        <span className={`font-medium text-sm text-gray-900 dark:text-white`}>{product.name}</span>
                      </div>
                    </td>
                    <td className={`text-center py-3 px-2 font-semibold text-gray-900 dark:text-white`}>{product.sales}</td>
                    <td className={`text-right py-3 px-2 font-semibold text-orange-600 dark:text-orange-400`}>{product.revenue}</td>
                    <td className="text-right py-3 px-2">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">{product.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
        <div className="xl:col-span-1 bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">Kasir yang Login Hari Ini</h3>
          <ul className="space-y-3">
            {cashiersToday.map((c) => (
              <li key={c.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center font-semibold">
                    {c.name.slice(0,1)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">Login {c.loginAt}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${c.status === 'online' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="xl:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">Shift & Jam Kerja Kasir</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted">
                <tr className="border-b border-border">
                  <th className="text-left p-3">Kasir</th>
                  <th className="text-left p-3">Shift</th>
                  <th className="text-left p-3">Mulai</th>
                  <th className="text-left p-3">Selesai</th>
                  <th className="text-right p-3">Jam</th>
                  <th className="text-right p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s) => (
                  <tr key={s.id} className="border-b border-border">
                    <td className="p-3 text-foreground">{s.name}</td>
                    <td className="p-3 text-muted-foreground">{s.shift}</td>
                    <td className="p-3 text-muted-foreground">{s.start}</td>
                    <td className="p-3 text-muted-foreground">{s.end}</td>
                    <td className="p-3 text-right text-foreground">{s.hours}</td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${s.active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {s.active ? 'Aktif' : 'Selesai'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm mt-8">
        <h3 className="text-lg font-bold text-foreground mb-4">Log Aktivitas</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted">
              <tr className="border-b border-border">
                <th className="text-left p-3">Waktu</th>
                <th className="text-left p-3">Kasir</th>
                <th className="text-left p-3">Tipe</th>
                <th className="text-left p-3">Referensi</th>
                <th className="text-right p-3">Jumlah</th>
                <th className="text-left p-3">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {activityLog.map((a) => (
                <tr key={a.id} className="border-b border-border">
                  <td className="p-3 text-muted-foreground">{a.at}</td>
                  <td className="p-3 text-foreground">{a.cashier}</td>
                  <td className="p-3">
                    <span className={`${a.type === 'cancel' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' : a.type === 'refund' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'} px-2 py-1 rounded text-xs font-medium` }>
                      {a.type}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{a.ref}</td>
                  <td className="p-3 text-right text-foreground">{a.amount > 0 ? `Rp ${a.amount.toLocaleString('id-ID')}` : '-'}</td>
                  <td className="p-3 text-muted-foreground">{a.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
