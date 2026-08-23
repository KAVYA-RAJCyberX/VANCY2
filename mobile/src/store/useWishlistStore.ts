import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../services/product.service';

interface WishlistState {
  items: Product[];
  addItem: (item: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        if (!state.items.find(i => i._id === item._id)) {
          return { items: [...state.items, item] };
        }
        return state;
      }),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item._id !== productId)
      })),
      isInWishlist: (productId) => {
        return get().items.some(item => item._id === productId);
      }
    }),
    {
      name: 'vancy-wishlist-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
