import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";

import { StoreHeader } from "@/components/store-header";
import { CatalogProvider } from "@/providers/catalog-provider";

import "./globals.css";

/**
 * Una sola familia para todo, en varios pesos. Antes eran dos: Anton para los
 * títulos y Space Grotesk para el texto.
 *
 * Anton es una display ultra-condensada de cartel: trae un solo peso y a
 * cualquier tamaño grita. Sirve para un afiche, no para una web de pedidos
 * donde hay que leer nombres de producto y precios. Archivo es la grotesca que
 * usa la marca, tiene de 400 a 900 de verdad, y deja que la jerarquía la haga
 * el peso en vez del tamaño — que es lo que hace que un sitio se vea prolijo
 * en lugar de ruidoso.
 */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

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
    // data-scroll-behavior le avisa a Next que el scroll suave es intencional,
    // para que no pelee con el salto de scroll de las transiciones de ruta.
    <html
      lang="es-AR"
      data-scroll-behavior="smooth"
      className={archivo.variable}
    >
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
