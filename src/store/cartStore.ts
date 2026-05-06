import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId?: string;
  comboId?: string;
  customProducts?: string[];
  size?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  type: 'product' | 'combo';
  stock?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            const newQuantity = existingItem.quantity + item.quantity;
            const finalQuantity = item.stock !== undefined ? Math.min(newQuantity, item.stock) : newQuantity;
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: finalQuantity } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((i) => {
            if (i.id === id) {
              const finalQuantity = i.stock !== undefined ? Math.min(quantity, i.stock) : quantity;
              return { ...i, quantity: finalQuantity };
            }
            return i;
          }),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      isCartOpen: false,
      setCartOpen: (open: boolean) => set({ isCartOpen: open }),
    }),
    {
      name: 'rivore-cart',
    }
  )
);
