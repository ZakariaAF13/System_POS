'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/contexts/auth-context';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider scope="admin">
      <AdminProtectedRoute>{children}</AdminProtectedRoute>
    </AuthProvider>
  );
}
