"use client";

import { useEffect, useRef } from "react";

import "leaflet/dist/leaflet.css";

import { LOCAL, direccionCompleta } from "@/config/local";
import type { DeliveryZone } from "@/types/domain";

/**
 * El mapa con los anillos de reparto.
 *
 * Va con Leaflet y no con el iframe de OpenStreetMap porque ese embed no
 * dibuja áreas: la wiki lo dice explícitamente —"si querés algo más
 * sofisticado necesitás una librería de slippy map propia"— y además elige su
 * propio nivel de zoom, así que cualquier círculo pintado encima queda a una
 * escala que no es la que uno pidió. Los anillos marcan hasta dónde llega la
 * moto: si no están a escala, mienten.
 *
 * `L.circle` recibe el radio en metros y lo mantiene correcto en cada zoom y
 * al arrastrar, que es justo lo que un overlay fijo no puede hacer.
 *
 * Leaflet entra por import dinámico: son ~40 KB que sólo bajan cuando alguien
 * abre el mapa, y no toca el peso de la home.
 */
export function MapaZonas({ zonas }: { zonas: DeliveryZone[] }) {
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nodo = contenedor.current;
    if (!nodo) return;

    let mapa: import("leaflet").Map | null = null;
    let cancelado = false;

    void (async () => {
      const L = await import("leaflet");
      if (cancelado || !contenedor.current) return;

      mapa = L.map(nodo, {
        center: [LOCAL.lat, LOCAL.lon],
        zoom: 13,
        // El mapa es para mirar, no para explorar: sin scroll-zoom, el gesto
        // de bajar la página no queda atrapado adentro del recuadro.
        scrollWheelZoom: false,
        attributionControl: true,
      });

      // Tiles ya oscuros en vez de los claros de OSM teñidos por CSS: filtrar
      // el panel entero obliga al compositor a reprocesar cada tile en cada
      // gesto, y eso en un celu barato se siente. Los datos siguen siendo de
      // OpenStreetMap y por eso se atribuye a los dos.
      L.tileLayer("https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(mapa);

      const conRadio = zonas.filter((zona) => zona.km !== null);
      let mayor: import("leaflet").Circle | null = null;

      // De mayor a menor para que el círculo chico quede arriba y se vea.
      for (const zona of [...conRadio].sort((a, b) => (b.km ?? 0) - (a.km ?? 0))) {
        const km = zona.km ?? 0;

        const circulo = L.circle([LOCAL.lat, LOCAL.lon], {
          radius: km * 1000,
          color: "#ffd447",
          weight: 1.5,
          dashArray: "5 4",
          fillColor: "#ffd447",
          fillOpacity: 0.07,
        }).addTo(mapa);

        // La etiqueta va clavada en el borde norte del anillo, no como tooltip
        // del círculo: Leaflet los ancla al centro, así que las tres terminaban
        // apiladas en el mismo punto y sólo se veía una. Un grado de latitud
        // son ~110,574 km en cualquier lugar del planeta.
        L.marker([LOCAL.lat + km / 110.574, LOCAL.lon], {
          interactive: false,
          keyboard: false,
          icon: L.divIcon({
            className: "mapa-tip",
            html: zona.nombre,
            iconSize: undefined,
          }),
        }).addTo(mapa);

        mayor ??= circulo;
      }

      L.circleMarker([LOCAL.lat, LOCAL.lon], {
        radius: 7,
        color: "#17120a",
        weight: 2,
        fillColor: "#ffd447",
        fillOpacity: 1,
      })
        .addTo(mapa)
        .bindTooltip(direccionCompleta, { direction: "top" });

      // El modal abre y monta el mapa en el mismo tick, así que Leaflet mide el
      // contenedor antes de que el navegador termine de acomodarlo y encuadra
      // contra un tamaño equivocado. `invalidateSize` lo obliga a medir de
      // nuevo, y recién ahí tiene sentido encuadrar.
      mapa.invalidateSize();

      // Sobre el anillo más lejano: el que mira ve de una hasta dónde llega el
      // reparto, sin tener que alejar a mano.
      if (mayor) mapa.fitBounds(mayor.getBounds(), { padding: [14, 14] });
    })();

    return () => {
      cancelado = true;
      mapa?.remove();
    };
  }, [zonas]);

  return <div className="mapa-lienzo" ref={contenedor} />;
}
