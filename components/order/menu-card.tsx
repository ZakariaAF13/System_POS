'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Plus, Minus } from 'lucide-react';
import { MenuItem } from '@/lib/types';
import { useState } from 'react';
import { useLanguage } from '@/lib/contexts/language-context';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number, notes: string, isTakeaway: boolean) => void;
}

export function MenuCard({ item, onAddToCart }: MenuCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isTakeaway, setIsTakeaway] = useState(false);
  const { t } = useLanguage();

  const handleAddToCart = () => {
    setIsDialogOpen(true);
  };

  const handleContinue = () => {
    onAddToCart(item, quantity, notes, isTakeaway);
    setIsDialogOpen(false);
    setQuantity(1);
    setNotes('');
    setIsTakeaway(false);
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative h-48 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
            }}
          />
          {!item.available && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg">
                {t('common.notAvailable')}
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg line-clamp-1">{item.name}</h3>
            <Badge variant="secondary" className="ml-2 shrink-0">
              {item.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {item.description}
          </p>
          <p className="text-xl font-bold text-primary">
            {formatPrice(item.price)}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
            onClick={handleAddToCart}
            disabled={!item.available}
            className="w-full"
          >
            {t('common.addToCart')}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{item.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative h-48 rounded-lg overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
                }}
              />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {item.description}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t('common.price')}:</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(item.price)}
                </span>
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">
                {t('common.quantity')}
              </Label>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="h-12 w-12"
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <span className="text-2xl font-bold w-16 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                  className="h-12 w-12"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-base font-semibold mb-2 block">
                {t('common.notes')}
              </Label>
              <Textarea
                id="notes"
                placeholder={t('common.notesPlaceholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <Checkbox
                id="takeaway"
                checked={isTakeaway}
                onCheckedChange={(checked) => setIsTakeaway(checked as boolean)}
              />
              <Label
                htmlFor="takeaway"
                className="text-base font-medium cursor-pointer"
              >
                {t('common.takeaway')}
              </Label>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">{t('common.quantity')}</span>
                <span className="font-medium">{quantity}x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">{t('common.total')}</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(item.price * quantity)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleContinue}
              className="flex-1"
            >
              {t('common.continue')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
