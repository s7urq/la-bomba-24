"use client";

import { ArrowUpRight, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { useCatalog } from "@/providers/catalog-provider";
import { cartQuantity, useCartStore } from "@/store/cart-store";

export function StoreHeader() {
  const { data, loading } = useCatalog();
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state.hydrated);
  const quantity = hydrated ? cartQuantity(items) : 0;
  const active = data.config.deliveryActivo;

  return (
    <header className="store-header">
      <div className="store-header__top">
        <Link className="brand" href="/" aria-label="Ir al inicio de La Bomba 24">
          <span>LA BOMBA</span>
          <strong>24</strong>
        </Link>

        <Link className="header-cart" href="/pedido" aria-label={`Ver pedido, ${quantity} productos`}>
          <ShoppingBag aria-hidden="true" size={20} strokeWidth={2.2} />
          {quantity > 0 && <span>{quantity}</span>}
        </Link>
      </div>

      <div className={`delivery-strip ${active ? "delivery-strip--active" : ""}`}>
        <span className="delivery-dot" aria-hidden="true" />
        <span>
          {loading
            ? "Consultando el estado del delivery"
            : active
              ? "Repartiendo ahora"
              : data.config.horarioTexto}
        </span>
        {!loading && active && <ArrowUpRight size={15} aria-hidden="true" />}
      </div>
    </header>
  );
}
