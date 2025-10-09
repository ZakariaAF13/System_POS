'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UtensilsCrossed, Tag, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { useLanguage } from '@/lib/contexts/language-context';

interface BottomButtonBarProps {
  activeSection: 'menu' | 'promo' | 'cart';
  onSectionChange: (section: 'menu' | 'promo' | 'cart') => void;
}

export function BottomButtonBar({ activeSection, onSectionChange }: BottomButtonBarProps) {
  const { getTotalItems } = useCartStore();
  const { t } = useLanguage();
  const totalItems = getTotalItems();

  const navItems = [
    { id: 'menu' as const, label: t('navigation.menu'), icon: UtensilsCrossed },
    { id: 'promo' as const, label: t('navigation.promo'), icon: Tag },
    { id: 'cart' as const, label: t('navigation.cart'), icon: ShoppingCart, badge: totalItems },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="grid grid-cols-3 gap-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              className="flex flex-col h-auto py-3 relative"
              onClick={() => onSectionChange(item.id)}
            >
              <div className="relative">
                <Icon className="h-5 w-5 mb-1" />
                {item.badge && item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
