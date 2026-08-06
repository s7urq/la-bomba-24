"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";

import type { CategoryDefinition, CategoryLayout } from "@/config/categories";
import { formatPesos } from "@/lib/format";
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

  return (
    <button
      type="button"
      className={`product-card product-card--${layout} ${justAdded ? "product-card--added" : ""}`}
      style={{ borderColor: product.disponible ? category.accent : undefined }}
      onClick={() => onAdd(product)}
      disabled={!product.disponible}
      aria-label={
        product.disponible
          ? `Agregar ${product.nombre} por ${formatPesos(product.precio)}`
          : `${product.nombre}, no disponible`
      }
    >
      {!isList && (
        <div className="product-card__visual">
          <ProductVisual product={product} />
          {quantity > 0 && <span className="product-count">{quantity}</span>}
        </div>
      )}

      <div className="product-card__body">
        <div className="product-card__copy">
          {product.marca && <span>{product.marca}</span>}
          <strong>{product.nombre}</strong>
          {product.descripcion && layout !== "packshot" && <p>{product.descripcion}</p>}
        </div>
        <div className="product-card__bottom">
          <b>{formatPesos(product.precio)}</b>
          <span
            className="product-add"
            style={{ backgroundColor: product.disponible ? category.accent : undefined }}
          >
            {justAdded ? <Check size={15} /> : <Plus size={16} />}
          </span>
        </div>
      </div>

      {isList && quantity > 0 && <span className="product-count product-count--list">{quantity}</span>}
      {!product.disponible && <span className="unavailable-label">No disponible</span>}
    </button>
  );
}
