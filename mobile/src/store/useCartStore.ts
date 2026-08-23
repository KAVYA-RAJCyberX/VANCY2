import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../services/product.service';

export interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existingItem = state.items.find(i => i._id === item._id && i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor);
        if (existingItem) {
          return {
            items: state.items.map(i => i.cartItemId === existingItem.cartItemId ? { ...i, quantity: i.quantity + item.quantity } : i)
          };
        }
        return { items: [...state.items, item] };
      }),
      removeItem: (cartItemId) => set((state) => ({
        items: state.items.filter(item => item.cartItemId !== cartItemId)
      })),
      updateQuantity: (cartItemId, quantity) => set((state) => ({
        items: state.items.map(item => item.cartItemId === cartItemId ? { ...item, quantity } : item)
      })),
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => {
        const state = get();
        return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'vancy-cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
