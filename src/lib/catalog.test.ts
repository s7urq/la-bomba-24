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

  it("arma las dos presentaciones cuando la fila trae la oferta por peso", () => {
    const csv = [
      "categoria,marca,nombre,descripcion,precio,cant-promo,precio-promo,destacado,disponible,imagen",
      "fiambres,,Mortadela Calchaquí,,1400,250g,3000,no,si,",
    ].join("\n");

    expect(parseProductsCsv(csv)[0].presentaciones).toEqual([
      { gramos: 100, precio: 1400, oferta: false },
      { gramos: 250, precio: 3000, oferta: true },
    ]);
  });

  it("descarta la oferta cuando sale más barata que la cantidad chica", () => {
    // Es el síntoma de una fila cargada con el precio por kilo en vez de por
    // 100 g: mostrarla daría un botón de 250 g más barato que el de 100 g.
    const csv = [
      "categoria,marca,nombre,descripcion,precio,cant-promo,precio-promo,destacado,disponible,imagen",
      "fiambres,,Fymbo,,29000,250g,24300,no,si,",
    ].join("\n");

    expect(parseProductsCsv(csv)[0].presentaciones).toEqual([
      { gramos: 100, precio: 29000, oferta: false },
    ]);
  });

  it("deja sin presentaciones a lo que se vende por unidad", () => {
    const csv = [
      "categoria,marca,nombre,descripcion,precio,cant-promo,precio-promo,destacado,disponible,imagen",
      "cerveza,Quilmes,Latón,,3500,,,no,si,",
    ].join("\n");

    expect(parseProductsCsv(csv)[0].presentaciones).toEqual([]);
  });

  it("parsea zonas completas y conserva minutos opcionales", () => {
    expect(
      parseZonesCsv("nombre,costo,pedido_minimo,minutos\nZona 1,1500,8000,25\nZona 2,2000,10000,"),
    ).toEqual([
      { nombre: "Zona 1", costo: 1500, pedidoMinimo: 8000, minutos: 25, km: null },
      { nombre: "Zona 2", costo: 2000, pedidoMinimo: 10000, minutos: null, km: null },
    ]);
  });

  it("arma el nombre de la zona con el radio y las ordena de cerca a lejos", () => {
    const csv = "zona,km,costo,pedido_minimo,minutos\n3,10,3500,20000,25\n1,3,1500,0,10\n2,5,2500,10000,20";

    expect(parseZonesCsv(csv)).toEqual([
      { nombre: "Hasta 3 km", costo: 1500, pedidoMinimo: 0, minutos: 10, km: 3 },
      { nombre: "Hasta 5 km", costo: 2500, pedidoMinimo: 10000, minutos: 20, km: 5 },
      { nombre: "Hasta 10 km", costo: 3500, pedidoMinimo: 20000, minutos: 25, km: 10 },
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
