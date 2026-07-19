import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axios';

export interface CartItem {
  id: string;
  _id?: string; // Backend item id
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartState {
  items: CartItem[];
  sessionId: string;
  fetchCart: () => Promise<void>;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: string, backendItemId?: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number, backendItemId?: string) => Promise<void>;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

// Generate a random session ID if not exists
const generateSessionId = () => Math.random().toString(36).substring(2, 15);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      sessionId: generateSessionId(),
      
      fetchCart: async () => {
        try {
          const { sessionId } = get();
          const { data } = await api.get(`/cart?sessionId=${sessionId}`);
          if (data && data.items) {
            const formattedItems = data.items.map((i: any) => ({
              id: i.product._id || i.product,
              _id: i._id,
              name: i.name,
              price: i.price,
              image: i.image,
              quantity: i.quantity,
              size: i.size,
              color: i.color
            }));
            set({ items: formattedItems });
          }
        } catch (error) {
          console.error('Failed to fetch cart', error);
        }
      },

      addItem: async (item) => {
        try {
          const { sessionId } = get();
          await api.post('/cart', {
            productId: item.id,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            sessionId
          });
          await get().fetchCart();
        } catch (error) {
          console.error('Failed to add item', error);
        }
      },

      removeItem: async (id, backendItemId) => {
        try {
          const { sessionId } = get();
          if (backendItemId) {
            await api.delete(`/cart/${backendItemId}?sessionId=${sessionId}`);
            await get().fetchCart();
          } else {
            set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
          }
        } catch (error) {
          console.error('Failed to remove item', error);
        }
      },

      updateQuantity: async (id, quantity, backendItemId) => {
        try {
          const { sessionId } = get();
          if (backendItemId) {
            await api.put(`/cart/${backendItemId}`, { quantity, sessionId });
            await get().fetchCart();
          } else {
            if (quantity <= 0) {
              get().removeItem(id);
              return;
            }
            set((state) => ({
              items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
            }));
          }
        } catch (error) {
          console.error('Failed to update quantity', error);
        }
      },

      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      totalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: 'vancy-cart-storage',
      partialize: (state) => ({ sessionId: state.sessionId }), // Only persist sessionId locally
    }
  )
);
