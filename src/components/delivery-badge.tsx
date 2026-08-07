"use client";

import { ExternalLink, MapPin, Motorbike, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { MapaZonas } from "@/components/mapa-zonas";
import { LOCAL, mapaCompleto } from "@/config/local";
import { formatPesos } from "@/lib/format";
import { useCatalog } from "@/providers/catalog-provider";

/**
 * El cartelito flotante del horario, y el mapa que abre.
 *
 * Reemplaza la franja de "delivery de 20 a 3" que cruzaba el ancho de la
 * pantalla en todas las páginas: esa barra ocupaba una línea entera para
 * repetir siempre lo mismo, y encima empujaba todo el contenido para abajo.
 */
export function DeliveryBadge() {
  const { data, loading } = useCatalog();
  const dialogo = useRef<HTMLDialogElement>(null);
  const [abierto, setAbierto] = useState(false);
  const activo = data.config.deliveryActivo;
  const zonas = data.zones;

  const abrir = useCallback(() => {
    setAbierto(true);
    dialogo.current?.showModal();
  }, []);

  const cerrar = useCallback(() => {
    dialogo.current?.close();
  }, []);

  // El <dialog> nativo ya cierra con Escape y ya atrapa el foco adentro; lo
  // único que falta es que el clic en el fondo negro también cierre.
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
        className={`delivery-badge ${activo ? "delivery-badge--activo" : ""}`}
        onClick={abrir}
      >
        <span className="delivery-badge__moto" aria-hidden="true">
          <Motorbike size={22} strokeWidth={2.2} />
        </span>
        <span className="delivery-badge__texto">
          <strong>
            20 <i>a</i> 3 AM
          </strong>
          <small>
            <span className="delivery-badge__dot" aria-hidden="true" />
            {loading ? "Ver el mapa" : activo ? "Repartiendo ahora" : "¿Llegamos a tu casa?"}
          </small>
        </span>
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
            <button type="button" onClick={cerrar} aria-label="Cerrar el mapa">
              <X size={20} aria-hidden="true" />
            </button>
          </header>

          {/* El mapa se monta recién al abrir: si estuviera siempre, cada visita
              a la home bajaría Leaflet y pegaría contra un servidor de tiles
              que nadie pidió, y en un celu de datos eso se paga. */}
          <div className="mapa-modal__mapa">{abierto && <MapaZonas zonas={zonas} />}</div>

          <footer>
            <p className="mapa-modal__horario">
              <b>Jueves a domingo</b>
              <strong>De 20 a 3 AM</strong>
            </p>

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
