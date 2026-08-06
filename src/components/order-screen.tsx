"use client";

import { ArrowLeft, ArrowRight, PenLine, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { QuantityControl } from "@/components/quantity-control";
import { CATEGORIES } from "@/config/categories";
import { formatPesos } from "@/lib/format";
import { cartSubtotal, useCartStore } from "@/store/cart-store";

export function OrderScreen() {
  const items = useCartStore((state) => state.items);
  const freeText = useCartStore((state) => state.freeText);
  const hydrated = useCartStore((state) => state.hydrated);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const setFreeText = useCartStore((state) => state.setFreeText);
  const subtotal = cartSubtotal(items);
  const canContinue = hydrated && (items.length > 0 || freeText.trim().length > 0);

  useEffect(() => {
    if (window.location.hash !== "#pedido-libre") return;
    window.setTimeout(() => document.querySelector<HTMLTextAreaElement>("#pedido-libre")?.focus(), 120);
  }, []);

  return (
    <main className="page-shell order-page">
      <div className="page-back-row">
        <Link href="/">
          <ArrowLeft size={18} aria-hidden="true" />
          Seguir eligiendo
        </Link>
        <span>Paso 1 de 2</span>
      </div>

      <header className="order-heading">
        <p className="eyebrow">Tu carrito</p>
        <h1>REVISÁ TU <span>PEDIDO.</span></h1>
        <p>Sumá, sacá o escribí eso que no estaba en la lista.</p>
      </header>

      {!hydrated ? (
        <div className="order-loading">Cargando tu pedido…</div>
      ) : items.length > 0 ? (
        <section className="order-items" aria-label="Productos del pedido">
          {items.map((item) => {
            const category = CATEGORIES[item.categoria];
            return (
              <article key={item.id} style={{ "--item-accent": category.accent } as React.CSSProperties}>
                <div className="order-item__marker" />
                <div className="order-item__copy">
                  <span>{item.marca || category.label}</span>
                  <strong>{item.nombre}</strong>
                  <b>{formatPesos(item.precio * item.cantidad)}</b>
                </div>
                <QuantityControl
                  name={item.nombre}
                  quantity={item.cantidad}
                  onChange={(quantity) => setQuantity(item.id, quantity)}
                  onRemove={() => removeItem(item.id)}
                />
              </article>
            );
          })}
        </section>
      ) : (
        <section className="empty-order">
          <ShoppingBag size={27} aria-hidden="true" />
          <h2>Tu carrito está vacío</h2>
          <p>Podés volver al catálogo o pedir algo que no figure abajo.</p>
        </section>
      )}

      <section className="free-order" id="pedido-libre-section">
        <div>
          <PenLine size={19} aria-hidden="true" />
          <span>Pedido libre</span>
        </div>
        <label htmlFor="pedido-libre">¿Falta algo? Escribilo acá</label>
        <textarea
          id="pedido-libre"
          value={freeText}
          onChange={(event) => setFreeText(event.target.value)}
          placeholder="Ej: un paquete de Marlboro box, hielo y dos limones"
          maxLength={300}
          rows={5}
        />
        <span>{freeText.length}/300</span>
      </section>

      <section className="order-subtotal">
        <div>
          <span>Subtotal</span>
          <strong>{formatPesos(subtotal)}</strong>
        </div>
        <p>El envío se suma cuando elijas tu zona.</p>
      </section>

      {canContinue ? (
        <Link className="primary-button" href="/checkout">
          Continuar con la dirección
          <ArrowRight size={19} aria-hidden="true" />
        </Link>
      ) : (
        <button className="primary-button" type="button" disabled>
          Agregá algo para continuar
          <ArrowRight size={19} aria-hidden="true" />
        </button>
      )}
    </main>
  );
}
