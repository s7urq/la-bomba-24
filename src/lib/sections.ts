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

interface Candidate {
  sections: ProductSection[];
  named: number;
  leftovers: number;
}

/**
 * Agrupa por un criterio y conserva sólo los grupos con al menos dos
 * productos. Los sueltos caen juntos al final: una sección de un solo ítem es
 * ruido, no jerarquía.
 */
function groupBy(
  products: Product[],
  clave: (product: Product) => string,
  etiqueta: (product: Product, clave: string) => string,
): Candidate {
  const groups = new Map<string, { items: Product[]; titulo: string }>();

  for (const product of products) {
    const key = clave(product);
    if (!key) continue;
    const bucket = groups.get(key);
    if (bucket) bucket.items.push(product);
    // El título sale del primero que llega, con su ortografía original: la
    // clave va normalizada para agrupar, pero mostrar "Tia Maria" sin tilde
    // porque así se comparó sería arrastrar un detalle interno a la pantalla.
    else groups.set(key, { items: [product], titulo: etiqueta(product, key) });
  }

  const named: ProductSection[] = [];
  const leftovers: Product[] = [];

  for (const { items, titulo } of groups.values()) {
    if (items.length >= MIN_GROUP) named.push({ titulo, items });
    else leftovers.push(...items);
  }

  named.sort((a, b) => b.items.length - a.items.length || a.titulo.localeCompare(b.titulo, "es"));

  const sections = [...named];
  if (leftovers.length > 0) sections.push({ titulo: OTHERS, items: leftovers });

  return { sections: named.length > 0 ? sections : [], named: named.length, leftovers: leftovers.length };
}

/**
 * Sin columna `seccion` hay que adivinar, y qué campo sirve depende del rubro.
 *
 * En tragos la marca es "La Bomba 24" en las veinticinco filas, así que
 * agrupar por marca daría un único cajón: ahí lo que subdivide es el nombre
 * (Caipi, Gin). En vinoteca y cerveza pasa lo contrario — el nombre es la
 * variante ("750ml", "Lata", "Extra Brut") y agrupar por ahí produce títulos
 * que no significan nada, mientras que la marca arma la góndola sola.
 *
 * En vez de elegir uno de los dos a mano se prueban los dos y gana el que
 * arme más secciones reales; a igualdad, el que deje menos sueltos, y recién
 * ahí la marca, que como título dice más que una palabra suelta del nombre.
 */
function byHeuristic(products: Product[]): ProductSection[] {
  const porNombre = groupBy(
    products,
    (product) => firstToken(product.nombre),
    (_product, clave) => titleCase(clave),
  );
  const porMarca = groupBy(
    products,
    (product) => normalizeSearch(product.marca).trim(),
    (product) => product.marca.trim(),
  );

  if (porMarca.named === 0) return porNombre.sections;
  if (porNombre.named === 0) return porMarca.sections;

  if (porMarca.named !== porNombre.named) {
    return porMarca.named > porNombre.named ? porMarca.sections : porNombre.sections;
  }

  if (porMarca.leftovers !== porNombre.leftovers) {
    return porMarca.leftovers < porNombre.leftovers ? porMarca.sections : porNombre.sections;
  }

  return porMarca.sections;
}

export function groupIntoSections(products: Product[]): ProductSection[] {
  if (products.length === 0) return [];

  const sections = products.some((product) => product.seccion.trim())
    ? bySheetColumn(products)
    : byHeuristic(products);

  // Una sola sección no necesita encabezado: sería un título para todo.
  if (sections.length <= 1) return [{ titulo: "", items: products }];
  return sections;
}
