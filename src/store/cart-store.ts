import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { amountStep, clampAmount, initialAmount, isByWeight, lineTotal } from "@/lib/pricing";
import type { CartItem, Presentacion, Product } from "@/types/domain";

/**
 * Los 250 g y los 100 g del mismo fiambre son dos líneas distintas del pedido,
 * con precio distinto, así que necesitan id distinto. El id del producto queda
 * como prefijo para poder reencontrarlo cuando la planilla se actualiza.
 */
export function lineId(product: Pick<Product, "id">, presentacion?: Presentacion): string {
  return presentacion ? `${product.id}#${presentacion.gramos}` : product.id;
}

function baseId(id: string): string {
  return id.split("#")[0];
}

interface CartState {
  items: CartItem[];
  freeText: string;
  hydrated: boolean;
  addProduct: (product: Product, presentacion?: Presentacion) => void;
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
      addProduct: (product, presentacion) => {
        if (!product.disponible) return;

        const id = lineId(product, presentacion);

        set((state) => {
          const current = state.items.find((item) => item.id === id);
          if (current) {
            return {
              items: state.items.map((item) =>
                item.id === id
                  ? { ...item, cantidad: clampAmount(item, item.cantidad + amountStep(item)) }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                id,
                categoria: product.categoria,
                marca: product.marca,
                nombre: product.nombre,
                descripcion: product.descripcion,
                // El precio de la presentación ya es el total de esa cantidad,
                // así que la línea se cuenta como cualquier producto suelto.
                precio: presentacion ? presentacion.precio : product.precio,
                imagen: product.imagen,
                cantidad: presentacion ? 1 : initialAmount(product),
                unidad: presentacion ? "unidad" : product.unidad,
                gramos: presentacion?.gramos,
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
                  item.id === id ? { ...item, cantidad: clampAmount(item, quantity) } : item,
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
            const product = current.get(baseId(item.id));
            if (!product) return [];

            // Si la línea era una presentación, sigue valiendo sólo mientras la
            // planilla siga ofreciendo esos mismos gramos: si sacaron la oferta
            // de 250 g, la línea se cae en vez de quedar con un precio viejo.
            if (item.gramos !== undefined) {
              const presentacion = product.presentaciones.find((p) => p.gramos === item.gramos);
              if (!presentacion) return [];
              return [
                {
                  ...item,
                  categoria: product.categoria,
                  marca: product.marca,
                  nombre: product.nombre,
                  descripcion: product.descripcion,
                  precio: presentacion.precio,
                  imagen: product.imagen,
                  unidad: "unidad" as const,
                },
              ];
            }

            return [
              {
                ...item,
                categoria: product.categoria,
                marca: product.marca,
                nombre: product.nombre,
                descripcion: product.descripcion,
                precio: product.precio,
                imagen: product.imagen,
                unidad: product.unidad,
                // Si la planilla cambió de unidad a peso, la cantidad vieja
                // (1, 2) sería 1 gramo: hay que reencuadrarla.
                cantidad: clampAmount(product, item.cantidad),
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
  return items.reduce((total, item) => total + lineTotal(item), 0);
}

/** Un fiambre cuenta como un ítem, no como 500: son gramos, no productos. */
export function cartQuantity(items: CartItem[]): number {
  return items.reduce((total, item) => total + (isByWeight(item) ? 1 : item.cantidad), 0);
}
