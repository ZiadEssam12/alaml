"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cartContext } from "@/Context/Cart";
import { useContext, useState, useEffect } from "react";
import { Input } from "../ui/input";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import Cookies from "js-cookie";

export function CartSummary({
  showConfirmButon = true,
  showCouponField = false,
  initialCoupon = null,
}) {
  const { total, totalItemInCart } = useContext(cartContext);
  const [coupon, setCoupon] = useState(initialCoupon);
  const [couponCode, setCouponCode] = useState(
    initialCoupon?.coupon?.code || ""
  ); // Separate state for input value

  useEffect(() => {
    if (initialCoupon) {
      setCoupon(initialCoupon);
      setCouponCode(initialCoupon.coupon?.code || "");
    }
  }, [initialCoupon]);

  useEffect(() => {
    if (coupon?.coupon?.type === "free_shipping" && total >= 200) {
      toast.error("الكوبونات تعمل فقط للمجموع أقل من 200 جنيه");
      setCoupon(null);
      setCouponCode("");
    }
  }, [total]);

  console.log("coupon in cart summary :", coupon);
  console.log("coupon type in cart summary :", coupon?.type);

  if (total === 0 || totalItemInCart === 0) {
    return;
  }

  const shippingCost =
    total >= 200 || coupon?.coupon?.type === "free_shipping" ? 0 : 30;
  const finalTotal = total + shippingCost - (coupon?.discount || 0);

  const handleCouponFormSubmit = async (e) => {
    e.preventDefault();
    const userId = Cookies.get("userid");
    console.log("user id :", userId);

    const formData = new FormData(e.target);
    const couponValue = formData.get("coupon");

    if (!couponValue) {
      toast.error("يرجى إدخال كود الكوبون");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/coupons/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            userId: Cookies.get("userid"),
          },
          body: JSON.stringify({ couponCode: couponValue }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.message || "الكوبون غير صالح");
        return;
      }

      // Check if free_shipping coupon and total >= 200
      if (result.coupon.type === "free_shipping" && total >= 200) {
        toast.error("الكوبونات تعمل فقط للمجموع أقل من 200 جنيه");
        return;
      }

      setCoupon(result);
      setCouponCode(couponValue);
      toast.success("تم تطبيق الكوبون بنجاح");
    } catch (e) {
      console.log("error :", e);
      toast.error("حدث خطأ ما، حاول مرة أخرى");
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
          {coupon?.coupon?.type === "free_shipping" && total < 200 ? (
            <span className="text-green-600 font-medium">مجاني</span>
          ) : (
            <span>{shippingCost === 0 ? "مجاني" : `${shippingCost} جنيه`}</span>
          )}
        </div>

        {(total >= 200 || coupon?.coupon?.type === "free_shipping") && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
            🎉 تهانينا! حصلت على شحن مجاني
          </div>
        )}

        {total < 200 && coupon?.coupon?.type !== "free_shipping" && (
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
            <form
              onSubmit={handleCouponFormSubmit}
              className="flex items-center justify-between space-x-2"
            >
              <div className="relative flex items-center">
                <Input
                  type="text"
                  id="coupon"
                  name="coupon"
                  placeholder="أدخل كود الكوبون"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="pl-8"
                />
                <Button
                  className="absolute left-0 top-0 h-full bg-transparent text-primary shadow-none border-0 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCoupon(null);
                    setCouponCode("");
                  }}
                  type="reset"
                >
                  <X />
                </Button>
              </div>
              <Button>تطبيق الكوبون</Button>
            </form>
          </div>
        )}

        {showConfirmButon && (
          <Link href={coupon ? `/checkout?coupon=${couponCode}` : "/checkout"}>
            <Button className="w-full" disabled={totalItemInCart === 0}>
              إتمام الطلب
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
