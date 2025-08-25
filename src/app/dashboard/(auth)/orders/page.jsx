import { cookies } from "next/headers";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PaginationClient } from "@/components/Pagination";
import SearchBox from "@/components/dashbaord/SearchBox";

async function getOrders(page = 1, pageSize = 10, q = "") {
  const params = new URLSearchParams({ page, pageSize });
  const cookieStore = await cookies();
  const token =
    cookieStore.get("authjs.session-token")?.value ||
    cookieStore.get("__Secure-authjs.session-token")?.value;

  if (q) params.set("q", q);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/order?${params.toString()}`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export default async function OrdersPage({ searchParams }) {
  const page = parseInt((await searchParams)?.page || "1", 10);
  const pageSize = 10;
  const q = (await searchParams)?.q || "";
  const { data: orders, pagination } = await getOrders(page, pageSize, q);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">جميع الطلبات</h1>
      <SearchBox placeholder={"بحث بالاسم أو البريد أو رقم الطلب..."} />
      {/* Status legend */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <span className="font-semibold">دلالة ألوان الحالات:</span>
        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          قيد الانتظار
        </span>
        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          قيد المعالجة
        </span>
        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
          تم الشحن
        </span>
        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          تم التسليم
        </span>
        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          ملغي
        </span>
      </div>
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
              <th className="px-4 py-2 border-b">تفاصيل</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  لا توجد طلبات بعد.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50 transition">
                  <td className="px-4 py-2 border-b">
                    {order.id.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-2 border-b">
                    {order.customerName || "-"}
                  </td>
                  <td className="px-4 py-2 border-b lowercase">
                    {order.customerEmail || "-"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {order.status === "pending" && (
                      <span className="inline-block rounded-full p-3  text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200" />
                    )}
                    {order.status === "processing" && (
                      <span className="inline-block rounded-full p-3  text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200" />
                    )}
                    {order.status === "shipped" && (
                      <span className="inline-block rounded-full p-3  text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200" />
                    )}
                    {order.status === "delivered" && (
                      <span className="inline-block rounded-full p-3  text-xs font-medium bg-green-100 text-green-800 border border-green-200" />
                    )}
                    {order.status === "cancelled" && (
                      <span className="inline-block rounded-full p-3  text-xs font-medium bg-red-100 text-red-800 border border-red-200" />
                    )}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {order.finalAmount} ج.م
                  </td>
                  <td className="px-4 py-2 border-b">
                    {new Date(order.createdAt).toLocaleString("ar-EG")}
                  </td>
                  <td className="px-4 py-2 border-b text-center">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="inline-flex items-center justify-center p-2 rounded hover:bg-primary/10 transition"
                      title="عرض التفاصيل"
                    >
                      <ArrowLeft
                        className="text-primary"
                        width={16}
                        height={16}
                      />
                    </Link>
                  </td>
                </tr>
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
