'use client';

import { ReactNode, useState } from 'react';
import { AuthProvider } from '@/lib/contexts/auth-context';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import {
  UtensilsCrossed,
  Settings,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Menu as MenuIcon,
  X,
  LayoutDashboard,
  Users,
  BarChart3,
  DollarSign,
  FileText,
  Receipt,
  QrCode,
  Search,
} from 'lucide-react';

function AdminShell({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <aside
        className={`fixed left-0 top-0 h-full w-64 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-r z-30 transform transition-transform -translate-x-full ${
          isSidebarOpen ? 'translate-x-0' : ''
        } lg:translate-x-0`}
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
            <button
              onClick={() => setIsSidebarOpen(false)}
              className={`ml-auto lg:hidden p-2 rounded-lg ${
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
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
                  onClick={() => setIsSidebarOpen(false)}
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

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 lg:hidden z-20"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden
        />
      )}

      <div className="ml-0 lg:ml-64">
        <header
          className={`sticky top-0 z-10 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border-b transition-colors duration-200`}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className={`lg:hidden p-2.5 rounded-lg ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                } hover:scale-110 transition-all duration-200`}
                aria-label="Open sidebar"
              >
                <MenuIcon className="w-5 h-5" />
              </button>
              <div className="relative flex-1">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search..."
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all`}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 ml-4 sm:ml-8">
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

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider scope="admin">
      <AdminProtectedRoute>
        <AdminShell>{children}</AdminShell>
      </AdminProtectedRoute>
    </AuthProvider>
  );
}
