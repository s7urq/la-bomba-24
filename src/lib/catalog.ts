import { isCategorySlug } from "@/config/categories";
import { csvToRecords } from "@/lib/csv";
import type { DeliveryZone, Product, StoreConfig } from "@/types/domain";

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
      imagen: (row.imagen ?? "").trim(),
      seccion: (row.seccion ?? "").trim(),
      // Sin columna `unidad` en la planilla todo sigue siendo por unidad, así
      // que los Sheets que ya existen no cambian de comportamiento.
      unidad: unidadRaw === "kg" || unidadRaw === "peso" ? "kg" : "unidad",
    });
  }

  return products.sort((a, b) => {
    if (a.categoria !== b.categoria) return a.categoria.localeCompare(b.categoria, "es");
    if (a.destacado !== b.destacado) return a.destacado ? -1 : 1;
    return a.nombre.localeCompare(b.nombre, "es");
  });
}

export function parseZonesCsv(input: string): DeliveryZone[] {
  const zones: DeliveryZone[] = [];

  for (const row of csvToRecords(input)) {
    const nombre = (row.nombre ?? "").trim();
    const costo = parseWholeNumber(row.costo ?? "");
    const pedidoMinimo = parseWholeNumber(row.pedido_minimo ?? "");
    const minutosRaw = (row.minutos ?? "").trim();
    const minutos = minutosRaw ? parseWholeNumber(minutosRaw) : null;

    if (!nombre || costo === null || pedidoMinimo === null) continue;
    zones.push({ nombre, costo, pedidoMinimo, minutos });
  }

  return zones;
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
