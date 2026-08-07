import { formatPesos } from "@/lib/format";
import { formatAmount, formatGrams, isByWeight, lineTotal } from "@/lib/pricing";
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
  // Por peso: "500 g de Jamón crudo". Por presentación: "2x Mortadela (250 g)",
  // que es como se canta en el mostrador —tantos paquetes de tanto— y no
  // "500 g", que obligaría a rehacer la cuenta al que corta.
  // Por unidad se mantiene "2x Heineken", el formato que el local ya lee.
  const label = isByWeight(item)
    ? `${formatAmount(item)} de ${item.nombre}`
    : item.gramos !== undefined
      ? `${formatAmount(item)} ${item.nombre} (${formatGrams(item.gramos)})`
      : `${formatAmount(item)} ${item.nombre}`;
  return `• ${label} — ${formatPesos(lineTotal(item))}`;
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
