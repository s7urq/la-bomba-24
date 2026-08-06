import {
  EMPTY_STORE_CONFIG,
  parseConfigCsv,
  parseProductsCsv,
  parseZonesCsv,
} from "@/lib/catalog";
import { withWhatsAppFallback } from "@/lib/store-config";
import type {
  CatalogData,
  CatalogHealth,
  SheetHealth,
  SheetSource,
} from "@/types/domain";

const SHEET_URLS = {
  products: process.env.NEXT_PUBLIC_SHEET_PRODUCTOS ?? "",
  zones: process.env.NEXT_PUBLIC_SHEET_ZONAS ?? "",
  config: process.env.NEXT_PUBLIC_SHEET_CONFIG ?? "",
};

const WHATSAPP_FALLBACK = process.env.NEXT_PUBLIC_WHATSAPP ?? "";
const STORE_CONFIG_FALLBACK = withWhatsAppFallback(EMPTY_STORE_CONFIG, WHATSAPP_FALLBACK);

type SheetName = keyof typeof SHEET_URLS;

interface CachedSheet {
  url: string;
  csv: string;
  savedAt: number;
}

interface LoadedSheet<T> {
  value: T;
  health: SheetHealth;
}

const CACHE_PREFIX = "la-bomba-24:sheet:v1:";

function cacheKey(name: SheetName): string {
  return `${CACHE_PREFIX}${name}`;
}

function readCache(name: SheetName, url: string): CachedSheet | null {
  if (typeof window === "undefined" || !url) return null;

  try {
    const raw = window.localStorage.getItem(cacheKey(name));
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedSheet;
    return cached.url === url && typeof cached.csv === "string" ? cached : null;
  } catch {
    return null;
  }
}

function writeCache(name: SheetName, url: string, csv: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      cacheKey(name),
      JSON.stringify({ url, csv, savedAt: Date.now() } satisfies CachedSheet),
    );
  } catch {
    // El catálogo sigue funcionando aunque el navegador no permita localStorage.
  }
}

async function loadSheet<T>(
  name: SheetName,
  parser: (csv: string) => T,
  emptyValue: T,
  signal?: AbortSignal,
): Promise<LoadedSheet<T>> {
  const url = SHEET_URLS[name];
  if (!url) {
    return {
      value: emptyValue,
      health: { source: "missing", message: "Falta configurar la URL publicada." },
    };
  }

  try {
    const response = await fetch(url, { cache: "no-store", signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const csv = await response.text();
    const value = parser(csv);
    writeCache(name, url, csv);
    return { value, health: { source: "fresh" } };
  } catch (error) {
    if (signal?.aborted) throw error;

    const cached = readCache(name, url);
    if (cached) {
      return {
        value: parser(cached.csv),
        health: { source: "cache", message: "No respondió el Sheet; usamos la última copia." },
      };
    }

    return {
      value: emptyValue,
      health: {
        source: "missing",
        message: error instanceof Error ? error.message : "No se pudo cargar la pestaña.",
      },
    };
  }
}

export async function loadCatalog(signal?: AbortSignal): Promise<{
  data: CatalogData;
  health: CatalogHealth;
}> {
  const [products, zones, config] = await Promise.all([
    loadSheet("products", parseProductsCsv, [], signal),
    loadSheet("zones", parseZonesCsv, [], signal),
    loadSheet(
      "config",
      (csv) => withWhatsAppFallback(parseConfigCsv(csv), WHATSAPP_FALLBACK),
      STORE_CONFIG_FALLBACK,
      signal,
    ),
  ]);

  return {
    data: {
      products: products.value,
      zones: zones.value,
      config: config.value,
    },
    health: {
      products: products.health,
      zones: zones.health,
      config: config.health,
    },
  };
}

export function hasCachedSource(sources: CatalogHealth): boolean {
  return Object.values(sources).some((health) => health.source === "cache");
}

export function hasMissingSource(sources: CatalogHealth): boolean {
  return Object.values(sources).some((health) => health.source === "missing");
}

export function sourceLabel(source: SheetSource): string {
  if (source === "fresh") return "actualizada";
  if (source === "cache") return "guardada";
  return "sin datos";
}
