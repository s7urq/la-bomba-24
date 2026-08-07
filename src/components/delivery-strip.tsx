"use client";

import { ExternalLink, MapPin, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { MapaZonas } from "@/components/mapa-zonas";
import { LOCAL, mapaCompleto } from "@/config/local";
import { formatPesos } from "@/lib/format";
import { useCatalog } from "@/providers/catalog-provider";

/** Horario fijo del local. No viene del Sheet: es dato de marca, no de stock. */
const HORARIO = "Delivery de 20 a 3 hs";

/**
 * La franja de horario, que además abre el mapa de reparto.
 *
 * Sigue viéndose igual que antes: era el único lugar de la interfaz que ya
 * hablaba de delivery, así que colgarle ahí el "¿llegamos a tu casa?" no
 * agrega un elemento nuevo a la pantalla — le da una función a uno que sólo
 * informaba.
 */
export function DeliveryStrip() {
  const { data, loading } = useCatalog();
  const dialogo = useRef<HTMLDialogElement>(null);
  const [abierto, setAbierto] = useState(false);
  const activo = data.config.deliveryActivo;
  const zonas = data.zones;

  const abrir = useCallback(() => {
    setAbierto(true);
    dialogo.current?.showModal();
  }, []);

  // El <dialog> nativo ya cierra con Escape y atrapa el foco adentro; lo único
  // que falta es que el clic en el fondo negro también cierre.
  useEffect(() => {
    const el = dialogo.current;
    if (!el) return;

    function alClickear(evento: MouseEvent) {
      if (evento.target === el) el?.close();
    }

    el.addEventListener("click", alClickear);
    return () => el.removeEventListener("click", alClickear);
  }, []);

  return (
    <>
      <button
        type="button"
        className={`delivery-strip ${activo ? "delivery-strip--active" : ""}`}
        onClick={abrir}
      >
        <span className="delivery-dot" aria-hidden="true" />
        <span>{HORARIO}</span>
        {!loading && <b>{activo ? "Abierto ahora" : "Cerrado"}</b>}
        <MapPin size={14} aria-hidden="true" />
        <span className="sr-only">Ver el mapa de reparto</span>
      </button>

      <dialog className="mapa-modal" ref={dialogo} onClose={() => setAbierto(false)}>
        <div className="mapa-modal__caja">
          <header>
            <div>
              <p className="eyebrow">Dónde estamos</p>
              <h2>{LOCAL.esquina}</h2>
              <p>
                {LOCAL.ciudad}, {LOCAL.provincia}
              </p>
            </div>
            <button type="button" onClick={() => dialogo.current?.close()} aria-label="Cerrar el mapa">
              <X size={20} aria-hidden="true" />
            </button>
          </header>

          {/* El mapa se monta recién al abrir: si estuviera siempre, cada visita
              bajaría Leaflet y pegaría contra un servidor de tiles que nadie
              pidió, y en un celu de datos eso se paga. */}
          <div className="mapa-modal__mapa">{abierto && <MapaZonas zonas={zonas} />}</div>

          <footer>
            {zonas.length > 0 && (
              <ul className="mapa-zonas">
                {zonas.map((zona) => (
                  <li key={zona.nombre}>
                    <strong>{zona.nombre}</strong>
                    <span>
                      Envío {formatPesos(zona.costo)}
                      {zona.pedidoMinimo > 0 && ` · mínimo ${formatPesos(zona.pedidoMinimo)}`}
                      {zona.minutos !== null && ` · ${zona.minutos} min`}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <p>
              Los círculos salen del local. Si tu casa cae adentro de alguno, llegamos; si estás
              justo en el borde, escribinos y te decimos.
            </p>
            <a href={mapaCompleto()} target="_blank" rel="noreferrer">
              <MapPin size={16} aria-hidden="true" />
              Abrir en el mapa
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </footer>
        </div>
      </dialog>
    </>
  );
}
