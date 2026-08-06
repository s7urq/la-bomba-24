import { describe, expect, it } from "vitest";

import { parseConfigCsv, parseProductsCsv, parseZonesCsv } from "@/lib/catalog";
import { csvToRecords, parseCsv } from "@/lib/csv";

describe("parser CSV", () => {
  it("respeta comas, saltos de línea y comillas escapadas", () => {
    expect(parseCsv('nombre,descripcion\r\nCaipi,"Maracuyá, lima"\r\nOtro,"línea 1\nlínea ""2"""')).toEqual([
      ["nombre", "descripcion"],
      ["Caipi", "Maracuyá, lima"],
      ["Otro", 'línea 1\nlínea "2"'],
    ]);
  });

  it("normaliza encabezados y completa celdas ausentes", () => {
    expect(csvToRecords("\uFEFF Nombre , precio\nAlfajor,1200\nCaramelo")).toEqual([
      { nombre: "Alfajor", precio: "1200" },
      { nombre: "Caramelo", precio: "" },
    ]);
  });
});

describe("catálogo publicado", () => {
  it("no renderiza productos sin precio ni inventa valores inválidos", () => {
    const csv = [
      "categoria,marca,nombre,descripcion,precio,destacado,disponible,imagen",
      "alfajores,Jorgito,Alfajor blanco,,1200,si,,https://img.test/a.jpg",
      "alfajores,Jorgito,Sin precio,,,,,",
      "cerveza,Marca,Precio con punto,,1.500,,,,",
      "otra,Marca,Fuera de catálogo,,900,,,,",
      "fumar,,Papelillos,,600,,no,",
    ].join("\n");

    expect(parseProductsCsv(csv)).toEqual([
      expect.objectContaining({
        categoria: "alfajores",
        nombre: "Alfajor blanco",
        precio: 1200,
        destacado: true,
        disponible: true,
      }),
      expect.objectContaining({
        categoria: "fumar",
        nombre: "Papelillos",
        precio: 600,
        disponible: false,
      }),
    ]);
  });

  it("parsea zonas completas y conserva minutos opcionales", () => {
    expect(
      parseZonesCsv("nombre,costo,pedido_minimo,minutos\nZona 1,1500,8000,25\nZona 2,2000,10000,"),
    ).toEqual([
      { nombre: "Zona 1", costo: 1500, pedidoMinimo: 8000, minutos: 25 },
      { nombre: "Zona 2", costo: 2000, pedidoMinimo: 10000, minutos: null },
    ]);
  });

  it("lee el estado manual y limpia el número de WhatsApp", () => {
    const config = parseConfigCsv(
      "clave,valor\ndelivery_activo,si\nmensaje_cerrado,Volvemos el jueves\nwhatsapp,+54 9 11 5555-4444\nhorario_texto,Jue a dom de 20 a 03",
    );

    expect(config).toEqual({
      deliveryActivo: true,
      mensajeCerrado: "Volvemos el jueves",
      whatsapp: "5491155554444",
      horarioTexto: "Jue a dom de 20 a 03",
    });
  });
});
