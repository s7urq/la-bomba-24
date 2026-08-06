import { describe, expect, it } from "vitest";

import { clampAmount, formatGrams, lineTotal } from "@/lib/pricing";

describe("precios por peso", () => {
  it("cobra proporcional al kilo y redondea a peso entero", () => {
    // $8.900 el kilo, 250 g => $2.225
    expect(lineTotal({ precio: 8900, cantidad: 250, unidad: "kg" })).toBe(2225);
    // 1 kg exacto no puede desviarse del precio de lista
    expect(lineTotal({ precio: 8900, cantidad: 1000, unidad: "kg" })).toBe(8900);
    // 333 g de $8.900 => 2963,7 => redondea, nunca deja decimales
    expect(lineTotal({ precio: 8900, cantidad: 333, unidad: "kg" })).toBe(2964);
  });

  it("no cambia el cálculo de los productos por unidad", () => {
    expect(lineTotal({ precio: 7700, cantidad: 2, unidad: "unidad" })).toBe(15400);
    // Los carritos ya guardados no traen `unidad`: deben seguir por unidad.
    expect(lineTotal({ precio: 7700, cantidad: 2 })).toBe(15400);
  });

  it("encuadra los gramos al múltiplo de corte y respeta los topes", () => {
    expect(clampAmount({ unidad: "kg" }, 137)).toBe(150);
    // El cuarto tiene que sobrevivir intacto al encuadre.
    expect(clampAmount({ unidad: "kg" }, 250)).toBe(250);
    expect(clampAmount({ unidad: "kg" }, 500)).toBe(500);
    expect(clampAmount({ unidad: "kg" }, 50)).toBe(100);
    expect(clampAmount({ unidad: "kg" }, 99999)).toBe(5000);
    // Reencuadre al migrar de unidad a peso: 2 unidades no son 2 gramos.
    expect(clampAmount({ unidad: "kg" }, 2)).toBe(100);
  });

  it("limita las unidades sueltas sin tocar el mínimo de peso", () => {
    expect(clampAmount({ unidad: "unidad" }, 500)).toBe(99);
    expect(clampAmount({ unidad: "unidad" }, 3)).toBe(3);
  });

  it("escribe los gramos como los diría el que atiende", () => {
    expect(formatGrams(100)).toBe("100 g");
    expect(formatGrams(500)).toBe("500 g");
    expect(formatGrams(1000)).toBe("1 kg");
    expect(formatGrams(1500)).toBe("1,5 kg");
  });
});
