'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UtensilsCrossed, Tag, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/language-context';

interface SidebarNavigationProps {
  activeSection: 'menu' | 'promo' | 'cart';
  onSectionChange: (section: 'menu' | 'promo' | 'cart') => void;
}

export function SidebarNavigation({ activeSection, onSectionChange }: SidebarNavigationProps) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'menu' as const, label: t('navigation.menu'), icon: UtensilsCrossed },
    { id: 'promo' as const, label: t('navigation.promo'), icon: Tag },
    { id: 'cart' as const, label: t('navigation.cart'), icon: ShoppingCart },
  ];

  return (
    <aside className="hidden md:block w-64 border-r bg-muted/30">
      <ScrollArea className="h-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Restaurant</h2>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => onSectionChange(item.id)}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>
      </ScrollArea>
    </aside>
  );
}
