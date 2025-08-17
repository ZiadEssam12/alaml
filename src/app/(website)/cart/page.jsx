import { CartItems } from "@/components/cart/CartItems";
import { CartSummary } from "@/components/cart/CartSummary";
import { cookies } from "next/headers";
import React from "react";

export default async function page() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userid")?.value;

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      userid: userId,
    },
  });

  const { data: cartItems } = await res.json();
  const items = cartItems.items;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">سلة التسوق</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground mb-4">
              سلة التسوق فارغة
            </p>
            <a
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              تصفح المنتجات
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CartItems />
            </div>
            <div className="lg:col-span-1">
              <CartSummary />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
