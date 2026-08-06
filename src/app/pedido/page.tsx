import type { Metadata } from "next";

import { OrderScreen } from "@/components/order-screen";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = { title: "Tu pedido" };

export default function OrderPage() {
  return (
    <PageTransition>
      <OrderScreen />
    </PageTransition>
  );
}
