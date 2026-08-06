"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";

import { useCatalog } from "@/providers/catalog-provider";
import { cartQuantity, useCartStore } from "@/store/cart-store";

/** Horario fijo del local. No viene del Sheet: es dato de marca, no de stock. */
const HORARIO = "Delivery de 20 a 3 hs";

export function StoreHeader() {
  const { data, loading } = useCatalog();
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state.hydrated);
  const quantity = hydrated ? cartQuantity(items) : 0;
  const active = data.config.deliveryActivo;

  return (
    <header className="store-header">
      <div className="store-header__top">
        <Link
          className="brand"
          href="/"
          aria-label="Ir al inicio de La Bomba 24"
          transitionTypes={["nav-back"]}
        >
          <span className="brand__bomb" aria-hidden="true">
            <strong>24</strong>
            <svg className="brand__fuse" viewBox="0 0 18 18">
              <path
                d="M2.5 15C4.5 8.5 8.5 5 13.5 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <circle cx="14.4" cy="3.6" r="3.2" fill="currentColor" />
            </svg>
          </span>
          <span className="brand__word">La Bomba</span>
        </Link>

        <Link
          className="header-cart"
          href="/pedido"
          aria-label={`Ver pedido, ${quantity} ${quantity === 1 ? "producto" : "productos"}`}
          transitionTypes={["nav-forward"]}
        >
          <ShoppingCart aria-hidden="true" size={26} strokeWidth={2.1} />
          {quantity > 0 && <span key={quantity}>{quantity}</span>}
        </Link>
      </div>

      <div className={`delivery-strip ${active ? "delivery-strip--active" : ""}`}>
        <span className="delivery-dot" aria-hidden="true" />
        <span>{HORARIO}</span>
        {!loading && <b>{active ? "Abierto ahora" : "Cerrado"}</b>}
      </div>
    </header>
  );
}
