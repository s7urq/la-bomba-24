"use client";

import { AlertCircle, ArrowLeft, ExternalLink, MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { CatalogNotice } from "@/components/catalog-notice";
import { formatPesos } from "@/lib/format";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { useCatalog } from "@/providers/catalog-provider";
import { cartSubtotal, useCartStore } from "@/store/cart-store";

export function CheckoutScreen() {
  const { data, loading } = useCatalog();
  const items = useCartStore((state) => state.items);
  const freeText = useCartStore((state) => state.freeText);
  const hydrated = useCartStore((state) => state.hydrated);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [note, setNote] = useState("");

  const zone = useMemo(
    () => data.zones.find((current) => current.nombre === zoneName) ?? null,
    [data.zones, zoneName],
  );
  const subtotal = cartSubtotal(items);
  const total = subtotal + (zone?.costo ?? 0);
  const missingForMinimum = zone ? Math.max(0, zone.pedidoMinimo - subtotal) : 0;
  const hasOrder = items.length > 0 || freeText.trim().length > 0;
  const hasWhatsApp = data.config.whatsapp.length > 0;
  const ready =
    hydrated &&
    hasOrder &&
    name.trim().length > 0 &&
    address.trim().length > 0 &&
    zone !== null &&
    hasWhatsApp;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || !zone) return;

    const { message } = buildWhatsAppMessage({
      items,
      subtotal,
      zone,
      total,
      name,
      address,
      note,
      freeText,
    });

    window.open(buildWhatsAppUrl(data.config.whatsapp, message), "_blank", "noopener,noreferrer");
  }

  return (
    <main className="page-shell checkout-page">
      <div className="page-back-row">
        <Link href="/pedido">
          <ArrowLeft size={18} aria-hidden="true" />
          Volver al pedido
        </Link>
        <span>Paso 2 de 2</span>
      </div>

      <header className="order-heading checkout-heading">
        <p className="eyebrow">Entrega</p>
        <h1>¿DÓNDE TE LO <span>LLEVAMOS?</span></h1>
        <p>Tres datos y listo. El pedido se abre solo en WhatsApp, ya escrito.</p>
      </header>

      <CatalogNotice />

      {!data.config.deliveryActivo && !loading && (
        <aside className="closed-note">
          <AlertCircle size={18} aria-hidden="true" />
          <p>
            <strong>Ahora estamos cerrados</strong>
            <span>{data.config.mensajeCerrado || data.config.horarioTexto}</span>
          </p>
        </aside>
      )}

      <form className="checkout-form" onSubmit={handleSubmit}>
        <label>
          <span>Nombre</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="¿Cómo te llamás?"
            autoComplete="name"
            maxLength={80}
            required
          />
        </label>

        <label>
          <span>Dirección</span>
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Calle, número y localidad"
            autoComplete="street-address"
            maxLength={160}
            required
          />
        </label>

        <label>
          <span>Zona de entrega</span>
          <div className="select-wrap">
            <MapPin size={18} aria-hidden="true" />
            <select
              value={zoneName}
              onChange={(event) => setZoneName(event.target.value)}
              disabled={loading || data.zones.length === 0}
              required
            >
              <option value="">{loading ? "Cargando zonas…" : "Seleccioná tu zona"}</option>
              {data.zones.map((current) => (
                <option key={current.nombre} value={current.nombre}>
                  {current.nombre} · envío {formatPesos(current.costo)}
                </option>
              ))}
            </select>
          </div>
        </label>

        {zone && (
          <div className="zone-detail" aria-live="polite">
            <div>
              <span>Envío</span>
              <strong>{formatPesos(zone.costo)}</strong>
            </div>
            <div>
              <span>Pedido mínimo</span>
              <strong>{formatPesos(zone.pedidoMinimo)}</strong>
            </div>
            {zone.minutos !== null && (
              <div>
                <span>Demora estimada</span>
                <strong>{zone.minutos} min</strong>
              </div>
            )}
          </div>
        )}

        {missingForMinimum > 0 && (
          <p className="minimum-note">
            Te faltan {formatPesos(missingForMinimum)} en productos con precio para el mínimo. Si pediste
            algo aparte, el local te lo confirma en el chat.
          </p>
        )}

        <label>
          <span>Notas <small>opcional</small></span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ej: tocar timbre 2B"
            maxLength={220}
            rows={3}
          />
        </label>

        <section className="checkout-total">
          <div><span>Subtotal</span><b>{formatPesos(subtotal)}</b></div>
          <div><span>Envío</span><b>{zone ? formatPesos(zone.costo) : "—"}</b></div>
          <div><span>Total</span><strong>{zone ? formatPesos(total) : formatPesos(subtotal)}</strong></div>
        </section>

        {!hasOrder && hydrated && (
          <p className="form-blocker">Te quedaste sin nada en el pedido. Volvé para atrás y sumá algo.</p>
        )}
        {!loading && data.zones.length === 0 && (
          <p className="form-blocker">Todavía no hay zonas publicadas en el Sheet. El checkout queda bloqueado.</p>
        )}
        {!loading && !hasWhatsApp && (
          <p className="form-blocker">Falta confirmar el WhatsApp del local en la pestaña config.</p>
        )}

        <button className="whatsapp-button" type="submit" disabled={!ready}>
          <MessageCircle size={21} aria-hidden="true" />
          Pedir por WhatsApp
          <ExternalLink size={16} aria-hidden="true" />
        </button>
        <p className="whatsapp-help">Acá no se paga nada. Lo revisás en WhatsApp y lo mandás vos.</p>
      </form>
    </main>
  );
}
