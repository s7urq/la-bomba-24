import { normalizeSearch } from "@/lib/catalog";
import type { Product } from "@/types/domain";

export interface ProductSection {
  /** Vacío cuando no hay que dibujar encabezado (una sola sección). */
  titulo: string;
  items: Product[];
}

const OTHERS = "Otros";
const MIN_GROUP = 2;

function firstToken(nombre: string): string {
  return normalizeSearch(nombre).split(/[\s/·,-]+/).filter(Boolean)[0] ?? "";
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Agrupa respetando la columna `seccion` de la planilla. */
function bySheetColumn(products: Product[]): ProductSection[] {
  const groups = new Map<string, Product[]>();

  for (const product of products) {
    const key = product.seccion.trim() || OTHERS;
    const bucket = groups.get(key);
    if (bucket) bucket.push(product);
    else groups.set(key, [product]);
  }

  // "Otros" siempre al final, aunque haya aparecido primero en la planilla.
  const entries = [...groups.entries()];
  const others = entries.filter(([titulo]) => titulo === OTHERS);
  const named = entries.filter(([titulo]) => titulo !== OTHERS);

  return [...named, ...others].map(([titulo, items]) => ({ titulo, items }));
}

/**
 * Sin columna `seccion`, agrupa por la primera palabra del nombre y solo
 * conserva los grupos con al menos dos productos. Los sueltos caen juntos al
 * final: una sección de un solo ítem es ruido, no jerarquía.
 */
function byNameHeuristic(products: Product[]): ProductSection[] {
  const groups = new Map<string, Product[]>();

  for (const product of products) {
    const key = firstToken(product.nombre);
    if (!key) continue;
    const bucket = groups.get(key);
    if (bucket) bucket.push(product);
    else groups.set(key, [product]);
  }

  const named: ProductSection[] = [];
  const leftovers: Product[] = [];

  for (const [key, items] of groups) {
    if (items.length >= MIN_GROUP) named.push({ titulo: titleCase(key), items });
    else leftovers.push(...items);
  }

  if (named.length === 0) return [];

  named.sort((a, b) => b.items.length - a.items.length || a.titulo.localeCompare(b.titulo, "es"));
  if (leftovers.length > 0) named.push({ titulo: OTHERS, items: leftovers });

  return named;
}

export function groupIntoSections(products: Product[]): ProductSection[] {
  if (products.length === 0) return [];

  const sections = products.some((product) => product.seccion.trim())
    ? bySheetColumn(products)
    : byNameHeuristic(products);

  // Una sola sección no necesita encabezado: sería un título para todo.
  if (sections.length <= 1) return [{ titulo: "", items: products }];
  return sections;
}
