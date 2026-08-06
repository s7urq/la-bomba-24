import type { Metadata } from "next";

import { OrderScreen } from "@/components/order-screen";

export const metadata: Metadata = { title: "Tu pedido" };

export default function OrderPage() {
  return <OrderScreen />;
}
