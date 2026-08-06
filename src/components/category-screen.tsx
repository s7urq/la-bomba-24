"use client";

import { ArrowLeft, Search, X } from "lucide-react";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { CartDock } from "@/components/cart-dock";
import { CatalogNotice } from "@/components/catalog-notice";
import { ProductCard } from "@/components/product-card";
import { CATEGORIES, type CategorySlug } from "@/config/categories";
import { normalizeSearch } from "@/lib/catalog";
import { groupIntoSections } from "@/lib/sections";
import { useCatalog } from "@/providers/catalog-provider";
import { useCartStore } from "@/store/cart-store";
import type { Product } from "@/types/domain";

function useDebouncedValue(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debounced;
}

function matchesSearch(product: Product, query: string): boolean {
  const haystack = normalizeSearch(
    [product.marca, product.nombre, product.descripcion, CATEGORIES[product.categoria].label].join(" "),
  );
  return haystack.includes(query);
}

export function CategoryScreen({ slug }: { slug: CategorySlug }) {
  const { data, loading } = useCatalog();
  const items = useCartStore((state) => state.items);
  const addProduct = useCartStore((state) => state.addProduct);
  const [query, setQuery] = useState("");
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const feedbackTimer = useRef<number | null>(null);
  const debouncedQuery = normalizeSearch(useDebouncedValue(query, 260));
  const category = CATEGORIES[slug];

  useEffect(
    () => () => {
      if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    },
    [],
  );

  const products = useMemo(() => {
    if (debouncedQuery) {
      return data.products.filter((product) => matchesSearch(product, debouncedQuery));
    }
    return data.products.filter((product) => product.categoria === slug);
  }, [data.products, debouncedQuery, slug]);

  const quantities = useMemo(
    () => new Map(items.map((item) => [item.id, item.cantidad])),
    [items],
  );

  // Los resultados de búsqueda cruzan categorías: seccionarlos ahí mezclaría
  // criterios distintos bajo un mismo título.
  const sections = useMemo(
    () => (debouncedQuery ? [{ titulo: "", items: products }] : groupIntoSections(products)),
    [debouncedQuery, products],
  );

  function handleAdd(product: Product) {
    addProduct(product);
    setJustAdded(product.id);
    navigator.vibrate?.(10);
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setJustAdded(null), 700);
  }

  const currentLayout = debouncedQuery ? "search" : category.layout;

  return (
    <>
      <main
        className="page-shell category-page"
        style={{ "--category-accent": category.accent } as React.CSSProperties}
      >
        <div className="page-back-row">
          <Link href="/" transitionTypes={["nav-back"]}>
            <ArrowLeft size={18} aria-hidden="true" />
            Inicio
          </Link>
          <span>{category.layout === "list" ? "Lista rápida" : "Elegí y tocá para sumar"}</span>
        </div>

        <header className="category-heading">
          <p className="eyebrow">Categoría</p>
          <h1>{category.label}</h1>
          <p>{category.description}</p>
        </header>

        <div className="search-sticky">
          <label className="catalog-search">
            <Search size={19} aria-hidden="true" />
            <span className="sr-only">Buscar en todo el catálogo</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscá en todo el catálogo"
              autoComplete="off"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Limpiar búsqueda">
                <X size={17} aria-hidden="true" />
              </button>
            )}
          </label>
          {debouncedQuery && <p>Resultados en todas las categorías</p>}
        </div>

        <CatalogNotice productsOnly />

        {loading ? (
          <div className="product-grid product-grid--loading" aria-label="Cargando productos">
            {Array.from({ length: 6 }, (_, index) => <span key={index} />)}
          </div>
        ) : products.length > 0 ? (
          sections.map((section) => (
            <Fragment key={section.titulo || "todo"}>
              {section.titulo && (
                <h2 className="section-divider">
                  <span>{section.titulo}</span>
                  <small>{section.items.length}</small>
                </h2>
              )}
              <section
                className={`product-grid product-grid--${currentLayout}`}
                aria-label={
                  debouncedQuery
                    ? "Resultados de búsqueda"
                    : section.titulo || `Productos de ${category.label}`
                }
              >
                {section.items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    category={CATEGORIES[product.categoria]}
                    layout={currentLayout}
                    quantity={quantities.get(product.id) ?? 0}
                    justAdded={justAdded === product.id}
                    onAdd={handleAdd}
                  />
                ))}
              </section>
            </Fragment>
          ))
        ) : (
          <div className="empty-catalog">
            <span>{debouncedQuery ? "0 resultados" : "Lista en preparación"}</span>
            <h2>{debouncedQuery ? "Acá no apareció nada" : "Todavía no hay precios acá"}</h2>
            <p>
              {debouncedQuery
                ? "Probá con la marca o con una palabra más corta. Si no, escribilo vos y lo buscamos."
                : "No inventamos precios. Igual escribinos qué necesitás y te lo conseguimos."}
            </p>
            <Link href="/pedido#pedido-libre" transitionTypes={["nav-forward"]}>
              Escribilo en el pedido libre
            </Link>
          </div>
        )}
      </main>
      <CartDock />
    </>
  );
}
