import type { Metadata, Viewport } from "next";

import { StoreHeader } from "@/components/store-header";
import { CatalogProvider } from "@/providers/catalog-provider";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://la-bomba-24.vercel.app"),
  title: {
    default: "La Bomba 24 · Delivery en Quilmes",
    template: "%s · La Bomba 24",
  },
  description: "Kiosco y almacén en Quilmes. Elegí tu pedido y mandalo directo por WhatsApp.",
  applicationName: "La Bomba 24",
  openGraph: {
    title: "La Bomba 24 · Delivery en Quilmes",
    description: "Kiosco y almacén en Quilmes. Elegí tu pedido y mandalo directo por WhatsApp.",
    url: "/",
    siteName: "La Bomba 24",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "La Bomba 24 · Delivery en Quilmes",
    description: "Kiosco y almacén en Quilmes. Elegí tu pedido y mandalo directo por WhatsApp.",
  },
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
