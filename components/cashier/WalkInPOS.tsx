'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, User, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ConfirmationModal from './ConfirmationModal';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  available: boolean;
}

interface Table {
  id: string;
  table_number: string;
  status: string;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes: string;
}

interface WalkInPOSProps {
  onOrderCreated: () => void;
}

export default function WalkInPOS({ onOrderCreated }: WalkInPOSProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<'walk-in' | 'dine-in'>('walk-in');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMenuItems();
    fetchTables();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .order('category')
        .order('name');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('table_number');

      if (error) throw error;
      setTables(data || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const categories = ['all', ...Array.from(new Set(menuItems.map((item) => item.category)))];

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find((item) => item.menuItem.id === menuItem.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.menuItem.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { menuItem, quantity: 1, notes: '' }]);
    }
  };

  const updateQuantity = (menuItemId: string, change: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.menuItem.id === menuItemId) {
            const newQuantity = item.quantity + change;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter((item) => item.menuItem.id !== menuItemId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.menuItem.price * item.quantity, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, '0');
    return `ORD-${timestamp}${random}`;
  };

  const handleSubmitOrder = () => {
    if (cart.length === 0) return;
    if (orderType === 'dine-in' && !selectedTable) return;
    setShowConfirmModal(true);
  };

  const confirmSubmitOrder = async () => {
    if (cart.length === 0) return;

    setSubmitting(true);

    try {
      const orderNumber = generateOrderNumber();
      const totalAmount = calculateTotal();

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          table_id: orderType === 'dine-in' ? selectedTable : null,
          type: orderType,
          status: 'pending',
          total_amount: totalAmount,
          customer_name: customerName || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map((item) => ({
        order_id: (orderData as any).id,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        price: item.menuItem.price,
        subtotal: item.menuItem.price * item.quantity,
        notes: item.notes || null,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

      if (itemsError) throw itemsError;

      setCart([]);
      setCustomerName('');
      setSelectedTable(null);
      setShowConfirmModal(false);
      onOrderCreated();
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-slate-700" />
          Walk-In POS
        </h2>
        <p className="text-sm text-gray-600 mt-1">Create new orders quickly</p>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-6 space-y-4 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setOrderType('walk-in')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                orderType === 'walk-in'
                  ? 'bg-slate-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Walk-In
            </button>
            <button
              onClick={() => setOrderType('dine-in')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                orderType === 'dine-in'
                  ? 'bg-slate-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Dine-In
            </button>
          </div>

          {orderType === 'dine-in' && (
            <select
              value={selectedTable || ''}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
            >
              <option value="">Select Table</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.table_number}
                </option>
              ))}
            </select>
          )}

          <input
            type="text"
            placeholder="Customer Name (optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
          />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedCategory === category
                    ? 'bg-slate-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                <p className="mt-2 text-gray-600 text-sm">Loading menu...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-slate-300 transition text-left"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">
                      {formatCurrency(item.price)}
                    </span>
                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded">
                      {item.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h3 className="font-bold text-gray-900 mb-3">
            Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
          </h3>

          {cart.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Cart is empty</p>
          ) : (
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.menuItem.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div className="flex-1 mr-3">
                    <p className="font-medium text-sm text-gray-900">{item.menuItem.name}</p>
                    <p className="text-xs text-gray-600">{formatCurrency(item.menuItem.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.menuItem.id, -1)}
                      className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menuItem.id, 1)}
                      className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.menuItem.id)}
                      className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-300">
            <span className="font-bold text-lg text-gray-900">Total:</span>
            <span className="font-bold text-xl text-slate-900">{formatCurrency(calculateTotal())}</span>
          </div>

          <button
            onClick={handleSubmitOrder}
            disabled={cart.length === 0 || (orderType === 'dine-in' && !selectedTable)}
            className="w-full py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Order
          </button>
        </div>
      </div>

      {showConfirmModal && (
        <ConfirmationModal
          title="Confirm Order"
          message={`Submit order with ${cart.length} item(s) for a total of ${formatCurrency(calculateTotal())}?`}
          onConfirm={confirmSubmitOrder}
          onCancel={() => setShowConfirmModal(false)}
          confirmText="Submit Order"
          confirmButtonClass="bg-green-600 hover:bg-green-700"
          loading={submitting}
        />
      )}
    </div>
  );
}
