import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CartItem, Product } from "@/types/domain";

interface CartState {
  items: CartItem[];
  freeText: string;
  hydrated: boolean;
  addProduct: (product: Product) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  setFreeText: (value: string) => void;
  clearCart: () => void;
  reconcileProducts: (products: Product[]) => void;
  markHydrated: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      freeText: "",
      hydrated: false,
      addProduct: (product) => {
        if (!product.disponible) return;

        set((state) => {
          const current = state.items.find((item) => item.id === product.id);
          if (current) {
            return {
              items: state.items.map((item) =>
                item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                id: product.id,
                categoria: product.categoria,
                marca: product.marca,
                nombre: product.nombre,
                descripcion: product.descripcion,
                precio: product.precio,
                imagen: product.imagen,
                cantidad: 1,
              },
            ],
          };
        });
      },
      setQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.id !== id)
              : state.items.map((item) =>
                  item.id === id ? { ...item, cantidad: Math.min(quantity, 99) } : item,
                ),
        })),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      setFreeText: (freeText) => set({ freeText }),
      clearCart: () => set({ items: [], freeText: "" }),
      reconcileProducts: (products) => {
        const current = new Map(
          products.filter((product) => product.disponible).map((product) => [product.id, product]),
        );

        set((state) => ({
          items: state.items.flatMap((item) => {
            const product = current.get(item.id);
            if (!product) return [];
            return [
              {
                ...item,
                categoria: product.categoria,
                marca: product.marca,
                nombre: product.nombre,
                descripcion: product.descripcion,
                precio: product.precio,
                imagen: product.imagen,
              },
            ];
          }),
        }));
      },
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "la-bomba-24:carrito:v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, freeText: state.freeText }),
      skipHydration: true,
    },
  ),
);

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.precio * item.cantidad, 0);
}

export function cartQuantity(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.cantidad, 0);
}
