'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCartStore } from '@/lib/store/cart-store';
import { createOrder, updateOrderStatus } from '@/lib/services/orders';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const schema = z.object({
  customerName: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z.string().min(8, 'No. HP tidak valid'),
  address: z.string().optional(),
  notes: z.string().optional(),
  deliveryMethod: z.enum(['dine_in', 'takeaway', 'delivery']).default('dine_in'),
});

type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, tableId, getTotalPrice, clearCart } = useCartStore();
  const [processing, setProcessing] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: '',
      phone: '',
      address: '',
      notes: '',
      deliveryMethod: 'dine_in',
    },
  });

  const total = getTotalPrice();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const onSubmit = async (values: FormData) => {
    if (!tableId || items.length === 0) return;

    try {
      // 1) Create order (pending)
      const orderId = await createOrder({
        tableId,
        items,
        totalAmount: total,
        status: 'pending',
        customerName: values.customerName,
        phone: values.phone,
        address: values.address,
        notes: values.notes,
        deliveryMethod: values.deliveryMethod,
      });

      // 2) Simulate Midtrans processing
      setProcessing(true);
      await new Promise((res) => setTimeout(res, 3000));

      // 3) Update order status to 'paid'
      await updateOrderStatus(orderId, 'paid');

      // 4) Clear cart and go to confirmation
      clearCart();
      router.replace(`/confirmation?orderId=${orderId}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detail Pengiriman</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nama</Label>
                <Input
                  id="customerName"
                  placeholder="Nama pelanggan"
                  {...form.register('customerName')}
                  className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                />
                {form.formState.errors.customerName && (
                  <p className="text-sm text-destructive">{form.formState.errors.customerName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">No. HP</Label>
                <Input
                  id="phone"
                  placeholder="08xxxxxxxxxx"
                  {...form.register('phone')}
                  className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryMethod">Metode</Label>
                <Select
                  onValueChange={(v) => form.setValue('deliveryMethod', v as FormData['deliveryMethod'])}
                  defaultValue={form.getValues('deliveryMethod')}
                >
                  <SelectTrigger className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                    <SelectValue placeholder="Pilih metode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dine_in">Makan di tempat</SelectItem>
                    <SelectItem value="takeaway">Bawa pulang</SelectItem>
                    <SelectItem value="delivery">Diantarkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Alamat (opsional)</Label>
                <Textarea
                  id="address"
                  placeholder="Alamat pengantaran"
                  {...form.register('address')}
                  className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan (opsional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Tanpa pedas, dsb"
                  {...form.register('notes')}
                  className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full mt-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                disabled={processing || items.length === 0}
              >
                Bayar Sekarang
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((it) => (
                <div key={it.id} className="text-sm p-2 rounded-md border">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{it.menuItem.name}</span>
                        {it.isTakeaway && (
                          <span className="text-[10px] px-2 py-0.5 rounded border bg-muted">Takeaway</span>
                        )}
                      </div>
                      {it.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{it.notes}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs text-muted-foreground">× {it.quantity}</div>
                      <div className="font-semibold">{formatPrice(it.menuItem.price * it.quantity)}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t">
                <span className="font-semibold">Total</span>
                <span className="text-primary font-bold">{formatPrice(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={processing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Processing Payment</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
            <p className="text-muted-foreground">Mohon tunggu, pembayaran Anda sedang diproses...</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
