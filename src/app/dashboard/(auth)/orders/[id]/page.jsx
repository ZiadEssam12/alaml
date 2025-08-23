import React from "react";
import { notFound } from "next/navigation";
import OrderStatusDropdown from "./OrderStatusDropdown";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
async function getOrder(id) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/order/${id}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  const { data } = await res.json();
  return data;
}

export default async function OrderDetailsPage({ params }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) return notFound();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">لوحة التحكم</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/orders">الطلبات</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/dashboard/orders/${id}`}>تفاصيل الطلب</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <h1 className="text-2xl font-bold mb-6">تفاصيل الطلب</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="mb-2">
              <span className="font-semibold">رقم الطلب:</span> {order.id}
            </div>
            <div className="mb-2">
              <span className="font-semibold">اسم المستخدم:</span>{" "}
              {order.customerName || "-"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">البريد الإلكتروني:</span>{" "}
              {order.customerEmail || "-"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">الهاتف:</span>{" "}
              {order.customerPhone}
            </div>
            <div className="mb-2">
              <span className="font-semibold">العنوان:</span>{" "}
              {order.shippingStreet}, {order.shippingCity}{" "}
              {order.shippingZipCode || ""}
            </div>
            <div className="mb-2">
              <span className="font-semibold">طريقة الدفع:</span>{" "}
              {order.paymentMethod}
            </div>
            <div className="mb-2">
              <span className="font-semibold">تاريخ الإنشاء:</span>{" "}
              {new Date(order.createdAt).toLocaleString("ar-EG")}
            </div>
          </div>
          <div>
            <div className="mb-2">
              <span className="font-semibold">الحالة:</span>{" "}
              <OrderStatusDropdown
                orderId={order.id}
                currentStatus={order.status}
              />
            </div>
            <div className="mb-2">
              <span className="font-semibold">المبلغ النهائي:</span>{" "}
              {order.finalAmount} ج.م
            </div>
            <div className="mb-2">
              <span className="font-semibold">الخصم:</span> {order.discount} ج.م
            </div>
            <div className="mb-2">
              <span className="font-semibold">تكلفة الشحن:</span>{" "}
              {order.shippingCost} ج.م
            </div>
            <div className="mb-2">
              <span className="font-semibold">ملاحظات:</span>{" "}
              {order.notes || "-"}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4">عناصر الطلب</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">اسم المنتج</th>
                <th className="px-4 py-2 border-b">الكمية</th>
                <th className="px-4 py-2 border-b">السعر</th>
                <th className="px-4 py-2 border-b">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 border-b">{item.productName}</td>
                  <td className="px-4 py-2 border-b">{item.quantity}</td>
                  <td className="px-4 py-2 border-b">{item.price} ج.م</td>
                  <td className="px-4 py-2 border-b">{item.total} ج.م</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
