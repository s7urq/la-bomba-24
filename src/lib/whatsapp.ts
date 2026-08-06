import { formatPesos } from "@/lib/format";
import type { CartItem, DeliveryZone } from "@/types/domain";

export const MAX_WHATSAPP_CHARACTERS = 1800;

export interface WhatsAppOrder {
  items: CartItem[];
  subtotal: number;
  zone: DeliveryZone;
  total: number;
  name: string;
  address: string;
  note: string;
  freeText: string;
}

function itemLine(item: CartItem): string {
  return `• ${item.cantidad}x ${item.nombre} — ${formatPesos(item.precio * item.cantidad)}`;
}

function footer(order: WhatsAppOrder): string {
  const lines = [
    `Subtotal: ${formatPesos(order.subtotal)}`,
    `Envío (${order.zone.nombre}): ${formatPesos(order.zone.costo)}`,
    `*Total: ${formatPesos(order.total)}*`,
    "",
    `Nombre: ${order.name.trim()}`,
    `Dirección: ${order.address.trim()}`,
  ];

  if (order.note.trim()) lines.push(`Nota: ${order.note.trim()}`);
  if (order.freeText.trim()) lines.push(`Además: ${order.freeText.trim()}`);
  return lines.join("\n");
}

function compose(order: WhatsAppOrder, items: CartItem[], truncated: boolean): string {
  const itemLines = items.map(itemLine);
  if (truncated) itemLines.push("(seguí en el chat)");

  return ["*PEDIDO WEB*", "", ...itemLines, "", footer(order)].join("\n");
}

export function buildWhatsAppMessage(
  order: WhatsAppOrder,
  maxCharacters = MAX_WHATSAPP_CHARACTERS,
): { message: string; truncatedItems: number } {
  if (!Number.isSafeInteger(maxCharacters) || maxCharacters < 1) {
    throw new RangeError("maxCharacters debe ser un entero positivo");
  }

  const full = compose(order, order.items, false);
  if (full.length <= maxCharacters) return { message: full, truncatedItems: 0 };

  const visible: CartItem[] = [];
  for (const item of order.items) {
    const candidate = compose(order, [...visible, item], true);
    if (candidate.length > maxCharacters) break;
    visible.push(item);
  }

  return {
    message: compose(order, visible, true),
    truncatedItems: order.items.length - visible.length,
  };
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
