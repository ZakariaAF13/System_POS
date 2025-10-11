'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingCart as CartIcon } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { useLanguage } from '@/lib/contexts/language-context';
import { useRouter } from 'next/navigation';

export function ShoppingCart() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCartStore();
  const { t } = useLanguage();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CartIcon className="h-5 w-5" />
            {t('common.cart')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CartIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            {t('common.emptyCart')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CartIcon className="h-5 w-5" />
            {t('common.cart')}
          </span>
          <Badge variant="secondary">{getTotalItems()} {t('common.item')}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6">
          <div className="space-y-4 py-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <img
                  src={item.menuItem.image}
                  alt={item.menuItem.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm line-clamp-1">
                    {item.menuItem.name}
                  </h4>
                  <p className="text-sm text-primary font-medium">
                    {formatPrice(item.menuItem.price)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-7 w-7"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-7 w-7"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="h-7 w-7 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">
                    {formatPrice(item.menuItem.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <Separator />
      <CardFooter className="flex-col gap-4 p-6">
        <div className="w-full flex justify-between items-center">
          <span className="text-lg font-semibold">{t('common.total')}</span>
          <span className="text-2xl font-bold text-primary">
            {formatPrice(getTotalPrice())}
          </span>
        </div>
        <Button
          className="w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          size="lg"
          onClick={() => router.push('/checkout')}
        >
          {t('common.checkout')}
        </Button>
      </CardFooter>
    </Card>
  );
}
