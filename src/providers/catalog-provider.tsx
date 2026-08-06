"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { EMPTY_STORE_CONFIG } from "@/lib/catalog";
import { loadCatalog } from "@/lib/sheets";
import { useCartStore } from "@/store/cart-store";
import type { CatalogData, CatalogHealth } from "@/types/domain";

const EMPTY_DATA: CatalogData = {
  products: [],
  zones: [],
  config: EMPTY_STORE_CONFIG,
};

const EMPTY_HEALTH: CatalogHealth = {
  products: { source: "missing" },
  zones: { source: "missing" },
  config: { source: "missing" },
};

interface CatalogContextValue {
  data: CatalogData;
  health: CatalogHealth;
  loading: boolean;
  refresh: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState(EMPTY_DATA);
  const [health, setHealth] = useState(EMPTY_HEALTH);
  const [loading, setLoading] = useState(true);
  const reconcileProducts = useCartStore((state) => state.reconcileProducts);
  const markHydrated = useCartStore((state) => state.markHydrated);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await loadCatalog();
      setData(result.data);
      setHealth(result.health);
      if (result.health.products.source !== "missing") {
        reconcileProducts(result.data.products);
      }
    } finally {
      setLoading(false);
    }
  }, [reconcileProducts]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function initialize() {
      setLoading(true);
      try {
        await Promise.resolve(useCartStore.persist.rehydrate());
        if (!active) return;
        markHydrated();

        const result = await loadCatalog(controller.signal);
        if (!active) return;
        setData(result.data);
        setHealth(result.health);
        if (result.health.products.source !== "missing") {
          reconcileProducts(result.data.products);
        }
      } catch {
        // Un abort ocurre al cambiar/desmontar la vista; los demás errores se resuelven por pestaña.
      } finally {
        if (active) setLoading(false);
      }
    }

    void initialize();

    return () => {
      active = false;
      controller.abort();
    };
  }, [markHydrated, reconcileProducts]);

  const value = useMemo(
    () => ({ data, health, loading, refresh }),
    [data, health, loading, refresh],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog debe usarse dentro de CatalogProvider");
  return context;
}
