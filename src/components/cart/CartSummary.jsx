"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cartContext } from "@/Context/Cart";
import { useContext, useState } from "react";
import { Input } from "../ui/input";
import toast from "react-hot-toast";
import { X } from "lucide-react";

const handleSubmitCoupon = async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const couponValue = formData.get("coupon");

  if (!couponValue) {
    toast.error("يرجى إدخال كود الكوبون");
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/coupons/apply`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: couponValue }),
      }
    );
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.message || "الكوبون غير صالح");
      return null;
    }
    return result; // Return the coupon data
  } catch (e) {
    console.log("error :", e);
    toast.error("حدث خطأ ما، حاول مرة أخرى");
    return null;
  }
};

export function CartSummary({
  showConfirmButon = true,
  showCouponField = false,
}) {
  const { total, totalItemInCart } = useContext(cartContext);
  const [coupon, setCoupon] = useState(null);

  if (total === 0 || totalItemInCart === 0) {
    return;
  }

  const shippingCost =
    total >= 200 || coupon?.type === "free_shipping" ? 0 : 30;
  const finalTotal = total + shippingCost - (coupon?.discount || 0);

  const handleCouponFormSubmit = async (e) => {
    const coupon = await handleSubmitCoupon(e);
    if (coupon) {
      setCoupon(coupon);
      toast.success("تم تطبيق الكوبون بنجاح");
    }
  };

  return (
    <Card className="sticky top-[200px]">
      <CardHeader>
        <CardTitle>ملخص الطلب</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>المجموع الفرعي</span>
          <span>{total.toFixed(2)} جنيه</span>
        </div>

        <div className="flex justify-between">
          <span>الشحن</span>
          <span>{shippingCost === 0 ? "مجاني" : `${shippingCost} جنيه`}</span>
        </div>

        {(total >= 200 || coupon?.type === "free_shipping") && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
            🎉 تهانينا! حصلت على شحن مجاني
          </div>
        )}

        {total < 200 && coupon?.type !== "free_shipping" && (
          <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
            أضف {(200 - total).toFixed(2)} جنيه أخرى للحصول على شحن مجاني
          </div>
        )}

        {coupon?.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>خصم الكوبون</span>
            <span>-{coupon.discount.toFixed(2)} جنيه</span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>المجموع الكلي</span>
          <span>{finalTotal.toFixed(2)} جنيه</span>
        </div>

        <Separator />

        {showCouponField && (
          <div className="flex flex-col space-y-2">
            <label htmlFor="coupon" className="font-medium">
              هل لديك كوبون خصم؟
            </label>
            <form onSubmit={handleCouponFormSubmit} className="flex space-x-2">
              <div className="relative flex items-center">
                <Input
                  type="text"
                  id="coupon"
                  name="coupon"
                  placeholder="أدخل كود الكوبون"
                  required
                />
                <Button
                  variant="ghost"
                  className="absolute left-0 top-0 h-full"
                  onClick={(e) => {
                    e.preventDefault();
                    setCoupon(null);
                  }}
                >
                  <X />
                </Button>
              </div>
              <Button className="mt-2 w-full">تطبيق الكوبون</Button>
            </form>
          </div>
        )}

        {showConfirmButon && (
          <Link href="/checkout">
            <Button className="w-full" disabled={totalItemInCart === 0}>
              إتمام الطلب
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
