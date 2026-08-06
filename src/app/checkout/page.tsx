import type { Metadata } from "next";

import { CheckoutScreen } from "@/components/checkout-screen";

export const metadata: Metadata = { title: "Datos de entrega" };

export default function CheckoutPage() {
  return <CheckoutScreen />;
}
