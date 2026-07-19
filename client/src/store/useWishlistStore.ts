import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axios';

export interface WishlistItem {
  id: string; // Product ID
  name: string;
  price: number;
  image: string;
  originalPrice?: number;
}

interface WishlistState {
  items: WishlistItem[];
  sessionId: string;
  fetchWishlist: () => Promise<void>;
  addItem: (item: WishlistItem) => Promise<void>; // actually it toggles on the backend
}

const generateSessionId = () => Math.random().toString(36).substring(2, 15);

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      sessionId: generateSessionId(),
      
      fetchWishlist: async () => {
        try {
          const { sessionId } = get();
          const { data } = await api.get(`/wishlist?sessionId=${sessionId}`);
          if (data && data.products) {
            const formattedItems = data.products.map((p: any) => ({
              id: p._id,
              name: p.name,
              price: p.price,
              image: p.images?.[0] || '',
              originalPrice: p.originalPrice
            }));
            set({ items: formattedItems });
          }
        } catch (error) {
          console.error('Failed to fetch wishlist', error);
        }
      },

      addItem: async (item) => {
        try {
          const { sessionId } = get();
          await api.post('/wishlist', {
            productId: item.id,
            sessionId
          });
          // After toggling on the backend, refetch to keep perfectly in sync
          await get().fetchWishlist();
        } catch (error) {
          console.error('Failed to toggle wishlist item', error);
        }
      },
    }),
    {
      name: 'vancy-wishlist-storage',
      partialize: (state) => ({ sessionId: state.sessionId }), // Only persist sessionId locally
    }
  )
);
