"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";

import type { CategoryDefinition, CategoryLayout } from "@/config/categories";
import { formatPesos } from "@/lib/format";
import { DEFAULT_GRAMS, MIN_GRAMS, formatGrams } from "@/lib/pricing";
import type { Product } from "@/types/domain";

interface ProductCardProps {
  product: Product;
  category: CategoryDefinition;
  layout: CategoryLayout | "search";
  quantity: number;
  justAdded: boolean;
  onAdd: (product: Product) => void;
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
}: ProductCardProps) {
  const isList = layout === "list" || layout === "search";
  const byWeight = product.unidad === "kg";
  const amountLabel = byWeight ? formatGrams(quantity) : String(quantity);

  return (
    <button
      type="button"
      className={`product-card product-card--${layout} ${byWeight ? "product-card--weighed" : ""} ${justAdded ? "product-card--added" : ""}`}
      style={
        {
          "--card-accent": category.accent,
          "--card-accent-soft": category.accentSoft,
        } as React.CSSProperties
      }
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
