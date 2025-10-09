'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, UtensilsCrossed, Tag, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/lib/contexts/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';

interface MobileNavbarProps {
  activeSection: 'menu' | 'promo' | 'cart';
  onSectionChange: (section: 'menu' | 'promo' | 'cart') => void;
}

export function MobileNavbar({ activeSection, onSectionChange }: MobileNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const navItems = [
    { id: 'menu' as const, label: t('navigation.menu'), icon: UtensilsCrossed },
    { id: 'promo' as const, label: t('navigation.promo'), icon: Tag },
    { id: 'cart' as const, label: t('navigation.cart'), icon: ShoppingCart },
  ];

  const handleNavigate = (section: 'menu' | 'promo' | 'cart') => {
    onSectionChange(section);
    setIsOpen(false);
  };

  return (
    <header className="md:hidden sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>{t('navigation.navigationMenu')}</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleNavigate(item.id)}
                    >
                      <Icon className="mr-2 h-5 w-5" />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-bold ml-4">Restaurant</h1>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
