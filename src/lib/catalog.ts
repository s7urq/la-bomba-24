import { isCategorySlug } from "@/config/categories";
import { FOTOS_DE_PRODUCTO } from "@/config/product-photos";
import { csvToRecords } from "@/lib/csv";
import type { DeliveryZone, Presentacion, Product, StoreConfig } from "@/types/domain";

export const EMPTY_STORE_CONFIG: StoreConfig = {
  deliveryActivo: false,
  mensajeCerrado: "",
  whatsapp: "",
  horarioTexto: "Consultá el horario del delivery",
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function stableId(parts: string[]): string {
  return parts
    .map(normalize)
    .join(":")
    .replace(/[^a-z0-9:]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Cuánto pesa la presentación de lista. `precio` es siempre por esta cantidad. */
export const GRAMOS_BASE = 100;

/** "250g", "250 g", "250" → 250. Cualquier otra cosa → null. */
function parseGramos(value: string): number | null {
  const match = /^(\d+)\s*g?$/i.exec(value.trim());
  if (!match) return null;
  const gramos = Number(match[1]);
  return Number.isSafeInteger(gramos) && gramos > 0 ? gramos : null;
}

/**
 * Arma las presentaciones a partir de las columnas de promo. Que la fila
 * traiga `cant-promo` en gramos es lo que la marca como vendida por peso.
 *
 * La oferta se descarta si sale más barata que la cantidad chica o si no es
 * más cantidad: eso no es una promo, es un error de carga, y mostrarlo daría
 * un botón de 250 g más barato que el de 100 g.
 */
function buildPresentaciones(
  precio: number,
  cantPromo: string,
  precioPromo: string,
): Presentacion[] {
  const gramos = parseGramos(cantPromo);
  if (gramos === null) return [];

  const base: Presentacion = { gramos: GRAMOS_BASE, precio, oferta: false };
  const promo = parseWholeNumber(precioPromo);

  if (promo === null || gramos <= GRAMOS_BASE || promo <= precio) return [base];

  return [base, { gramos, precio: promo, oferta: true }];
}

function parseWholeNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const number = Number(trimmed);
  return Number.isSafeInteger(number) ? number : null;
}

export function parseProductsCsv(input: string): Product[] {
  const products: Product[] = [];
  const seen = new Set<string>();

  for (const row of csvToRecords(input)) {
    const categoria = normalize(row.categoria ?? "");
    const nombre = (row.nombre ?? "").trim();
    const marca = (row.marca ?? "").trim();
    const precio = parseWholeNumber(row.precio ?? "");

    if (!isCategorySlug(categoria) || !nombre || precio === null) continue;

    const id = stableId([categoria, marca, nombre]);
    if (seen.has(id)) continue;
    seen.add(id);

    const unidadRaw = normalize(row.unidad ?? "");

    products.push({
      id,
      categoria,
      marca,
      nombre,
      descripcion: (row.descripcion ?? "").trim(),
      precio,
      destacado: normalize(row.destacado ?? "") === "si",
      disponible: normalize(row.disponible ?? "") !== "no",
      // La planilla gana; si no trae nada, se busca una foto commiteada.
      imagen: (row.imagen ?? "").trim() || (FOTOS_DE_PRODUCTO[id] ?? ""),
      seccion: (row.seccion ?? "").trim(),
      // Sin columna `unidad` en la planilla todo sigue siendo por unidad, así
      // que los Sheets que ya existen no cambian de comportamiento.
      unidad: unidadRaw === "kg" || unidadRaw === "peso" ? "kg" : "unidad",
      presentaciones: buildPresentaciones(
        precio,
        row["cant-promo"] ?? "",
        row["precio-promo"] ?? "",
      ),
    });
  }

  return products.sort((a, b) => {
    if (a.categoria !== b.categoria) return a.categoria.localeCompare(b.categoria, "es");
    if (a.destacado !== b.destacado) return a.destacado ? -1 : 1;
    return a.nombre.localeCompare(b.nombre, "es");
  });
}

/**
 * Las zonas son anillos alrededor del local, no barrios: la planilla trae
 * `zona` (el número) y `km` (hasta dónde llega ese anillo). El nombre se arma
 * con el radio porque es lo único que le sirve a quien está pidiendo — "Zona
 * 2" no le dice nada, "hasta 5 km" sí.
 *
 * Se sigue aceptando la columna `nombre` de la planilla vieja: si está, manda.
 */
export function parseZonesCsv(input: string): DeliveryZone[] {
  const zones: DeliveryZone[] = [];

  for (const row of csvToRecords(input)) {
    const costo = parseWholeNumber(row.costo ?? "");
    const pedidoMinimo = parseWholeNumber(row.pedido_minimo ?? "");
    const minutosRaw = (row.minutos ?? "").trim();
    const minutos = minutosRaw ? parseWholeNumber(minutosRaw) : null;
    const km = parseWholeNumber((row.km ?? "").trim());

    const nombre = (row.nombre ?? "").trim() || (km !== null ? `Hasta ${km} km` : "");

    if (!nombre || costo === null || pedidoMinimo === null) continue;
    zones.push({ nombre, costo, pedidoMinimo, minutos, km });
  }

  // De más cerca a más lejos: el que pide vive en el primero que lo contiene.
  return zones.sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity));
}

export function parseConfigCsv(input: string): StoreConfig {
  const values = new Map(
    csvToRecords(input).map((row) => [normalize(row.clave ?? ""), (row.valor ?? "").trim()]),
  );

  return {
    deliveryActivo: normalize(values.get("delivery_activo") ?? "") === "si",
    mensajeCerrado: values.get("mensaje_cerrado") ?? "",
    whatsapp: (values.get("whatsapp") ?? "").replace(/\D/g, ""),
    horarioTexto: values.get("horario_texto") || EMPTY_STORE_CONFIG.horarioTexto,
  };
}

export function normalizeSearch(value: string): string {
  return normalize(value);
}
