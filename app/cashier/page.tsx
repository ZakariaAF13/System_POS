'use client';

import ProtectedRoute from '@/components/cashier/ProtectedRoute';
import CashierDashboard from '@/components/cashier/CashierDashboard';

export default function CashierPage() {
  return (
    <ProtectedRoute>
      <CashierDashboard />
    </ProtectedRoute>
  );
}
