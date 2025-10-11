import { addDoc, collection, doc, serverTimestamp, updateDoc, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  const ref = await addDoc(collection(db, 'orders'), {
    tableId: params.tableId,
    items: params.items,
    totalAmount: params.totalAmount,
    status: params.status ?? 'pending',
    createdAt: serverTimestamp(),
    customerName: params.customerName ?? null,
    phone: params.phone ?? null,
    address: params.address ?? null,
    notes: params.notes ?? null,
    deliveryMethod: params.deliveryMethod ?? 'dine_in',
  });
  return ref.id;
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
  await updateDoc(doc(db, 'orders', orderId), {
    status,
  });
}

export async function getActivePromotions(): Promise<Promotion[]> {
  const q = query(collection(db, 'promotions'), where('active', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) } as Promotion));
}
