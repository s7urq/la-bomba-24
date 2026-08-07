"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { formatPesos } from "@/lib/format";
import { addReaction, findAdded, idleLines } from "@/lib/moto-lines";
import { useCatalog } from "@/providers/catalog-provider";
import { cartQuantity, cartSubtotal, useCartStore } from "@/store/cart-store";
import type { CartItem } from "@/types/domain";

/** Cada cuánto cambia la frase cuando no pasa nada. */
const ROTACION_MS = 4200;
/** Cuánto se queda la frase de reacción antes de volver a la rotación. */
const REACCION_MS = 3400;
/** Lo que dura la rueda en el aire. */
const WHEELIE_MS = 950;

/**
 * El repartidor se dibuja dos veces: primero en negro y más grueso, después en
 * color. Ese contorno oscuro es lo que lo despega del cuerpo de la moto — sin
 * él, con todo pintado del mismo amarillo, el casco parece una pelota apoyada
 * arriba en vez de alguien manejando.
 */
const REPARTIDOR = (
  <>
    <path d="M70 56 L92 32" />
    <path d="M92 36 L132 44" />
    <path d="M75 60 L85 79 L99 85" />
    <circle cx="99" cy="24" r="14" />
  </>
);

/**
 * La moto dibujada. Va por partes separadas a propósito: el wheelie pivota
 * sobre el eje trasero, los rayos giran sobre su propio centro y el humo sale
 * del escape. Si fuera una sola silueta, todo eso sería un bloque rígido.
 */
function MotoSvg() {
  return (
    <svg className="moto__svg" viewBox="0 0 200 132" aria-hidden="true" focusable="false">
      {/* Estela: sale de atrás, marca que viene entrando en cuadro. */}
      <g className="moto__estela">
        <path d="M4 52h24" />
        <path d="M0 72h16" />
        <path d="M8 92h20" />
      </g>

      <g className="moto__humo">
        <circle cx="24" cy="82" r="4" />
        <circle cx="12" cy="76" r="6" />
      </g>

      {/* Todo lo que pivota en el wheelie cuelga de acá. */}
      <g className="moto__rig">
        {/* Caja de delivery sobre la parrilla trasera. */}
        <g className="moto__caja">
          <rect x="10" y="30" width="40" height="33" rx="4" />
          <path d="M10 46h40" />
        </g>

        {/* El cuerpo es una masa sólida, no un cuadro de caños: eso último se
            lee como bicicleta por más motor que le cuelgues. */}
        <path
          className="moto__cuerpo"
          d="M24 58 H92 L106 44 H126 L138 60 L128 76 H100 L90 84 H40 Z"
        />
        <rect className="moto__motor" x="86" y="74" width="32" height="19" rx="3" />

        <g className="moto__chasis">
          <path d="M139 52 L152 98" />
          <path d="M126 37 L146 44" />
          <path d="M48 98 L96 86" />
        </g>

        <g className="moto__repartidor">
          <g className="moto__repartidor--borde">{REPARTIDOR}</g>
          <g className="moto__repartidor--cuerpo">{REPARTIDOR}</g>
        </g>

        <g className="moto__faro">
          <circle cx="149" cy="52" r="6" />
        </g>

        {/* Goma gorda y llanta chica: la proporción rueda/cuerpo es lo que
            separa una moto de una bici, más que cualquier detalle. */}
        <g className="moto__rueda">
          <circle cx="48" cy="100" r="20" />
          <g className="moto__rayos">
            <path d="M39 100 H57" />
            <path d="M43.5 92 L52.5 108" />
            <path d="M52.5 92 L43.5 108" />
          </g>
        </g>

        <g className="moto__rueda">
          <circle cx="152" cy="100" r="20" />
          <g className="moto__rayos moto__rayos--delantera">
            <path d="M143 100 H161" />
            <path d="M147.5 92 L156.5 108" />
            <path d="M156.5 92 L147.5 108" />
          </g>
        </g>
      </g>
    </svg>
  );
}

export function DeliveryMoto() {
  const { data } = useCatalog();
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state.hydrated);

  const subtotal = hydrated ? cartSubtotal(items) : 0;
  const quantity = hydrated ? cartQuantity(items) : 0;

  const [tick, setTick] = useState(0);
  const [reaccion, setReaccion] = useState<string | null>(null);
  const [wheelie, setWheelie] = useState(false);
  const anteriores = useRef<CartItem[]>([]);
  const timers = useRef<number[]>([]);

  const lines = useMemo(
    () =>
      idleLines({
        deliveryActivo: data.config.deliveryActivo,
        items,
        products: data.products,
      }),
    [data.config.deliveryActivo, data.products, items],
  );

  // La moto no recibe props: mira el carrito y saca sola la conclusión de que
  // algo entró. Así reacciona igual desde el catálogo, la búsqueda o el pedido.
  useEffect(() => {
    if (!hydrated) return;

    const agregado = findAdded(anteriores.current, items);
    anteriores.current = items;
    if (!agregado) return;

    setReaccion(addReaction(agregado));
    setWheelie(true);

    timers.current.push(
      window.setTimeout(() => setWheelie(false), WHEELIE_MS),
      window.setTimeout(() => setReaccion(null), REACCION_MS),
    );
  }, [hydrated, items]);

  // La rotación se reinicia con cada reacción: después de gritar algo, la
  // frase siguiente se toma su tiempo en vez de aparecer pisada.
  useEffect(() => {
    if (reaccion) return;
    const id = window.setInterval(() => setTick((valor) => valor + 1), ROTACION_MS);
    return () => window.clearInterval(id);
  }, [reaccion]);

  useEffect(
    () => () => {
      for (const id of timers.current) window.clearTimeout(id);
    },
    [],
  );

  const frase = reaccion ?? lines[tick % lines.length];

  return (
    <div className={`moto-dock ${wheelie ? "moto-dock--wheelie" : ""}`}>
      {/* La moto va arriba del panel, no adentro: necesita aire libre para
          levantar la rueda sin que la recorte ningún borde. */}
      <div className="moto__cabecera">
        <span className="moto__vehiculo" aria-hidden="true">
          <MotoSvg />
        </span>

        {/* La burbuja es labia, no información: un lector de pantalla que la
            anuncie cada 5 segundos hace la página inusable. El dato real vive
            abajo, en el aria-live del total. */}
        <p className="moto__burbuja" aria-hidden="true">
          <span key={frase}>{frase}</span>
        </p>
      </div>

      <div className="moto__panel">
        <div className="moto__cuenta" aria-live="polite">
          <span>{quantity > 0 ? `${quantity} ${quantity === 1 ? "producto" : "productos"}` : "Tu pedido"}</span>
          {/* La key reinicia la animación del total cada vez que cambia el monto. */}
          <strong key={subtotal}>{formatPesos(subtotal)}</strong>
        </div>

        <Link href="/pedido" aria-label="Ver pedido" transitionTypes={["nav-forward"]}>
          Ver pedido
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
