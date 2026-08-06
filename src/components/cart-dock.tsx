"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { formatPesos } from "@/lib/format";
import { cartQuantity, cartSubtotal, useCartStore } from "@/store/cart-store";

export function CartDock() {
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state.hydrated);
  const subtotal = hydrated ? cartSubtotal(items) : 0;
  const quantity = hydrated ? cartQuantity(items) : 0;

  return (
    <div className="cart-dock" aria-live="polite">
      <div>
        <span>{quantity > 0 ? `${quantity} ${quantity === 1 ? "producto" : "productos"}` : "Tu pedido"}</span>
        {/* La key reinicia la animación del total cada vez que cambia el monto. */}
        <strong key={subtotal}>{formatPesos(subtotal)}</strong>
      </div>
      <Link href="/pedido" aria-label="Ver pedido">
        Ver pedido
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </div>
  );
}
