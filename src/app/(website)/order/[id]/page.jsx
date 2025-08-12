import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

// This page expects to receive order data via API using the id param
export default async function OrderDetailsPage({ params }) {
  // Fetch order details using params.id (API logic to be implemented by user)
  const order = null; // Replace with API fetch

  if (!order) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        dir="rtl"
      >
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2 text-muted-foreground">
              لم يتم العثور على الطلب
            </h2>
            <p className="text-muted-foreground">
              تأكد من رقم الطلب أو حاول مرة أخرى لاحقًا.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">
          تفاصيل الطلب رقم #{order.id}
        </h1>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">طلب رقم #{order.id}</CardTitle>
            <Badge
              variant={order.status === "delivered" ? "default" : "secondary"}
            >
              {order.status === "delivered"
                ? "تم التوصيل"
                : order.status === "pending"
                ? "قيد الانتظار"
                : order.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-muted-foreground">اسم العميل</p>
                <p className="font-semibold">{order.customerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">البريد الإلكتروني</p>
                <p className="font-semibold">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-muted-foreground">رقم الهاتف</p>
                <p className="font-semibold">{order.customerPhone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">تاريخ الطلب</p>
                <p className="font-semibold">{order.createdAt}</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-muted-foreground mb-1">عنوان الشحن:</p>
              <p className="font-semibold">
                {order.shippingStreet}, {order.shippingCity},{" "}
                {order.shippingZipCode}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-muted-foreground mb-1">شركة الشحن:</p>
              <p className="font-semibold">{order.shippingCompanyURL || "-"}</p>
            </div>
            <div className="mb-4">
              <p className="text-muted-foreground mb-1">رقم التتبع:</p>
              <p className="font-semibold">{order.trackingNumber || "-"}</p>
            </div>
            <div className="mb-4">
              <p className="text-muted-foreground mb-1">ملاحظات:</p>
              <p className="font-semibold">{order.notes || "-"}</p>
            </div>
            <div className="mb-4">
              <p className="text-muted-foreground mb-1">المنتجات:</p>
              <ul className="list-disc pl-6">
                {order.items.map((item) => (
                  <li key={item.id} className="text-sm">
                    {item.productName} × {item.quantity} ({item.price} جنيه) -
                    الإجمالي: {item.total} جنيه
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">المجموع الفرعي</p>
                <p className="font-semibold">{order.subtotal} جنيه</p>
              </div>
              <div>
                <p className="text-muted-foreground">تكلفة الشحن</p>
                <p className="font-semibold">{order.shippingCost} جنيه</p>
              </div>
              <div>
                <p className="text-muted-foreground">الخصم</p>
                <p className="font-semibold">{order.discount} جنيه</p>
              </div>
              <div>
                <p className="text-muted-foreground">المبلغ النهائي</p>
                <p className="font-semibold">{order.finalAmount} جنيه</p>
              </div>
              <div>
                <p className="text-muted-foreground">طريقة الدفع</p>
                <p className="font-semibold">{order.paymentMethod}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
