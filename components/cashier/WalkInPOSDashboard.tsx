'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { normalizeStorageUrl } from '@/lib/menu-storage';
import { ShoppingCart, Plus, Minus, Trash2, DollarSign, CreditCard, Smartphone } from 'lucide-react';
import PaymentModal from '@/components/checkout/PaymentModal';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes: string;
}

interface WalkInPOSDashboardProps {
  onOrderCreated: () => void;
}

export default function WalkInPOSDashboard({ onOrderCreated }: WalkInPOSDashboardProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [pendingReceipt, setPendingReceipt] = useState<{
    items: { name: string; price: number; quantity: number; subtotal: number }[];
    total: number;
    customerName: string;
    phone: string;
    orderNumber?: string;
    paymentType: 'cash' | 'edc' | 'ewallet';
  } | null>(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState<'cash' | 'edc' | 'ewallet' | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredMenu = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  useEffect(() => {
    let ignore = false;
    const loadMenu = async () => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('available', true)
          .order('category')
          .order('name');
        if (error) throw error;
        if (ignore) return;
        const mapped = (data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: Number(item.price) || 0,
          image: normalizeStorageUrl(item.image_url) || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
          category: item.category,
          available: !!item.available,
        }));
        setMenuItems(mapped);
      } catch (err) {
        console.error('Error loading menu_items:', err);
      }
    };
    loadMenu();
    const channel = supabase
      .channel('cashier-menu-items-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
        loadMenu();
      })
      .subscribe();
    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find(item => item.menuItem.id === menuItem.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.menuItem.id === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { menuItem, quantity: 1, notes: '' }]);
    }
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.menuItem.id === menuItemId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const updateNotes = (menuItemId: string, notes: string) => {
    setCart(cart.map(item =>
      item.menuItem.id === menuItemId ? { ...item, notes } : item
    ));
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter(item => item.menuItem.id !== menuItemId));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setPhone('');
  };

  const printReceipt = (data: {
    items: { name: string; price: number; quantity: number; subtotal: number }[];
    total: number;
    customerName: string;
    phone: string;
    orderNumber?: string;
    paymentType: 'cash' | 'edc' | 'ewallet';
  }) => {
    const w = window.open('', 'PRINT', 'height=600,width=400');
    if (!w) return;
    const date = new Date();
    const formatIDR = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
    const rows = data.items.map(it => `
      <tr>
        <td>${it.quantity}x ${it.name}</td>
        <td style="text-align:right">${formatIDR(it.subtotal)}</td>
      </tr>
    `).join('');
    w.document.write(`
      <html>
        <head>
          <title>Struk</title>
          <style>
            body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 16px; }
            h1 { font-size: 16px; margin: 0 0 8px; }
            .meta { font-size: 12px; color: #555; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            td { padding: 4px 0; }
            .total { border-top: 1px dashed #999; margin-top: 8px; padding-top: 8px; font-weight: 700; }
          </style>
        </head>
        <body>
          <h1>Struk Pembelian</h1>
          <div class="meta">
            No. Order: ${data.orderNumber || '-'}<br />
            Tanggal: ${date.toLocaleDateString('id-ID')} ${date.toLocaleTimeString('id-ID')}<br />
            Pelanggan: ${data.customerName || '-'} / ${data.phone || '-'}<br />
            Pembayaran: ${data.paymentType.toUpperCase()}
          </div>
          <table>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <div class="total">
            Total: ${formatIDR(data.total)}
          </div>
          <p style="margin-top:12px; font-size:12px; text-align:center;">Terima kasih</p>
          <script>window.onload = function(){ window.print(); window.onafterprint = window.close; }<\/script>
        </body>
      </html>
    `);
    w.document.close();
    w.focus();
  };

  const createOrder = async (paymentType: 'cash' | 'edc' | 'ewallet') => {
    if (cart.length === 0 || !customerName || !phone) {
      alert('Mohon lengkapi data pelanggan dan pilih menu');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        table_id: 'walk-in',
        customer_name: customerName,
        phone: phone,
        delivery_method: 'dine_in',
        items: cart.map(item => ({
          id: item.menuItem.id,
          quantity: item.quantity,
          menuItem: {
            name: item.menuItem.name,
            price: item.menuItem.price,
          },
          notes: item.notes,
        })),
        total_amount: getTotalAmount(),
        status: paymentType === 'ewallet' ? 'pending' : 'paid',
      };

      const { data: order, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      const receiptItems = cart.map(ci => ({
        name: ci.menuItem.name,
        price: ci.menuItem.price,
        quantity: ci.quantity,
        subtotal: ci.menuItem.price * ci.quantity,
      }));

      if (paymentType === 'ewallet') {
        setPendingReceipt({
          items: receiptItems,
          total: getTotalAmount(),
          customerName,
          phone,
          orderNumber: (order as any).order_number,
          paymentType: 'ewallet',
        });
        setCurrentOrderId(order.id);
        setShowPaymentModal(true);
      } else {
        setPendingReceipt({
          items: receiptItems,
          total: getTotalAmount(),
          customerName,
          phone,
          orderNumber: (order as any).order_number,
          paymentType,
        });
        setPaymentCompleted(true);
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      if (error && (error.code || error.message || error.details || error.hint)) {
        console.error('Create order details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
      }
      alert(`Gagal membuat pesanan${error?.message ? `: ${error.message}` : ''}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (pendingReceipt) {
      printReceipt(pendingReceipt);
    }
    clearCart();
    setPendingReceipt(null);
    setShowPaymentModal(false);
    onOrderCreated();
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <ShoppingCart className="w-5 h-5" />
          POS Walk-In
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-3 bg-white rounded-lg border-2 border-gray-200 p-4">
            <h3 className="font-semibold text-sm text-gray-700">Data Pelanggan</h3>
            <Input
              placeholder="Nama Pelanggan"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="h-9"
            />
            <Input
              placeholder="No. HP"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-9"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-gray-100 p-1">
              {categories.map(category => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="flex-1 min-w-[80px] text-xs"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={selectedCategory} className="mt-3">
              <div className="grid grid-cols-2 gap-3">
                {filteredMenu.map(item => (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-2"
                    onClick={() => addToCart(item)}
                  >
                    <CardContent className="p-3">
                      <div className="aspect-video relative mb-2 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
                          }}
                        />
                      </div>
                      <h4 className="font-semibold text-sm line-clamp-1 mb-1">{item.name}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary text-sm">
                          {formatPrice(item.price)}
                        </span>
                        <Button size="sm" className="h-7 w-7 p-0">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {cart.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Keranjang</h3>
                <Badge variant="secondary">{cart.length} item</Badge>
              </div>
              <div className="space-y-2">
                {cart.map((item) => (
                  <Card key={item.menuItem.id} className="border">
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <img
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{item.menuItem.name}</h4>
                          <p className="text-xs text-primary font-bold">
                            {formatPrice(item.menuItem.price)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0"
                              onClick={() => updateQuantity(item.menuItem.id, -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-semibold w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0"
                              onClick={() => updateQuantity(item.menuItem.id, 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeFromCart(item.menuItem.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <Textarea
                            placeholder="Catatan..."
                            value={item.notes}
                            onChange={(e) => updateNotes(item.menuItem.id, e.target.value)}
                            className="mt-2 text-xs h-16 resize-none"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t bg-white p-4 space-y-3">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{formatPrice(getTotalAmount())}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => { setSelectedPaymentType('cash'); setPaymentCompleted(false); setPendingReceipt(null); }}
              disabled={isProcessing || cart.length === 0 || !customerName || !phone}
              variant={selectedPaymentType === 'cash' ? 'default' : 'secondary'}
              className="w-full bg-green-600 hover:bg-green-700 h-20 flex flex-col gap-1 data-[variant=secondary]:bg-white data-[variant=secondary]:text-green-700"
            >
              <DollarSign className="w-5 h-5" />
              <span className="text-xs">Cash</span>
            </Button>

            <Button
              onClick={() => { setSelectedPaymentType('edc'); setPaymentCompleted(false); setPendingReceipt(null); }}
              disabled={isProcessing || cart.length === 0 || !customerName || !phone}
              variant={selectedPaymentType === 'edc' ? 'default' : 'secondary'}
              className="w-full bg-blue-600 hover:bg-blue-700 h-20 flex flex-col gap-1 data-[variant=secondary]:bg-white data-[variant=secondary]:text-blue-700"
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-xs">EDC Bank</span>
            </Button>

            <Button
              onClick={() => { setSelectedPaymentType('ewallet'); setPaymentCompleted(false); setPendingReceipt(null); }}
              disabled={isProcessing || cart.length === 0 || !customerName || !phone}
              variant={selectedPaymentType === 'ewallet' ? 'default' : 'secondary'}
              className="w-full bg-purple-600 hover:bg-purple-700 h-20 flex flex-col gap-1 data-[variant=secondary]:bg-white data-[variant=secondary]:text-purple-700"
            >
              <Smartphone className="w-5 h-5" />
              <span className="text-xs">E-Wallet/QRIS</span>
            </Button>
          </div>

          {selectedPaymentType && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                onClick={() => createOrder(selectedPaymentType)}
                disabled={isProcessing || paymentCompleted}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Pembayaran Berhasil
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (pendingReceipt) {
                    printReceipt(pendingReceipt);
                    clearCart();
                    setPendingReceipt(null);
                    setSelectedPaymentType(null);
                    setPaymentCompleted(false);
                    onOrderCreated();
                  } else {
                    printReceipt({
                      items: cart.map(ci => ({
                        name: ci.menuItem.name,
                        price: ci.menuItem.price,
                        quantity: ci.quantity,
                        subtotal: ci.menuItem.price * ci.quantity,
                      })),
                      total: getTotalAmount(),
                      customerName,
                      phone,
                      paymentType: selectedPaymentType!,
                    });
                  }
                }}
                className="w-full"
              >
                Cetak Struk
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {currentOrderId && (
        <PaymentModal
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={getTotalAmount()}
          orderId={currentOrderId}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </Card>
  );
}
