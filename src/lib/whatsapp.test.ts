import { describe, expect, it } from "vitest";

import { buildWhatsAppMessage, buildWhatsAppUrl, type WhatsAppOrder } from "@/lib/whatsapp";
import type { CartItem } from "@/types/domain";

const items: CartItem[] = [
  {
    id: "cerveza:heineken-970",
    categoria: "cerveza",
    marca: "Heineken",
    nombre: "Heineken 970ml",
    descripcion: "",
    precio: 7700,
    imagen: "",
    cantidad: 2,
  },
  {
    id: "tragos:caipi",
    categoria: "tragos",
    marca: "",
    nombre: "Caipi Maracuyá",
    descripcion: "",
    precio: 9000,
    imagen: "",
    cantidad: 1,
  },
];

const order: WhatsAppOrder = {
  items,
  subtotal: 24400,
  zone: { nombre: "Zona 2", costo: 1500, pedidoMinimo: 10000, minutos: 30 },
  total: 25900,
  name: "Santi",
  address: "Mitre 1234, Quilmes",
  note: "tocar timbre 2B",
  freeText: "un paquete de Marlboro box",
};

describe("mensaje de WhatsApp", () => {
  it("arma el formato acordado con totales por línea", () => {
    expect(buildWhatsAppMessage(order).message).toBe(
      [
        "*PEDIDO WEB*",
        "",
        "• 2x Heineken 970ml — $15.400",
        "• 1x Caipi Maracuyá — $9.000",
        "",
        "Subtotal: $24.400",
        "Envío (Zona 2): $1.500",
        "*Total: $25.900*",
        "",
        "Nombre: Santi",
        "Dirección: Mitre 1234, Quilmes",
        "Nota: tocar timbre 2B",
        "Además: un paquete de Marlboro box",
      ].join("\n"),
    );
  });

  it("trunca ítems y mantiene el mensaje por debajo de 1800 caracteres", () => {
    const manyItems = Array.from({ length: 80 }, (_, index): CartItem => ({
      ...items[0],
      id: `producto-${index}`,
      nombre: `Producto nocturno con nombre bastante largo número ${index}`,
      cantidad: 1,
    }));

    const result = buildWhatsAppMessage({ ...order, items: manyItems });
    expect(result.message.length).toBeLessThanOrEqual(1800);
    expect(result.message).toContain("(seguí en el chat)");
    expect(result.truncatedItems).toBeGreaterThan(0);
    expect(result.message).toContain("Dirección: Mitre 1234, Quilmes");
  });

  it("escribe los fiambres en gramos y no como cantidad de productos", () => {
    const conFiambre: CartItem[] = [
      ...items,
      {
        id: "fiambres:jamon-crudo",
        categoria: "fiambres",
        marca: "",
        nombre: "Jamón crudo",
        descripcion: "",
        precio: 8900,
        imagen: "",
        cantidad: 500,
        unidad: "kg",
      },
    ];

    const message = buildWhatsAppMessage({ ...order, items: conFiambre }).message;
    expect(message).toContain("• 500 g de Jamón crudo — $4.450");
    // Los productos por unidad no deben haber cambiado de formato.
    expect(message).toContain("• 2x Heineken 970ml — $15.400");
  });

  it("codifica el texto y usa el número provisto por config", () => {
    const url = buildWhatsAppUrl("+54 9 11 5555-4444", "Pedido & dirección");
    expect(url).toBe("https://wa.me/5491155554444?text=Pedido%20%26%20direcci%C3%B3n");
  });
});
