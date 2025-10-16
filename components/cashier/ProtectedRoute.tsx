'use client';

import React, { useEffect } from 'react';
import { ReactNode } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import Login from './Login';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const role = (user?.app_metadata as Record<string, any> | undefined)?.role
    ?? (user?.user_metadata as Record<string, any> | undefined)?.role;

  useEffect(() => {
    if (user && role === 'admin') {
      router.replace('/admin');
    }
  }, [user, role, router]);

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
    return <Login />;
  }

  if (role === 'admin') {
    return null;
  }

  if (role !== 'cashier') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-semibold mb-2">Unauthorized</h1>
          <p className="text-gray-600 mb-6">Akun ini tidak memiliki akses kasir. Silakan login menggunakan akun kasir.</p>
          <Login />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
