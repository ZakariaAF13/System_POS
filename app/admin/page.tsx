'use client';

import Link from 'next/link';
import { AuthProvider } from '@/lib/contexts/auth-context';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';

export default function AdminHomePage() {
  return (
    <AuthProvider>
      <AdminProtectedRoute>
        <main className="min-h-screen bg-slate-50 p-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/admin/analisis" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition">
                <h2 className="text-xl font-semibold mb-2">CRUD Analisis</h2>
                <p className="text-gray-600">Kelola data analisis.</p>
              </Link>
              <Link href="/admin/reports" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition">
                <h2 className="text-xl font-semibold mb-2">Laporan</h2>
                <p className="text-gray-600">Laporan harian, bulanan, tahunan.</p>
              </Link>
            </div>
          </div>
        </main>
      </AdminProtectedRoute>
    </AuthProvider>
  );
}
