'use client';

import { AuthProvider } from '@/lib/contexts/auth-context';
import ProtectedRoute from '@/components/cashier/ProtectedRoute';
import CashierDashboard from '@/components/cashier/CashierDashboard';

export default function DashboardPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <CashierDashboard />
      </ProtectedRoute>
    </AuthProvider>
  );
}
