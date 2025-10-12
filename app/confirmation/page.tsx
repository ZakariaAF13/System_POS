'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function ConfirmationPage() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get('orderId');

  return (
    <div className="min-h-[60vh] container max-w-2xl mx-auto p-4 md:p-6 flex items-center">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
          <CardTitle>Pembayaran Berhasil!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-lg font-medium text-green-600">Pesanan Anda sedang disiapkan</p>
          {orderId && (
            <p className="text-sm text-muted-foreground">ID Pesanan: <span className="font-mono">{orderId}</span></p>
          )}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => router.push('/order?tableId=1')}
              className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Pesan Lagi
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push('/')}
              className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Kembali ke Beranda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
