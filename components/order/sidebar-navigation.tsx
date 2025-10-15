'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UtensilsCrossed, Tag, ShoppingCart, Shield } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/language-context';
import { useAuth } from '@/lib/contexts/auth-context';
import Link from 'next/link';

interface SidebarNavigationProps {
  activeSection: 'menu' | 'promo' | 'cart' ;
  onSectionChange: (section: 'menu' | 'promo' | 'cart' ) => void;
}

export function SidebarNavigation({ activeSection, onSectionChange }: SidebarNavigationProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isAdmin = ((user?.user_metadata as Record<string, unknown>)?.role === 'admin');

  const navItems = [
    { id: 'menu' as const, label: t('navigation.menu'), icon: UtensilsCrossed },
    { id: 'promo' as const, label: t('navigation.promo'), icon: Tag },
    { id: 'cart' as const, label: t('navigation.cart'), icon: ShoppingCart },
  ];

  return (
    <aside className="hidden md:block w-64 border-r bg-muted/30">
      <ScrollArea className="h-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Coffee shops</h2>
          <nav className="space-y-2" role="tablist" aria-label="Sidebar Navigation" aria-orientation="vertical">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  type="button"
                  role="tab"
                  aria-selected={activeSection === item.id}
                  onClick={() => onSectionChange(item.id)}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {item.label}
                </Button>
              );
            })}
            {isAdmin && (
              <div className="pt-4 mt-4 border-t">
                <Link href="/admin">
                  <Button variant="ghost" className="w-full justify-start" type="button">
                    <Shield className="mr-2 h-5 w-5" />
                    Admin
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </ScrollArea>
    </aside>
  );
}
