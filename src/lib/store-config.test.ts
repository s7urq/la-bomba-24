import { describe, expect, it } from "vitest";

import { withWhatsAppFallback } from "@/lib/store-config";
import type { StoreConfig } from "@/types/domain";

const config: StoreConfig = {
  deliveryActivo: false,
  mensajeCerrado: "",
  whatsapp: "",
  horarioTexto: "Jue a dom de 20 a 03",
};

describe("configuración de respaldo", () => {
  it("usa y normaliza el WhatsApp de respaldo cuando el Sheet está vacío", () => {
    expect(withWhatsAppFallback(config, "+54 9 11 3833-6347").whatsapp).toBe("5491138336347");
  });

  it("prioriza el WhatsApp publicado en el Sheet", () => {
    const published = { ...config, whatsapp: "5491155554444" };

    expect(withWhatsAppFallback(published, "+54 9 11 3833-6347")).toBe(published);
  });
});
