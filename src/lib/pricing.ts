import type { CartItem, Product, ProductUnit } from "@/types/domain";

/**
 * Paso de 50 g: es lo que hace que el cuarto (250), el medio (500) y el kilo
 * caigan justo. Con paso de 100 el cuarto no existe, y "un cuarto de jamón"
 * es literalmente como se pide en el mostrador.
 */
export const GRAM_STEP = 50;
export const MIN_GRAMS = 100;
export const MAX_GRAMS = 5000;
export const DEFAULT_GRAMS = 250;
export const MAX_UNITS = 99;

type Priceable = Pick<CartItem, "precio" | "cantidad" | "unidad">;

export function unitOf(item: { unidad?: ProductUnit }): ProductUnit {
  return item.unidad ?? "unidad";
}

export function isByWeight(item: { unidad?: ProductUnit }): boolean {
  return unitOf(item) === "kg";
}

/**
 * Para productos por peso `precio` es por kilo y `cantidad` son gramos, así que
 * el total de la línea se redondea a peso entero: no existe el medio peso.
 */
export function lineTotal(item: Priceable): number {
  return isByWeight(item)
    ? Math.round((item.precio * item.cantidad) / 1000)
    : item.precio * item.cantidad;
}

export function initialAmount(product: Pick<Product, "unidad">): number {
  return product.unidad === "kg" ? DEFAULT_GRAMS : 1;
}

export function amountStep(item: { unidad?: ProductUnit }): number {
  return isByWeight(item) ? GRAM_STEP : 1;
}

export function clampAmount(item: { unidad?: ProductUnit }, amount: number): number {
  if (!isByWeight(item)) return Math.min(Math.max(amount, 0), MAX_UNITS);
  if (amount <= 0) return 0;
  const snapped = Math.round(amount / GRAM_STEP) * GRAM_STEP;
  return Math.min(Math.max(snapped, MIN_GRAMS), MAX_GRAMS);
}

/** 500 → "500 g" · 1000 → "1 kg" · 1500 → "1,5 kg" */
export function formatGrams(grams: number): string {
  if (grams < 1000) return `${grams} g`;
  const kilos = grams / 1000;
  return `${kilos.toLocaleString("es-AR", { maximumFractionDigits: 2 })} kg`;
}

/** Etiqueta de cantidad lista para mostrar o para el mensaje de WhatsApp. */
export function formatAmount(item: Priceable): string {
  return isByWeight(item) ? formatGrams(item.cantidad) : `${item.cantidad}x`;
}
