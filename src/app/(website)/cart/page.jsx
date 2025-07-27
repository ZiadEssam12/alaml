import { CartItems } from "@/components/cart/CartItems";
import { CartSummary } from "@/components/cart/CartSummary";
import React from "react";

export default function page() {
  // Dummy cart items, replace with your actual cart data fetching logic
  const items = [
    { id: 1, name: "دفتر", price: 20, quantity: 2, maxQuantity: 5 },
    { id: 2, name: "قلم", price: 5, quantity: 3, maxQuantity: 10 },
    { id: 3, name: "محفظة", price: 100, quantity: 1, maxQuantity: 2 },
  ];

  const cartTotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

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
              <CartItems items={items} />
            </div>
            <div className="lg:col-span-1">
              <CartSummary itemsLength={items.length} total={cartTotal} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
