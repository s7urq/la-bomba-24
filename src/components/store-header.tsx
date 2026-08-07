"use client";

import { Motorbike } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cartQuantity, useCartStore } from "@/store/cart-store";

export function StoreHeader() {
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state.hydrated);
  const quantity = hydrated ? cartQuantity(items) : 0;

  return (
    // Tres columnas con los costados iguales: es lo único que centra la marca
    // de verdad. Con flex y space-between quedaría centrada "a ojo" y se
    // correría cada vez que aparece el número del carrito.
    <header className="store-header">
      <span aria-hidden="true" />

      {/* El logo real del local. Va como imagen y no redibujado: es un cartel
          de neón con su halo, y eso no se reproduce con tipografía y sombras. */}
      <Link className="brand" href="/" transitionTypes={["nav-back"]}>
        <Image src="/brand/logo-neon.webp" alt="La Bomba 24" width={760} height={179} priority />
      </Link>

      <Link
        className="header-cart"
        href="/pedido"
        aria-label={`Ver pedido, ${quantity} ${quantity === 1 ? "producto" : "productos"}`}
        transitionTypes={["nav-forward"]}
      >
        {/* Acá tampoco hay carrito: el pedido se mide en viajes de moto. */}
        <Motorbike aria-hidden="true" size={26} strokeWidth={2} />
        {quantity > 0 && <span key={quantity}>{quantity}</span>}
      </Link>
    </header>
  );
}
