import type { Metadata } from "next";

import { CheckoutScreen } from "@/components/checkout-screen";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = { title: "Datos de entrega" };

export default function CheckoutPage() {
  return (
    <PageTransition>
      <CheckoutScreen />
    </PageTransition>
  );
}
