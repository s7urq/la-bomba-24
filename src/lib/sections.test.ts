import { describe, expect, it } from "vitest";

import { groupIntoSections } from "@/lib/sections";
import type { Product } from "@/types/domain";

function producto(marca: string, nombre: string, seccion = ""): Product {
  return {
    id: `${marca}:${nombre}`,
    categoria: "vinoteca",
    marca,
    nombre,
    descripcion: "",
    precio: 1000,
    destacado: false,
    disponible: true,
    imagen: "",
    seccion,
    unidad: "unidad",
    presentaciones: [],
  };
}

function titulos(products: Product[]): string[] {
  return groupIntoSections(products).map((s) => s.titulo);
}

describe("groupIntoSections", () => {
  it("respeta la columna seccion de la planilla cuando está cargada", () => {
    const products = [
      producto("Chandon", "Extra Brut", "Espumantes"),
      producto("Santa Julia", "Malbec", "Vinos"),
      producto("Baron B", "Espumante", "Espumantes"),
    ];

    expect(titulos(products)).toEqual(["Espumantes", "Vinos"]);
  });

  it("agrupa por marca cuando el nombre es la variante", () => {
    // El caso vinoteca: agrupar por nombre daría "750ml" y "Lata" de título.
    const products = [
      producto("Skyy", "750ml"),
      producto("Skyy", "Coconut"),
      producto("Smirnoff", "Lata Original 473ml"),
      producto("Smirnoff", "Vodka Tamarindo"),
      producto("Havana Club", "Ron Dorado"),
    ];

    expect(titulos(products)).toEqual(["Skyy", "Smirnoff", "Otros"]);
  });

  it("agrupa por nombre cuando todo comparte la misma marca", () => {
    // El caso tragos: la marca es "La Bomba 24" en todas las filas, así que
    // por marca quedaría un solo cajón y se perdería Caipi / Gin.
    const products = [
      producto("La Bomba 24", "Caipi Jagger"),
      producto("La Bomba 24", "Caipi Hot"),
      producto("La Bomba 24", "Gin Red"),
      producto("La Bomba 24", "Gin Limón"),
      producto("La Bomba 24", "Fernet"),
    ];

    expect(titulos(products)).toEqual(["Caipi", "Gin", "Otros"]);
  });

  it("mantiene la ortografía original de la marca en el título", () => {
    const products = [
      producto("Tía María", "Coffee Liqueur"),
      producto("Tía María", "Creamy Liqueur"),
      producto("Aperol", "750ml"),
      producto("Campari", "750ml"),
    ];

    expect(titulos(products)).toContain("Tía María");
  });

  it("no pone encabezado cuando hay una sola sección", () => {
    const products = [producto("", "Jamón"), producto("", "Queso")];
    expect(titulos(products)).toEqual([""]);
  });

  it("devuelve vacío sin productos", () => {
    expect(groupIntoSections([])).toEqual([]);
  });
});
