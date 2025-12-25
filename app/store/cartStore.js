import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(persist((set, get) => ({
  items: [], // { productId, product, qty }

  addItem: (product, qty = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === product._id);
      if (existing) {
        const newQty = Math.min((existing.qty || 0) + qty, product.quantity || Infinity);
        return { items: state.items.map((i) => i.productId === product._id ? { ...i, qty: newQty } : i) };
      }
      return { items: [...state.items, { productId: product._id, product, qty: Math.min(qty, product.quantity || Infinity) }] };
    });
  },

  removeItem: (productId) => set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

  updateQty: (productId, qty) => set((state) => ({
    items: state.items.map((i) => i.productId === productId ? { ...i, qty: Math.max(1, Math.min(qty, i.product.quantity || Infinity)) } : i)
  })),

  clear: () => set({ items: [] }),

  getTotalItems: () => get().items.reduce((s, i) => s + (i.qty || 0), 0),
  getTotalPrice: () => get().items.reduce((s, i) => s + (i.qty || 0) * (i.product.price || 0), 0),
}), {
  name: 'krisi_cart',
  getStorage: () => (typeof window !== 'undefined' ? localStorage : undefined),
}));
