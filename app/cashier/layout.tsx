'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/contexts/auth-context';
import ProtectedRoute from '@/components/cashier/ProtectedRoute';

export default function CashierLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider scope="kasir">
      <ProtectedRoute>{children}</ProtectedRoute>
    </AuthProvider>
  );
}
