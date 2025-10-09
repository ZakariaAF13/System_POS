'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { mockMenuItems, mockPromotions } from '@/lib/data/mock-data';
import { PromotionsCarousel } from '@/components/order/promotions-carousel';
import { MenuCard } from '@/components/order/menu-card';
import { ShoppingCart } from '@/components/order/shopping-cart';
import { SidebarNavigation } from '@/components/order/sidebar-navigation';
import { MobileNavbar } from '@/components/order/mobile-navbar';
import { BottomButtonBar } from '@/components/order/bottom-button-bar';

function OrderPageContent() {
  const searchParams = useSearchParams();
  const [tableId, setTableId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'menu' | 'promo' | 'cart'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { addItem, setTableId: setCartTableId } = useCartStore();

  useEffect(() => {
    const tableIdParam = searchParams.get('tableId');
    if (tableIdParam) {
      setTableId(tableIdParam);
      setCartTableId(tableIdParam);
    }
  }, [searchParams, setCartTableId]);

  if (!tableId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Table ID tidak ditemukan. Silakan scan QR Code yang tersedia di meja Anda.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const categories = ['all', ...Array.from(new Set(mockMenuItems.map((item) => item.category)))];
  const filteredMenuItems = selectedCategory === 'all'
    ? mockMenuItems
    : mockMenuItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <MobileNavbar activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="flex h-screen md:h-auto">
        <SidebarNavigation activeSection={activeSection} onSectionChange={setActiveSection} />

        <main className="flex-1 overflow-auto pb-20 md:pb-6">
          <div className="container max-w-7xl mx-auto p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Selamat Datang</h1>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Meja:</span>
                  <Badge variant="default" className="text-base px-3 py-1">
                    {tableId}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="md:hidden">
              {activeSection === 'menu' && (
                <div>
                  <PromotionsCarousel promotions={mockPromotions} />

                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
                    <TabsList className="w-full justify-start overflow-x-auto">
                      {categories.map((category) => (
                        <TabsTrigger key={category} value={category} className="capitalize">
                          {category === 'all' ? 'Semua' : category}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredMenuItems.map((item) => (
                      <MenuCard key={item.id} item={item} onAddToCart={addItem} />
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'promo' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Promo Spesial</h2>
                  <div className="space-y-4">
                    {mockPromotions.map((promo) => (
                      <PromotionsCarousel key={promo.id} promotions={[promo]} />
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'cart' && <ShoppingCart />}
            </div>

            <div className="hidden md:grid md:grid-cols-3 gap-6">
              <div className="col-span-2">
                <PromotionsCarousel promotions={mockPromotions} />

                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
                  <TabsList>
                    {categories.map((category) => (
                      <TabsTrigger key={category} value={category} className="capitalize">
                        {category === 'all' ? 'Semua' : category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredMenuItems.map((item) => (
                    <MenuCard key={item.id} item={item} onAddToCart={addItem} />
                  ))}
                </div>
              </div>

              <div className="col-span-1">
                <div className="sticky top-6">
                  <ShoppingCart />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomButtonBar activeSection={activeSection} onSectionChange={setActiveSection} />
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <OrderPageContent />
    </Suspense>
  );
}
