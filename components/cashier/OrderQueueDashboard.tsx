'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Clock, ChevronRight, MapPin, Lock } from 'lucide-react';

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

interface OrderQueueDashboardProps {
  orders: Order[];
  onRefresh: () => void;
}

export default function OrderQueueDashboard({ orders, onRefresh }: OrderQueueDashboardProps) {
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Pembayaran';
      case 'paid':
        return 'Dibayar';
      case 'preparing':
        return 'Sedang Disiapkan';
      case 'ready':
        return 'Siap Disajikan';
      case 'completed':
        return 'Selesai';
      default:
        return status;
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error updating order status:', error);
      // Surface common error fields if present
      // @ts-ignore
      if (error && (error.message || error.details || error.code)) {
        // @ts-ignore
        console.error('Update status details:', { code: error.code, message: error.message, details: error.details });
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
      case 'paid':
        return 'preparing';
      case 'preparing':
        return 'ready';
      case 'ready':
        return 'completed';
      default:
        return null;
    }
  };

  const getNextStatusLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
      case 'paid':
        return 'Mulai Siapkan';
      case 'preparing':
        return 'Tandai Siap';
      case 'ready':
        return 'Selesaikan';
      default:
        return null;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-bold">Pesanan Masuk</span>
          <Badge variant="secondary" className="text-sm">
            {orders.length} Pesanan
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4">
        {orders.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Tidak ada pesanan masuk</p>
              <p className="text-sm text-gray-400">Pesanan baru akan muncul di sini</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const nextStatus = getNextStatus(order.status);
              const nextStatusLabel = getNextStatusLabel(order.status);
              const isUpdating = updatingOrderId === order.id;

              return (
                <Card key={order.id} className="border-2 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">#{order.order_number}</h3>
                          <Badge className={`${getStatusColor(order.status)} border`}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>Meja {order.table_id}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(order.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{order.customer_name}</p>
                        <p className="text-xs text-gray-500">{order.phone}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3 bg-gray-50 rounded-lg p-3">
                      {order.items.map((item: OrderItem, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <div className="flex-1">
                            <span className="font-medium">{item.quantity}x</span>{' '}
                            <span>{item.menuItem.name}</span>
                            {item.notes && (
                              <p className="text-xs text-gray-500 ml-6 mt-1">
                                Note: {item.notes}
                              </p>
                            )}
                          </div>
                          <span className="text-gray-600">
                            {formatPrice(item.menuItem.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t border-gray-200 font-bold">
                        <span>Total</span>
                        <span className="text-primary">{formatPrice(order.total_amount)}</span>
                      </div>
                    </div>

                    {nextStatus && (
                      (() => {
                        const isLocked = order.status === 'pending';
                        return (
                          <div className="w-full group">
                            <Button
                              onClick={() => !isLocked && handleStatusUpdate(order.id, nextStatus)}
                              disabled={isUpdating || isLocked}
                              className={`w-full ${isLocked ? 'cursor-not-allowed' : ''}`}
                              size="sm"
                              title={isLocked ? 'Pesanan belum dibayar' : undefined}
                              aria-disabled={isLocked}
                            >
                              {isUpdating ? (
                                <span className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Memperbarui...
                                </span>
                              ) : isLocked ? (
                                <span className="flex items-center gap-2">
                                  {nextStatusLabel}
                                  <Lock className="w-4 h-4 text-gray-500 opacity-60 group-hover:opacity-100 transition-opacity duration-150" />
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  {nextStatusLabel}
                                  <ChevronRight className="w-4 h-4" />
                                </span>
                              )}
                            </Button>
                          </div>
                        );
                      })()
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
