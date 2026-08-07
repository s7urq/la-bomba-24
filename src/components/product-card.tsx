"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";

import type { CategoryDefinition, CategoryLayout } from "@/config/categories";
import { formatPesos } from "@/lib/format";
import { DEFAULT_GRAMS, MIN_GRAMS, formatGrams } from "@/lib/pricing";
import type { Presentacion, Product } from "@/types/domain";

interface ProductCardProps {
  product: Product;
  category: CategoryDefinition;
  layout: CategoryLayout | "search";
  quantity: number;
  justAdded: boolean;
  onAdd: (product: Product, presentacion?: Presentacion) => void;
  /** Cuánto hay en el pedido de cada presentación, por gramos. */
  porPresentacion?: Map<number, number>;
}

function ProductVisual({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);

  if (!product.imagen || failed) {
    return (
      <div className="product-placeholder" aria-hidden="true">
        <span>{product.nombre.slice(0, 1)}</span>
      </div>
    );
  }

  return (
    // Las URLs vienen de una planilla editable y no tienen un dominio conocido en build time.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={product.imagen}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

export function ProductCard({
  product,
  category,
  layout,
  quantity,
  justAdded,
  onAdd,
  porPresentacion,
}: ProductCardProps) {
  const isList = layout === "list" || layout === "search";
  const byWeight = product.unidad === "kg";
  const amountLabel = byWeight ? formatGrams(quantity) : String(quantity);
  const accent = { "--card-accent": category.accent, "--card-accent-soft": category.accentSoft };

  // Con presentaciones la card deja de ser un botón y pasa a contener uno por
  // opción: un botón adentro de otro no es HTML válido, y además acá tocar
  // "la card" ya no significa nada — hay que elegir cuánto.
  if (product.presentaciones.length > 0) {
    return (
      <div
        className={`product-card product-card--${layout} product-card--porciones ${justAdded ? "product-card--added" : ""}`}
        style={accent as React.CSSProperties}
      >
        <div className="product-card__body">
          <div className="product-card__copy">
            {product.marca && <span>{product.marca}</span>}
            <strong>{product.nombre}</strong>
            {product.descripcion && <p>{product.descripcion}</p>}
          </div>

          <div className="porciones">
            {product.presentaciones.map((presentacion) => {
              const enPedido = porPresentacion?.get(presentacion.gramos) ?? 0;
              return (
                <button
                  key={presentacion.gramos}
                  type="button"
                  className={`porcion ${presentacion.oferta ? "porcion--oferta" : ""}`}
                  onClick={() => onAdd(product, presentacion)}
                  disabled={!product.disponible}
                  aria-label={`Agregar ${formatGrams(presentacion.gramos)} de ${product.nombre} por ${formatPesos(presentacion.precio)}`}
                >
                  <span>
                    {presentacion.oferta && <em>Oferta</em>}
                    {formatGrams(presentacion.gramos)}
                  </span>
                  <b>{formatPesos(presentacion.precio)}</b>
                  {enPedido > 0 && <i key={enPedido}>{enPedido}</i>}
                </button>
              );
            })}
          </div>
        </div>

        {/* "Se cortan al momento" ya lo dice la bajada de la categoría: acá
            repetirlo por producto sólo le sacaba lugar a los precios. */}
        {!product.disponible && <span className="unavailable-label">No disponible</span>}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`product-card product-card--${layout} ${byWeight ? "product-card--weighed" : ""} ${justAdded ? "product-card--added" : ""}`}
      style={accent as React.CSSProperties}
      onClick={() => onAdd(product)}
      disabled={!product.disponible}
      aria-label={
        !product.disponible
          ? `${product.nombre}, no disponible`
          : byWeight
            ? `Agregar ${formatGrams(DEFAULT_GRAMS)} de ${product.nombre}, ${formatPesos(product.precio)} el kilo`
            : `Agregar ${product.nombre} por ${formatPesos(product.precio)}`
      }
    >
      {!isList && (
        <div className="product-card__visual">
          <ProductVisual product={product} />
          {quantity > 0 && <span key={quantity} className="product-count">{amountLabel}</span>}
        </div>
      )}

      <div className="product-card__body">
        <div className="product-card__copy">
          {product.marca && <span>{product.marca}</span>}
          <strong>{product.nombre}</strong>
          {product.descripcion && layout !== "packshot" && <p>{product.descripcion}</p>}
        </div>
        <div className="product-card__bottom">
          <b>
            {formatPesos(product.precio)}
            {byWeight && <i>/kg</i>}
          </b>
          <span
            className="product-add"
            style={{ backgroundColor: product.disponible ? category.accent : undefined }}
          >
            {justAdded ? <Check size={15} /> : <Plus size={16} />}
          </span>
        </div>
      </div>

      {isList && quantity > 0 && (
        <span key={quantity} className="product-count product-count--list">{amountLabel}</span>
      )}
      {byWeight && product.disponible && (
        <span className="weighed-label">Cortado al momento · desde {formatGrams(MIN_GRAMS)}</span>
      )}
      {!product.disponible && <span className="unavailable-label">No disponible</span>}
    </button>
  );
}
