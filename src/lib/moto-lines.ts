import type { CategorySlug } from "@/config/categories";
import { formatGrams, isByWeight } from "@/lib/pricing";
import type { CartItem, Product } from "@/types/domain";

/** El que sale con la moto. Si algún día cambia, se cambia acá y en ningún otro lado. */
export const REPARTIDOR = "Willy";

/**
 * Cómo se nombra el rubro cuando lo mete en una frase suelta. No sale de
 * `CATEGORIES.label` porque ahí es un título ("Cerveza") y acá es parte de una
 * oración con género y número ("mucha cerveza").
 */
const EN_FRASE: Record<CategorySlug, string> = {
  tragos: "muchos tragos",
  alfajores: "muchos alfajores",
  cerveza: "mucha cerveza",
  fumar: "mucho para fumar",
  sandwiches: "muchos sánguches",
  fiambres: "mucho fiambre",
  golosinas: "muchas golosinas",
  gaseosas: "muchas gaseosas",
  almacen: "mucho de almacén",
  vinoteca: "muchas botellas",
};

export interface MotoContext {
  deliveryActivo: boolean;
  items: CartItem[];
  products: Product[];
}

/**
 * "Nos están pidiendo muchos alfajores" no es relleno: sale de los productos
 * marcados como destacados en el Sheet. Si el dueño destaca otra cosa, la moto
 * canta otra cosa. Una frase inventada envejece; esta se actualiza sola.
 */
function loQueSeVende(products: Product[]): string | null {
  const conteo = new Map<CategorySlug, number>();

  for (const product of products) {
    if (!product.destacado || !product.disponible) continue;
    conteo.set(product.categoria, (conteo.get(product.categoria) ?? 0) + 1);
  }

  let top: CategorySlug | null = null;
  let max = 0;
  for (const [categoria, cantidad] of conteo) {
    if (cantidad > max) {
      max = cantidad;
      top = categoria;
    }
  }

  return top ? `Hoy nos están pidiendo ${EN_FRASE[top]}` : null;
}

/**
 * Las frases que rotan cuando no pasa nada. Mezcla labia de mostrador con
 * cosas que son verdad: si el delivery está apagado no puede decir que la moto
 * está en marcha, y si el carrito tiene seis cosas lo comenta.
 */
export function idleLines(ctx: MotoContext): string[] {
  const { deliveryActivo, items, products } = ctx;
  const lines: string[] = [];
  const unidades = items.length;

  if (deliveryActivo) {
    lines.push(`Dale que ${REPARTIDOR} tiene que salir`);
    lines.push("La moto está en marcha");
    lines.push("Tardamos menos de lo que pensás");
    lines.push("Andá poniendo el hielo");
  } else {
    lines.push("Ahora la moto está guardada");
    lines.push("Dejá el pedido igual, salimos a las 20");
    lines.push("De jueves a domingo salgo hasta las 3");
    lines.push(`${REPARTIDOR} está cargando nafta`);
  }

  const vendido = loQueSeVende(products);
  if (vendido) lines.push(vendido);

  if (unidades === 0) {
    lines.push("Tocá algo y lo cargo");
    lines.push("Todavía tengo la caja vacía");
  } else if (unidades >= 6) {
    lines.push("Esto ya es una fiesta");
    lines.push("Vas a tener que ayudarme a bajarlo");
  } else if (unidades <= 2) {
    lines.push(`Con eso solo no lo hago salir a ${REPARTIDOR}`);
    lines.push("¿Seguro no falta nada?");
  } else {
    lines.push("Ahí vamos bien");
    lines.push("Buena carga");
  }

  lines.push("Si no está en la lista, escribilo igual");

  return lines;
}

/** Lo que grita cuando le tirás algo adentro. */
export function addReaction(item: CartItem): string {
  const nombre = item.nombre.trim();

  if (isByWeight(item)) return `${formatGrams(item.cantidad)} de ${nombre}, cortado`;

  switch (item.categoria) {
    case "alfajores":
      return `${nombre} adentro`;
    case "tragos":
      return `Ahí va: ${nombre}`;
    case "cerveza":
      return `Fría, ${nombre}`;
    case "fumar":
      return `${nombre}, anotado`;
    default:
      return `Cayó ${nombre}`;
  }
}

/**
 * Qué ítem creció entre dos estados del carrito. Sirve para que la moto
 * reaccione sin que nadie le pase props: mira el store y saca la conclusión.
 */
export function findAdded(previous: CartItem[], next: CartItem[]): CartItem | null {
  const antes = new Map(previous.map((item) => [item.id, item.cantidad]));

  for (const item of next) {
    const anterior = antes.get(item.id);
    if (anterior === undefined || item.cantidad > anterior) return item;
  }

  return null;
}
