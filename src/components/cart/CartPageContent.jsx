"use client";

import { CartItems } from "@/components/cart/CartItems";
import { CartSummary } from "@/components/cart/CartSummary";
import Link from "next/link";
import React, { useContext } from "react";
import { cartContext } from "@/Context/Cart";

export function CartPageContent() {
  const cart = useContext(cartContext);
  const items = cart?.cart || [];

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">سلة التسوق</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-4">سلة التسوق فارغة</p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            تصفح المنتجات
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartItems />
          </div>
          <div className="lg:col-span-1">
            <CartSummary showCouponField={true} />
          </div>
        </div>
      )}
    </main>
  );
}
