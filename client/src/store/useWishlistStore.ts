import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axios';
import { useToastStore } from './useToastStore';

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
  addItem: (item: WishlistItem) => Promise<void>; // toggles on the backend
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const generateSessionId = () => Math.random().toString(36).substring(2, 15);

const formatWishlistItems = (wishlistData: any): WishlistItem[] => {
  if (!wishlistData || !wishlistData.products) return [];
  return wishlistData.products
    .filter((p: any) => p && typeof p === 'object')
    .map((p: any) => ({
      id: p._id,
      name: p.name,
      price: p.price,
      image: p.images?.[0] || '',
      originalPrice: p.originalPrice
    }));
};

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
            set({ items: formatWishlistItems(data) });
          }
        } catch (error) {
          console.error('Failed to fetch wishlist', error);
        }
      },

      addItem: async (item) => {
        try {
          const { sessionId, items } = get();
          const wasInWishlist = items.some(i => i.id === item.id);
          
          const { data } = await api.post('/wishlist/toggle', {
            productId: item.id,
            sessionId
          });
          
          if (data && data.products) {
            set({ items: formatWishlistItems(data) });
          }
          
          // Fire toast
          if (wasInWishlist) {
            useToastStore.getState().addToast({ type: 'info', message: 'Removed from Wishlist' });
          } else {
            useToastStore.getState().addToast({
              type: 'wishlist',
              message: 'Added to Wishlist',
              image: item.image
            });
          }
        } catch (error) {
          console.error('Failed to toggle wishlist item', error);
          useToastStore.getState().addToast({ type: 'error', message: 'Failed to update wishlist' });
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.some(i => i.id === productId);
      },

      clearWishlist: () => set({ items: [], sessionId: generateSessionId() }),
    }),
    {
      name: 'vancy-wishlist-storage',
      partialize: (state) => ({ sessionId: state.sessionId }),
    }
  )
);
