"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function CartSummary({ itemsLength, total }) {
  const shippingCost = total >= 200 ? 0 : 30;
  const finalTotal = total + shippingCost;

  return (
    <Card>
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

        {total >= 200 && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
            🎉 تهانينا! حصلت على شحن مجاني
          </div>
        )}

        {total < 200 && (
          <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
            أضف {(200 - total).toFixed(2)} جنيه أخرى للحصول على شحن مجاني
          </div>
        )}

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>المجموع الكلي</span>
          <span>{finalTotal.toFixed(2)} جنيه</span>
        </div>

        <Link href="/checkout">
          <Button className="w-full" disabled={itemsLength === 0}>
            إتمام الطلب
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
