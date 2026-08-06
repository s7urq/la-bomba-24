import type { Metadata, Viewport } from "next";

import { StoreHeader } from "@/components/store-header";
import { CatalogProvider } from "@/providers/catalog-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "La Bomba 24 · Delivery en Quilmes",
    template: "%s · La Bomba 24",
  },
  description: "Kiosco y almacén en Quilmes. Elegí tu pedido y mandalo directo por WhatsApp.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#090909",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body>
        <CatalogProvider>
          <div className="app-frame">
            <StoreHeader />
            {children}
          </div>
        </CatalogProvider>
      </body>
    </html>
  );
}
