'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/contexts/auth-context';
import OrderQueueDashboard from './OrderQueueDashboard';
import WalkInPOSDashboard from './WalkInPOSDashboard';
import { LogOut, RefreshCw, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderItem {
  id: string;
  quantity: number;
  menuItem: {
    name: string;
    price: number;
  };
  notes?: string;
}

interface Order {
  id: string;
  order_number: string;
  table_id: string;
  customer_name: string;
  phone: string;
  delivery_method: string;
  items: OrderItem[];
  total_amount: number;
  status: string;
  created_at: string;
}

export default function CashierDashboard() {
  const { signOut, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(new Date());

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['pending', 'paid', 'preparing', 'ready'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      setOrders((data || []) as Order[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('dashboard-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order change detected:', payload);
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const formattedShort = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Kasir</h1>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-start md:items-center gap-2 md:gap-4 flex-col md:flex-row">
              <span className="text-sm text-gray-700 whitespace-nowrap">{formattedShort}</span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={handleSignOut}
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 font-medium">Memuat dashboard...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
            <OrderQueueDashboard orders={orders} onRefresh={fetchOrders} />
            <WalkInPOSDashboard onOrderCreated={fetchOrders} />
          </div>
        )}
      </main>
    </div>
  );
}
