"use client";

import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { DeliveryStrip } from "@/components/delivery-strip";
import { cartQuantity, useCartStore } from "@/store/cart-store";

export function StoreHeader() {
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state.hydrated);
  const quantity = hydrated ? cartQuantity(items) : 0;

  return (
    <header className="store-header">
      <div className="store-header__top">
        {/* El logo real del local. Va como imagen y no redibujado: es un cartel
            de neón con su halo, y eso no se reproduce con tipografía y sombras.
            El archivo trae el alfa calculado desde el brillo, así que el negro
            del original no aparece y el resplandor se apoya sobre el header. */}
        <Link className="brand" href="/" transitionTypes={["nav-back"]}>
          <Image src="/brand/logo-neon.webp" alt="La Bomba 24" width={760} height={179} priority />
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

      <DeliveryStrip />
    </header>
  );
}
