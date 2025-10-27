'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/contexts/auth-context';

export default function OrderLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
