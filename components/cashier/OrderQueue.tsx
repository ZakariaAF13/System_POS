'use client';

import { useState } from 'react';
import { Clock, Users, DollarSign, CheckCircle } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import { supabase } from '@/lib/supabase';

export interface OrderWithDetails {
  id: string;
  order_number: string;
  table_id: string | null;
  type: 'dine-in' | 'walk-in';
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total_amount: number;
  customer_name: string | null;
  notes: string | null;
  created_at: string;
  tables: { table_number: string } | null;
  order_items: Array<{
    id: string;
    quantity: number;
    price: number;
    subtotal: number;
    notes: string | null;
    menu_items: { name: string; category: string };
  }>;
}

interface OrderQueueProps {
  orders: OrderWithDetails[];
  onRefresh: () => void;
}

export default function OrderQueue({ orders, onRefresh }: OrderQueueProps) {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [modalAction, setModalAction] = useState<'status' | 'delete' | null>(null);
  const [newStatus, setNewStatus] = useState<'preparing' | 'ready' | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getNextStatus = (currentStatus: string): 'preparing' | 'ready' | null => {
    if (currentStatus === 'pending') return 'preparing';
    if (currentStatus === 'preparing') return 'ready';
    return null;
  };

  const handleUpdateStatus = (order: OrderWithDetails) => {
    const next = getNextStatus(order.status);
    if (next) {
      setSelectedOrder(order);
      setNewStatus(next);
      setModalAction('status');
    }
  };

  const confirmUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', selectedOrder.id);
      if (error) throw error;
      onRefresh();
      closeModal();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setModalAction(null);
    setNewStatus(null);
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-slate-700" />
          Order Queue
        </h2>
        <p className="text-sm text-gray-600 mt-1">{orders.length} active order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <CheckCircle className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">No active orders</p>
            <p className="text-sm">All orders are completed or there are no pending orders</p>
          </div>
        ) : (
          <>
            {pendingOrders.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Pending ({pendingOrders.length})
                </h3>
                <div className="space-y-3">
                  {pendingOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onUpdateStatus={handleUpdateStatus}
                      formatCurrency={formatCurrency}
                      formatTime={formatTime}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                </div>
              </div>
            )}

            {preparingOrders.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Preparing ({preparingOrders.length})
                </h3>
                <div className="space-y-3">
                  {preparingOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onUpdateStatus={handleUpdateStatus}
                      formatCurrency={formatCurrency}
                      formatTime={formatTime}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {modalAction === 'status' && selectedOrder && (
        <ConfirmationModal
          title="Update Order Status"
          message={`Change order ${selectedOrder.order_number} status from "${selectedOrder.status}" to "${newStatus}"?`}
          onConfirm={confirmUpdateStatus}
          onCancel={closeModal}
          confirmText="Update Status"
          confirmButtonClass="bg-blue-600 hover:bg-blue-700"
        />
      )}
    </div>
  );
}

interface OrderCardProps {
  order: OrderWithDetails;
  onUpdateStatus: (order: OrderWithDetails) => void;
  formatCurrency: (amount: number) => string;
  formatTime: (dateString: string) => string;
  getStatusColor: (status: string) => string;
}

function OrderCard({ order, onUpdateStatus, formatCurrency, formatTime, getStatusColor }: OrderCardProps) {
  const nextStatus = order.status === 'pending' ? 'Start Preparing' : 'Mark as Ready';

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-lg text-gray-900">{order.order_number}</h4>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{order.tables?.table_number || 'Walk-In'}</span>
            {order.customer_name && <span>({order.customer_name})</span>}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
          {order.status.toUpperCase()}
        </span>
      </div>

      <div className="space-y-1 mb-3">
        {order.order_items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-700">
              {item.quantity}x {item.menu_items.name}
            </span>
            <span className="text-gray-900 font-medium">{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-300">
        <div className="flex items-center gap-2 text-gray-600">
          <DollarSign className="w-4 h-4" />
          <span className="font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
          <span className="text-xs ml-2">{formatTime(order.created_at)}</span>
        </div>
        <button
          onClick={() => onUpdateStatus(order)}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-sm font-medium"
        >
          {nextStatus}
        </button>
      </div>
    </div>
  );
}
