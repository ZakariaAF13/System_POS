'use client';

import { AuthProvider } from '@/lib/contexts/auth-context';
import ProtectedRoute from '@/components/cashier/ProtectedRoute';
import Dashboard from '@/components/cashier/Dashboard';

export default function CashierPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    </AuthProvider>
  );
}
