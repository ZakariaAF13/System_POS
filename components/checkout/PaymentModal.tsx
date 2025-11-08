'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Smartphone, Wallet, QrCode, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  orderId: string;
  onPaymentSuccess: () => void;
}

export default function PaymentModal({ open, onClose, amount, orderId, onPaymentSuccess }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'qris' | 'gopay' | 'ovo' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const functionsBase = process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL || '';

  // Ensure Midtrans Snap.js is loaded when the modal opens (works for both checkout and cashier flows)
  useEffect(() => {
    if (!open) return;
    const scriptId = 'midtrans-snap-script';
    if (document.getElementById(scriptId)) return;

    const env = process.env.NEXT_PUBLIC_MIDTRANS_ENV || 'sandbox';
    const snapSrc = env === 'production'
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = snapSrc;
    script.async = true;
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
    document.body.appendChild(script);
    // Do not remove on close to allow reuse across openings
  }, [open]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const handlePaymentMethodSelect = async (method: 'qris' | 'gopay' | 'ovo') => {
    setSelectedMethod(method);
    setIsProcessing(true);

    try {
      if (!functionsBase) {
        console.error('NEXT_PUBLIC_SUPABASE_FUNCTION_URL is not set');
        setIsProcessing(false);
        return;
      }

      const response = await fetch(`${functionsBase}/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          paymentType: method,
        }),
      });

      const data = await response.json();

      if (data.token) {
        setSnapToken(data.token);

        if (typeof window !== 'undefined' && (window as any).snap) {
          (window as any).snap.pay(data.token, {
            onSuccess: async function(result: any) {
              console.log('Payment success:', result);
              await handlePaymentCallback(result);
            },
            onPending: function(result: any) {
              console.log('Payment pending:', result);
            },
            onError: function(result: any) {
              console.log('Payment error:', result);
              setIsProcessing(false);
            },
            onClose: function() {
              console.log('Payment popup closed');
              setIsProcessing(false);
            }
          });
        } else {
          console.warn('Midtrans Snap.js is not loaded yet. Please try again.');
          setIsProcessing(false);
        }
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      setIsProcessing(false);
    }
  };

  const handlePaymentCallback = async (result: any) => {
    try {
      if (!functionsBase) return;

      const response = await fetch(`${functionsBase}/payment-callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          transaction_status: result?.transaction_status || 'settlement',
          payment_type: result?.payment_type || (selectedMethod ?? 'qris'),
        }),
      });

      if (response.ok) {
        onPaymentSuccess();
      }
    } catch (error) {
      console.error('Error processing callback:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
          <DialogDescription>
            Total pembayaran: <span className="font-bold text-primary">{formatPrice(amount)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Card
            className={`p-4 cursor-pointer transition-all hover:border-primary hover:shadow-md ${
              selectedMethod === 'qris' ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => !isProcessing && handlePaymentMethodSelect('qris')}
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <QrCode className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">QRIS</h3>
                <p className="text-sm text-muted-foreground">Scan QR Code untuk bayar</p>
              </div>
              {isProcessing && selectedMethod === 'qris' && (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              )}
            </div>
          </Card>

          <Card
            className={`p-4 cursor-pointer transition-all hover:border-primary hover:shadow-md ${
              selectedMethod === 'gopay' ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => !isProcessing && handlePaymentMethodSelect('gopay')}
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">GoPay</h3>
                <p className="text-sm text-muted-foreground">Bayar dengan GoPay</p>
              </div>
              {isProcessing && selectedMethod === 'gopay' && (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              )}
            </div>
          </Card>

          <Card
            className={`p-4 cursor-pointer transition-all hover:border-primary hover:shadow-md ${
              selectedMethod === 'ovo' ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => !isProcessing && handlePaymentMethodSelect('ovo')}
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">OVO</h3>
                <p className="text-sm text-muted-foreground">Bayar dengan OVO</p>
              </div>
              {isProcessing && selectedMethod === 'ovo' && (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              )}
            </div>
          </Card>
        </div>

        <Button variant="outline" onClick={onClose} disabled={isProcessing} className="w-full">
          Batal
        </Button>
      </DialogContent>
    </Dialog>
  );
}
