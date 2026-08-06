"use client";

import { Minus, Plus, Trash2 } from "lucide-react";

interface QuantityControlProps {
  name: string;
  quantity: number;
  onChange: (quantity: number) => void;
  onRemove: () => void;
}

export function QuantityControl({ name, quantity, onChange, onRemove }: QuantityControlProps) {
  return (
    <div className="quantity-control" aria-label={`Cantidad de ${name}`}>
      {quantity === 1 ? (
        <button type="button" onClick={onRemove} aria-label={`Sacar ${name} del pedido`}>
          <Trash2 size={16} aria-hidden="true" />
        </button>
      ) : (
        <button type="button" onClick={() => onChange(quantity - 1)} aria-label={`Restar ${name}`}>
          <Minus size={16} aria-hidden="true" />
        </button>
      )}
      <span>{quantity}</span>
      <button type="button" onClick={() => onChange(quantity + 1)} aria-label={`Sumar ${name}`}>
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
