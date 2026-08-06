import type { CategorySlug } from "@/config/categories";

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
  cantidad: number;
}
