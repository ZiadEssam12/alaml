import { CartSummary } from "@/components/cart/CartSummary";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { auth } from "@/auth/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import React from "react";

export default async function page({ searchParams }) {
  const searchParamsData = await searchParams;
  const couponCode = searchParamsData?.coupon;

  let cartItems = [];
  let coupon = null;
  let userId = null;

  try {
    const session = await auth();
    userId = session?.user?.id;

    if (userId) {
      const cart = await prisma.cart.findFirst({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      cartItems = cart?.items || [];

      // Apply coupon if provided
      if (couponCode) {
        try {
          // Direct database call for coupon
          const couponData = await prisma.coupon.findFirst({
            where: {
              code: couponCode,
              isActive: true,
              startDate: { lte: new Date() },
              expirationDate: { gte: new Date() },
            },
          });

          if (couponData) {
            // Calculate discount (simplified version)
            const cartTotal = cartItems.reduce(
              (acc, item) => acc + item.price * item.quantity,
              0
            );

            let discount = 0;
            if (couponData.type === "percentage") {
              const percentageDiscount =
                (cartTotal * Number(couponData.value)) / 100;
              discount = Math.min(
                percentageDiscount,
                Number(couponData.maxDiscountAmount) || percentageDiscount
              );
            } else if (couponData.type === "fixed") {
              discount = Math.min(
                Number(couponData.value),
                Number(couponData.maxDiscountAmount) || Number(couponData.value)
              );
            }

            coupon = {
              coupon: couponData,
              discount,
              message: "تم تطبيق الكوبون بنجاح",
            };
          }
        } catch (error) {
          console.error("💥 Failed to apply coupon:", error);
        }
      }
    }
  } catch (error) {
    console.error("Error in checkout page:", error);
  }

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center text-center bg-background  p-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-muted-foreground mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.6 18h8.8a2 2 0 001.95-2.3L17 13M7 13V6h13"
          />
        </svg>
        <h2 className="text-xl font-semibold mb-2 text-muted-foreground">
          سلة التسوق فارغة
        </h2>
        <p className="mb-4 text-muted-foreground">
          لم تقم بإضافة أي منتجات بعد.
        </p>
        <Link
          href="/products"
          className="inline-block px-6 py-2 bg-primary text-white rounded-md shadow hover:bg-primary/90 transition font-medium"
        >
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-8">إتمام الطلب</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <CheckoutForm items={cartItems} total={total} coupon={coupon} />
        </div>
        <div>
          <CartSummary
            itemsLength={cartItems.length}
            total={total}
            showConfirmButon={false}
            showCouponField={false}
            initialCoupon={coupon}
          />
        </div>
      </div>
    </div>
  );
}
