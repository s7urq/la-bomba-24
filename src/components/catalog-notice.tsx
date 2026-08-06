"use client";

import { RefreshCw } from "lucide-react";

import { hasCachedSource, hasMissingSource } from "@/lib/sheets";
import { useCatalog } from "@/providers/catalog-provider";

export function CatalogNotice({ productsOnly = false }: { productsOnly?: boolean }) {
  const { health, loading, refresh } = useCatalog();
  const relevant = productsOnly
    ? { products: health.products }
    : health;
  const cached = Object.values(relevant).some((item) => item.source === "cache");
  const missing = Object.values(relevant).some((item) => item.source === "missing");

  if (loading || (!cached && !missing)) return null;

  return (
    <aside className={`catalog-notice ${missing ? "catalog-notice--warning" : ""}`}>
      <div>
        <strong>{missing ? "Hay datos sin publicar" : "Estás viendo la última lista que tenemos"}</strong>
        <p>
          {missing
            ? "Revisá las URLs del Sheet o probá de nuevo en un rato. No mostramos precios inventados."
            : "No pudimos actualizar los precios. Se acomodan solos apenas vuelva la conexión."}
        </p>
      </div>
      <button type="button" onClick={() => void refresh()} disabled={loading}>
        <RefreshCw size={16} aria-hidden="true" />
        Reintentar
      </button>
    </aside>
  );
}

// Estas exportaciones quedan acá para que el estado se pueda probar sin duplicar reglas.
export const catalogHasCache = hasCachedSource;
export const catalogHasMissing = hasMissingSource;
