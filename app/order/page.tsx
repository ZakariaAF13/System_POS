'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { supabase } from '@/lib/supabase';
import { MenuItem, Promotion } from '@/lib/types';
import { PromotionsCarousel } from '@/components/order/promotions-carousel';
import { PromotionsBanner } from '@/components/order/PromotionsBanner';
import { MenuCard } from '@/components/order/menu-card';
import { ShoppingCart } from '@/components/order/shopping-cart';
import { SidebarNavigation } from '@/components/order/sidebar-navigation';
import { MobileNavbar } from '@/components/order/mobile-navbar';
import { BottomButtonBar } from '@/components/order/bottom-button-bar';
import { useLanguage } from '@/lib/contexts/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';

function OrderPageContent() {
  const searchParams = useSearchParams();
  const [tableId, setTableId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'menu' | 'promo' | 'cart'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, setTableId: setCartTableId } = useCartStore();
  const { t } = useLanguage();

  useEffect(() => {
    const tableIdParam = searchParams.get('tableId');
    if (tableIdParam) {
      setTableId(tableIdParam);
      setCartTableId(tableIdParam);
    }
  }, [searchParams, setCartTableId]);

  // Fetch menu items from Supabase
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('available', true)
          .order('category')
          .order('name');
        
        if (error) throw error;
        
        // Map database fields to MenuItem type
        const items: MenuItem[] = (data || []).map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          image: item.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
          category: item.category,
          available: item.available,
        }));
        
        setMenuItems(items);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('menu_items-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
        fetchMenuItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch promotions from Supabase
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const { data, error } = await supabase
          .from('promotions')
          .select('*')
          .eq('active', true)
          .order('title');
        
        if (error) throw error;
        
        // Map database fields to Promotion type
        const promos: Promotion[] = (data || []).map((promo) => ({
          id: promo.id,
          title: promo.title,
          description: promo.description || '',
          image: promo.image_url || 'https://images.pexels.com/photos/2433979/pexels-photo-2433979.jpeg',
          discount: promo.discount,
          active: promo.active,
        }));
        
        setPromotions(promos);
      } catch (error) {
        console.error('Error fetching promotions:', error);
      }
    };

    fetchPromotions();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('promotions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promotions' }, () => {
        fetchPromotions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!tableId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('error.title')}</AlertTitle>
          <AlertDescription>
            {t('error.noTableId')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const categories = ['all', ...Array.from(new Set(menuItems.map((item) => item.category)))];
  const filteredMenuItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <MobileNavbar activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="flex h-screen md:h-auto">
        <SidebarNavigation activeSection={activeSection} onSectionChange={setActiveSection} />

        <main className="flex-1 overflow-auto pb-20 md:pb-6">
          <div className="container max-w-7xl mx-auto p-4 md:p-6">
            <PromotionsBanner />
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{t('common.welcome')}</h1>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{t('common.table')}:</span>
                  <Badge variant="default" className="text-base px-3 py-1">
                    {tableId}
                  </Badge>
                </div>
              </div>
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>
            </div>

            <div className="md:hidden">
              {activeSection === 'menu' && (
                <div>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading menu...</p>
                    </div>
                  ) : (
                    <>
                      <PromotionsCarousel promotions={promotions} />

                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
                    <TabsList className="w-full justify-start overflow-x-auto">
                      {categories.map((category) => (
                        <TabsTrigger key={category} value={category} className="capitalize">
                          {category === 'all' ? t('common.all') : category}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredMenuItems.length > 0 ? (
                          filteredMenuItems.map((item) => (
                            <MenuCard key={item.id} item={item} onAddToCart={addItem} />
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-8 text-muted-foreground">
                            {t('common.noItems') || 'Belum ada menu tersedia'}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeSection === 'promo' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">{t('promo.specialPromo')}</h2>
                  <div className="space-y-4">
                    {promotions.length > 0 ? (
                      promotions.map((promo) => (
                        <PromotionsCarousel key={promo.id} promotions={[promo]} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        {t('common.noPromos') || 'Belum ada promo tersedia'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSection === 'cart' && <ShoppingCart />}
            </div>

            <div className="hidden md:block">
              {activeSection === 'menu' && (
                <div>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading menu...</p>
                    </div>
                  ) : (
                    <>
                      <PromotionsCarousel promotions={promotions} />

                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
                    <TabsList>
                      {categories.map((category) => (
                        <TabsTrigger key={category} value={category} className="capitalize">
                          {category === 'all' ? t('common.all') : category}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredMenuItems.length > 0 ? (
                          filteredMenuItems.map((item) => (
                            <MenuCard key={item.id} item={item} onAddToCart={addItem} />
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-8 text-muted-foreground">
                            {t('common.noItems') || 'Belum ada menu tersedia'}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeSection === 'promo' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">{t('promo.specialPromo')}</h2>
                  <div className="space-y-4">
                    {promotions.length > 0 ? (
                      promotions.map((promo) => (
                        <PromotionsCarousel key={promo.id} promotions={[promo]} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        {t('common.noPromos') || 'Belum ada promo tersedia'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSection === 'cart' && (
                <div className="max-w-xl">
                  <div className="sticky top-6">
                    <ShoppingCart />
                  </div>
                </div>
              )}
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
