import type { CategorySlug } from "@/config/categories";

/** "kg" significa que `precio` es por kilo y la cantidad se cuenta en gramos. */
export type ProductUnit = "unidad" | "kg";

export interface Product {
  id: string;
  categoria: CategorySlug;
  marca: string;
  nombre: string;
  descripcion: string;
  precio: number;
  destacado: boolean;
  disponible: boolean;
  imagen: string;
  /** Subdivisión dentro de la categoría. Vacío = se agrupa por heurística. */
  seccion: string;
  unidad: ProductUnit;
}

export interface DeliveryZone {
  nombre: string;
  costo: number;
  pedidoMinimo: number;
  minutos: number | null;
}

export interface StoreConfig {
  deliveryActivo: boolean;
  mensajeCerrado: string;
  whatsapp: string;
  horarioTexto: string;
}

export interface CatalogData {
  products: Product[];
  zones: DeliveryZone[];
  config: StoreConfig;
}

export type SheetSource = "fresh" | "cache" | "missing";

export interface SheetHealth {
  source: SheetSource;
  message?: string;
}

export interface CatalogHealth {
  products: SheetHealth;
  zones: SheetHealth;
  config: SheetHealth;
}

export interface CartItem {
  id: string;
  categoria: CategorySlug;
  marca: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  /** Unidades sueltas, o gramos cuando `unidad` es "kg". */
  cantidad: number;
  /** Opcional: los carritos ya persistidos en localStorage no lo traen. */
  unidad?: ProductUnit;
}
