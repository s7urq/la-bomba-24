import type { CategorySlug } from "@/config/categories";

/** "kg" significa que `precio` es por kilo y la cantidad se cuenta en gramos. */
export type ProductUnit = "unidad" | "kg";

/**
 * Una forma concreta de llevarse el producto: los 100 g al precio de lista o
 * los 250 g en oferta. Cada una es un botón propio en la card.
 *
 * Se modela con el precio total ya resuelto, no con un precio por gramo: así
 * una presentación se comporta igual que un producto por unidad y el carrito,
 * los totales y el mensaje de WhatsApp funcionan sin cambiar nada.
 */
export interface Presentacion {
  gramos: number;
  /** Lo que sale esa cantidad, cerrado. */
  precio: number;
  oferta: boolean;
}

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
  /** Vacío = se vende por unidad. Con opciones, cada una es un botón. */
  presentaciones: Presentacion[];
}

export interface DeliveryZone {
  nombre: string;
  costo: number;
  pedidoMinimo: number;
  minutos: number | null;
  /** Radio en km desde el local. `null` en planillas sin la columna `km`. */
  km: number | null;
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
  /**
   * Gramos de la presentación elegida. Sólo para mostrar y para el mensaje de
   * WhatsApp: el precio de la línea ya sale de `precio` × `cantidad`, porque
   * `precio` es el de esa presentación cerrada.
   */
  gramos?: number;
}
