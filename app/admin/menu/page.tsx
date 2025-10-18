'use client';

import { AuthProvider } from '@/lib/contexts/auth-context';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';

export default function MenuPage() {
  return (
    <AuthProvider>
      <AdminProtectedRoute>
        <main className="min-h-screen bg-slate-50 p-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Menu</h1>
          </div>
        </main>
      </AdminProtectedRoute>
    </AuthProvider>
  );
}
