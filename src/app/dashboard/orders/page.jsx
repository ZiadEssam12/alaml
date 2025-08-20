import React from "react";
import { PaginationClient } from "@/components/Pagination";
import Link from "next/link";

async function getOrders(page = 1, pageSize = 10) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/order?page=${page}&pageSize=${pageSize}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export default async function OrdersPage({ searchParams }) {
  const page = parseInt((await searchParams)?.page || "1", 10);
  const pageSize = 10;
  const { data: orders, pagination } = await getOrders(page, pageSize);
  console.log("orders, pagination", orders, pagination);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">جميع الطلبات</h1>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">رقم الطلب</th>
              <th className="px-4 py-2 border-b">اسم المستخدم</th>
              <th className="px-4 py-2 border-b">البريد الإلكتروني</th>
              <th className="px-4 py-2 border-b">الحالة</th>
              <th className="px-4 py-2 border-b">المبلغ النهائي</th>
              <th className="px-4 py-2 border-b">تاريخ الإنشاء</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  لا توجد طلبات بعد.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="contents"
                >
                  <tr className="hover:bg-muted/50 transition cursor-pointer">
                    <td className="px-4 py-2 border-b">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-2 border-b">
                      {order.user?.name || "-"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {order.user?.email || "-"}
                    </td>
                    <td className="px-4 py-2 border-b">{order.status}</td>
                    <td className="px-4 py-2 border-b">
                      {order.finalAmount} ج.م
                    </td>
                    <td className="px-4 py-2 border-b">
                      {new Date(order.createdAt).toLocaleString("ar-EG")}
                    </td>
                  </tr>
                </Link>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex justify-center">
        <PaginationClient
          maxPage={pagination.maxPage}
          currentPage={pagination.page}
          basePath="/dashboard/orders"
        />
      </div>
    </div>
  );
}
