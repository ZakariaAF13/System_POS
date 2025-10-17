'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import AdminLogin from './AdminLogin';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-semibold mb-2">Unauthorized</h1>
          <p className="text-gray-600 mb-6">Akun ini tidak memiliki akses admin. Silakan login menggunakan akun admin.</p>
          <AdminLogin />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
