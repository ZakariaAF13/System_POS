import { supabase } from '@/lib/supabase';
import { CartItem, Order, Promotion } from '@/lib/types';

export async function createOrder(params: {
  tableId: string;
  items: CartItem[];
  totalAmount: number;
  customerName?: string;
  phone?: string;
  address?: string;
  notes?: string;
  deliveryMethod?: 'dine_in' | 'takeaway' | 'delivery';
  status?: Order['status'];
}) {
  const payload = {
    table_id: params.tableId,
    items: params.items as unknown as Record<string, unknown>,
    total_amount: params.totalAmount,
    status: params.status ?? 'pending',
    customer_name: params.customerName ?? null,
    phone: params.phone ?? null,
    address: params.address ?? null,
    notes: params.notes ?? null,
    delivery_method: params.deliveryMethod ?? 'dine_in',
  };

  const { data, error } = await supabase
    .from('orders')
    .insert(payload)
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  if (error) throw error;
}

export async function getActivePromotions(): Promise<Promotion[]> {
  const { data, error } = await supabase
    .from('promotions')
    .select('id, title, description, image, discount, active')
    .eq('active', true);
  if (error) throw error;
  return (data ?? []) as Promotion[];
}
