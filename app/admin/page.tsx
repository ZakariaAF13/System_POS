'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  BarChart3,
  DollarSign,
  FileText,
  Receipt,
  QrCode,
  Search,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Download,
  FileSpreadsheet,
  Printer,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import { useAuth } from '@/lib/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/lib/contexts/auth-context';

export default function AdminHomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      router.replace('/admin');
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Users', icon: Users, href: '/admin/users' },
    { name: 'Menu', icon: UtensilsCrossed, href: '/admin/menu' },
    { name: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    { name: 'Profit', icon: DollarSign, href: '/admin/profit' },
    { name: 'Reports', icon: FileText, href: '/admin/reports' },
    { name: 'Receipt', icon: Receipt, href: '/admin/receipt' },
    { name: 'QR Tables', icon: QrCode, href: '/admin/qr-tables' },
  ];

  const statsCards = [
    { title: 'Total Sales Today', value: '$12,458', change: '+12.5%', trend: 'up', color: 'blue' },
    { title: 'Monthly Total', value: '$348,920', change: '+8.2%', trend: 'up', color: 'green' },
    { title: 'Yearly Total', value: '$4.2M', change: '+15.8%', trend: 'up', color: 'purple' },
    { title: 'Active Cashiers', value: '8', change: '2 online', trend: 'neutral', color: 'orange' },
    { title: 'Estimated Profit', value: '$89,420', change: '+18.3%', trend: 'up', color: 'emerald' },
  ];

  const topSellingProducts = [
    { id: 1, name: 'Margherita Pizza', sales: 342, revenue: '$3,420', status: 'Popular', img: '🍕' },
    { id: 2, name: 'Caesar Salad', sales: 289, revenue: '$2,312', status: 'Popular', img: '🥗' },
    { id: 3, name: 'Grilled Salmon', sales: 256, revenue: '$5,120', status: 'Popular', img: '🐟' },
    { id: 4, name: 'Beef Burger', sales: 234, revenue: '$2,808', status: 'Popular', img: '🍔' },
    { id: 5, name: 'Pasta Carbonara', sales: 198, revenue: '$2,376', status: 'Popular', img: '🍝' },
  ];

  const leastSellingProducts = [
    { id: 1, name: 'Escargot', sales: 12, revenue: '$240', status: 'Low Demand', img: '🐌' },
    { id: 2, name: 'Caviar Platter', sales: 8, revenue: '$640', status: 'Low Demand', img: '🥄' },
    { id: 3, name: 'Vegan Wrap', sales: 15, revenue: '$135', status: 'Low Demand', img: '🌯' },
    { id: 4, name: 'Green Smoothie', sales: 23, revenue: '$138', status: 'Low Demand', img: '🥤' },
    { id: 5, name: 'Tofu Stir Fry', sales: 28, revenue: '$252', status: 'Low Demand', img: '🥘' },
  ];

  const salesData = {
    daily: [420, 520, 480, 650, 580, 720, 690],
    monthly: [12400, 15200, 14800, 18900, 17200, 21500, 19800],
    yearly: [145000, 182000, 168000, 225000, 198000, 248000, 235000],
  } as const;

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: darkMode ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-600',
      green: darkMode ? 'bg-green-900/20 text-green-300' : 'bg-green-50 text-green-600',
      purple: darkMode ? 'bg-purple-900/20 text-purple-300' : 'bg-purple-50 text-purple-600',
      orange: darkMode ? 'bg-orange-900/20 text-orange-300' : 'bg-orange-50 text-orange-600',
      emerald: darkMode ? 'bg-emerald-900/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600',
    };
    return colors[color] || colors.blue;
  };

  return (
    <AuthProvider scope="admin">
      <AdminProtectedRoute>
        <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
          <aside
            className={`fixed left-0 top-0 h-full w-64 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border-r transition-colors duration-200 z-20`}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>RestoPOS</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
                </div>
              </div>
              <nav className="flex-1 px-3 py-4 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                          : darkMode
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </button>
              </div>
            </div>
          </aside>
          <div className="ml-64">
            <header
              className={`sticky top-0 z-10 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border-b transition-colors duration-200`}
            >
              <div className="flex items-center justify-between px-8 py-4">
                <div className="flex-1 max-w-xl">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      placeholder="Search products, orders, customers..."
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all`}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-8">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`p-2.5 rounded-lg ${
                      darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'
                    } hover:scale-110 transition-all duration-200`}
                  >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                  <button
                    className={`relative p-2.5 rounded-lg ${
                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    } hover:scale-110 transition-all duration-200`}
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      } transition-all duration-200`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold">JD</div>
                      <div className="text-left hidden sm:block">
                        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>John Doe</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                    {showUserMenu && (
                      <div
                        className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl ${
                          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        } border overflow-hidden`}
                      >
                        <button
                          className={`w-full flex items-center gap-3 px-4 py-3 ${
                            darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                          } transition-colors`}
                        >
                          <User className="w-4 h-4" />
                          <span className="text-sm">Profile</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className={`w-full flex items-center gap-3 px-4 py-3 ${
                            darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-50'
                          } transition-colors`}
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </header>
            <main className="p-8">
              <div className="mb-8">
                <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Welcome back, John! 👋</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your restaurant today</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                {statsCards.map((stat, index) => (
                  <div
                    key={index}
                    className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6 hover:shadow-lg transition-all duration-200 hover:scale-105`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                      {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                      {stat.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                    </div>
                    <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</h3>
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getColorClass(stat.color)}`}>{stat.change}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sales Trend</h3>
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
                              : darkMode
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                              ${value.toLocaleString()}
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
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                  <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
                  <div className="space-y-3">
                    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'} transition-all duration-200`}>
                      <FileSpreadsheet className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Export to Excel</span>
                    </button>
                    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'} transition-all duration-200`}>
                      <Download className="w-5 h-5 text-red-500" />
                      <span className="font-medium">Export to PDF</span>
                    </button>
                    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'} transition-all duration-200`}>
                      <Printer className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">Customize Receipt</span>
                    </button>
                    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'} transition-all duration-200`}>
                      <QrCode className="w-5 h-5 text-purple-500" />
                      <span className="font-medium">Generate QR Table</span>
                    </button>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Date Range</label>
                    <input
                      type="date"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-orange-500 mb-2`}
                    />
                    <input
                      type="date"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Top Selling Products</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Best performers this month</p>
                    </div>
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <th className={`text-left py-3 px-2 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Product</th>
                          <th className={`text-center py-3 px-2 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sales</th>
                          <th className={`text-right py-3 px-2 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Revenue</th>
                          <th className={`text-right py-3 px-2 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topSellingProducts.map((product) => (
                          <tr
                            key={product.id}
                            className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                          >
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 flex items-center justify-center text-2xl">
                                  {product.img}
                                </div>
                                <span className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.name}</span>
                              </div>
                            </td>
                            <td className={`text-center py-3 px-2 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.sales}</td>
                            <td className={`text-right py-3 px-2 font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{product.revenue}</td>
                            <td className="text-right py-3 px-2">
                              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">{product.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Least Selling Products</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Need attention this month</p>
                    </div>
                    <TrendingDown className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <th className={`text-left py-3 px-2 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Product</th>
                          <th className={`text-center py-3 px-2 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sales</th>
                          <th className={`text-right py-3 px-2 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Revenue</th>
                          <th className={`text-right py-3 px-2 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leastSellingProducts.map((product) => (
                          <tr
                            key={product.id}
                            className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                          >
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-2xl">
                                  {product.img}
                                </div>
                                <span className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.name}</span>
                              </div>
                            </td>
                            <td className={`text-center py-3 px-2 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.sales}</td>
                            <td className={`text-right py-3 px-2 font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>{product.revenue}</td>
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
            </main>
          </div>
        </div>
      </AdminProtectedRoute>
    </AuthProvider>
  );
}
