import { CartSummary } from "@/components/cart/CartSummary";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { redirect } from "next/navigation";
import React from "react";

export default function page() {
  const cartItems = [];
  const total = 250;

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-8">إتمام الطلب</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <CheckoutForm items={cartItems} total={total} />
        </div>
        <div>
          <CartSummary
            itemsLength={cartItems.length}
            total={total}
            showConfirmButon={false}
          />
        </div>
      </div>
    </div>
  );
}
