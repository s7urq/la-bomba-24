/**
 * Dónde está el kiosco. Único lugar donde vive la dirección: si alguna vez se
 * mudan, se cambia acá y cambia en la portada, en el mapa y en el pie.
 */
export const LOCAL = {
  esquina: "Andrés Baranda y Rodolfo López",
  ciudad: "Quilmes",
  provincia: "Buenos Aires",
  horario: "Delivery de 20 a 3 AM",

  /**
   * El cruce real de las dos calles, no una aproximación al barrio: sale del
   * nodo 619269877 de OpenStreetMap, que es el punto donde Andrés Baranda y
   * Avenida Rodolfo López efectivamente se cortan.
   */
  lat: -34.72367,
  lon: -58.27051,
} as const;

/**
 * Para abrir la ubicación afuera, con la app de mapas que tenga el celu.
 *
 * El mapa de adentro del sitio se dibuja con Leaflet (ver `mapa-zonas.tsx`) y
 * no con el iframe de OpenStreetMap: ese embed no soporta áreas —la propia
 * wiki manda a usar una librería de slippy map para cualquier cosa más
 * sofisticada que un marcador— y elige su propio nivel de zoom, así que los
 * anillos de reparto quedarían fuera de escala.
 */

/** Para abrir el mapa completo afuera, con la app de mapas que tenga el celu. */
export function mapaCompleto(): string {
  const { lat, lon } = LOCAL;
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`;
}

export const direccionCompleta = `${LOCAL.esquina}, ${LOCAL.ciudad}`;
