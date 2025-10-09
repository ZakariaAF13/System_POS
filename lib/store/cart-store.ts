import { create } from 'zustand';
import { CartItem, MenuItem } from '../types';

interface CartState {
  items: CartItem[];
  tableId: string | null;
  addItem: (menuItem: MenuItem, quantity?: number, notes?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  setTableId: (tableId: string) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  tableId: null,

  addItem: (menuItem, quantity = 1, notes = '') => {
    set((state) => {
      const existingItem = state.items.find(
        (item) => item.menuItem.id === menuItem.id
      );

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.menuItem.id === menuItem.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            id: `${menuItem.id}-${Date.now()}`,
            menuItem,
            quantity,
            notes,
          },
        ],
      };
    });
  },

  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    }));
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    }));
  },

  updateNotes: (itemId, notes) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, notes } : item
      ),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  setTableId: (tableId) => {
    set({ tableId });
  },

  getTotalPrice: () => {
    return get().items.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0
    );
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
}));
