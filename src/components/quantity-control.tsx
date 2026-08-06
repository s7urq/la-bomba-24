"use client";

import { Minus, Plus, Trash2 } from "lucide-react";

import { GRAM_STEP, MIN_GRAMS, amountStep, formatGrams, isByWeight } from "@/lib/pricing";
import type { ProductUnit } from "@/types/domain";

interface QuantityControlProps {
  name: string;
  quantity: number;
  unidad?: ProductUnit;
  onChange: (quantity: number) => void;
  onRemove: () => void;
}

export function QuantityControl({
  name,
  quantity,
  unidad,
  onChange,
  onRemove,
}: QuantityControlProps) {
  const byWeight = isByWeight({ unidad });
  const step = amountStep({ unidad });
  const atMinimum = quantity <= (byWeight ? MIN_GRAMS : 1);
  const label = byWeight ? formatGrams(quantity) : String(quantity);

  return (
    <div
      className={`quantity-control ${byWeight ? "quantity-control--weighed" : ""}`}
      aria-label={byWeight ? `Cantidad de ${name} en gramos` : `Cantidad de ${name}`}
    >
      {atMinimum ? (
        <button type="button" onClick={onRemove} aria-label={`Sacar ${name} del pedido`}>
          <Trash2 size={16} aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onChange(quantity - step)}
          aria-label={byWeight ? `Quitar ${GRAM_STEP} gramos de ${name}` : `Restar ${name}`}
        >
          <Minus size={16} aria-hidden="true" />
        </button>
      )}
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(quantity + step)}
        aria-label={byWeight ? `Sumar ${GRAM_STEP} gramos de ${name}` : `Sumar ${name}`}
      >
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
