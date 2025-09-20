import { CartSummary } from "@/components/cart/CartSummary";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { cookies } from "next/headers";
import Link from "next/link";
import React from "react";

export default async function page({ searchParams }) {
  const cookiesStore = await cookies();
  const userId = cookiesStore.get("userid")?.value;

  const searchParamsData = await searchParams;
  const couponCode = searchParamsData?.coupon;

  console.log("🔍 Checkout Page Debug:", {
    userId,
    couponCode,
    searchParams: Object.fromEntries(searchParamsData.entries?.() || []),
  });
  let coupon = null;

  if (couponCode && userId) {
    try {
      console.log("🔍 Fetching coupon:", couponCode, "for user:", userId);

      const couponResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/coupons/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            userid: userId,
          },
          body: JSON.stringify({ couponCode }),
        }
      );

      const couponResult = await couponResponse.json();
      console.log("📦 Coupon API Response:", {
        status: couponResponse.status,
        ok: couponResponse.ok,
        result: couponResult,
      });

      if (couponResponse.ok) {
        coupon = couponResult;
        console.log("✅ Coupon applied successfully:", coupon);

        // Validate coupon structure
        if (!coupon || typeof coupon !== "object") {
          console.warn("⚠️ Invalid coupon structure:", coupon);
          coupon = null;
        } else if (!coupon.coupon.type) {
          console.warn("⚠️ Coupon missing type property:", coupon);
          coupon = null;
        }
      } else {
        console.log("❌ Coupon application failed:", couponResult);
      }
    } catch (error) {
      console.error("💥 Failed to apply coupon:", error);
    }
  } else {
    console.log("ℹ️ No coupon code or user ID:", { couponCode, userId });
  }

  const resCart = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart/user`, {
    headers: {
      "Content-Type": "application/json",
      userid: userId,
    },
    cache: "no-store",
  });

  const cartItems = await resCart.json().then((res) => {
    if (res.error) {
      return [];
    }
    return res.data.items;
  });

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

  console.log("coupon code :", coupon);

  console.log("📤 Passing coupon to components:", {
    coupon,
    couponType: coupon?.type,
    couponCode: coupon?.code,
    hasCoupon: !!coupon,
  });

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-8">إتمام الطلب</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <CheckoutForm
            items={cartItems}
            total={total}
            userId={userId}
            coupon={coupon}
          />
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
