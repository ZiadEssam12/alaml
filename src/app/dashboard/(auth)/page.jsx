import { auth } from "@/auth/auth";
import { cookies } from "next/headers";
import {
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  Check,
  Hourglass,
  X,
} from "lucide-react";

async function getDashboardData() {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("authjs.session-token")?.value ||
      cookieStore.get("__Secure-authjs.session-token")?.value;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/stats`,
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch dashboard data");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      revenue: 0,
      users: 0,
      products: 0,
      categories: 0,
      lastOrders: [],
    };
  }
}

export default async function Page() {
  const dashboardData = await getDashboardData();

  return (
    <main className="container">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4! pb-0!">
        {/* Total Orders */}
        <div className="h-fit border border-accent px-4 py-5 flex flex-col-reverse md:flex-row items-center justify-between gap-3 rounded-lg">
          <div className="flex flex-col items-center lg:items-start">
            <p>إجمالي الطلبات</p>
            <div className="flex items-center gap-1">
              <p>{dashboardData.totalOrders}</p>
            </div>
          </div>
          <div className="p-2 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <ShoppingCart width={24} height={24} />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="h-fit border border-accent px-4 py-5 flex flex-col-reverse md:flex-row items-center justify-between gap-3 rounded-lg">
          <div className="flex flex-col items-center lg:items-start">
            <p>الطلبات المعلقة</p>
            <div className="flex items-center gap-1">
              <p>{dashboardData.pendingOrders}</p>
            </div>
          </div>
          <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
            <Hourglass width={24} height={24} />
          </div>
        </div>

        {/* Completed Orders */}
        <div className="h-fit border border-accent px-4 py-5 flex flex-col-reverse md:flex-row items-center justify-between gap-3 rounded-lg">
          <div className="flex flex-col items-center lg:items-start">
            <p>الطلبات المكتملة</p>
            <div className="flex items-center gap-1">
              <p>{dashboardData.completedOrders}</p>
            </div>
          </div>
          <div className="p-2 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <Check width={24} height={24} />
          </div>
        </div>

        {/* Cancelled Orders */}
        <div className="h-fit border border-accent px-4 py-5 flex flex-col-reverse md:flex-row items-center justify-between gap-3 rounded-lg">
          <div className="flex flex-col items-center lg:items-start">
            <p>الطلبات الملغاة</p>
            <div className="flex items-center gap-1">
              <p>{dashboardData.cancelledOrders}</p>
            </div>
          </div>
          <div className="p-2 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <X width={24} height={24} />
          </div>
        </div>

        {/* Revenue */}
        <div className="h-fit border border-accent px-4 py-5 flex flex-col-reverse md:flex-row items-center justify-between gap-3 rounded-lg">
          <div className="flex flex-col items-center lg:items-start">
            <p>إجمالي الإيرادات</p>
            <div className="flex items-center gap-1">
              <p>{dashboardData.revenue ?? 0} جنيه</p>
            </div>
          </div>
          <div className="p-2 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <DollarSign width={24} height={24} />
          </div>
        </div>

        {/* Total Users */}
        <div className="h-fit border border-accent px-4 py-5 flex flex-col-reverse md:flex-row items-center justify-between gap-3 rounded-lg">
          <div className="flex flex-col items-center lg:items-start">
            <p>المستخدمين</p>
            <div className="flex items-center gap-1">
              <p>{dashboardData.users}</p>
            </div>
          </div>
          <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
            <Users width={24} height={24} />
          </div>
        </div>

        {/* Total Products */}
        <div className="h-fit border border-accent px-4 py-5 flex flex-col-reverse md:flex-row items-center justify-between gap-3 rounded-lg">
          <div className="flex flex-col items-center lg:items-start">
            <p>إجمالي المنتجات</p>
            <div className="flex items-center gap-1">
              <p>{dashboardData.products}</p>
            </div>
          </div>
          <div className="p-2 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
            <Package width={24} height={24} />
          </div>
        </div>

        {/* Total Categories */}
        <div className="h-fit border border-accent px-4 py-5 flex flex-col-reverse md:flex-row items-center justify-between gap-3 rounded-lg">
          <div className="flex flex-col items-center lg:items-start">
            <p>إجمالي الأقسام</p>
            <div className="flex items-center gap-1">
              <p>{dashboardData.categories}</p>
            </div>
          </div>
          <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Package width={24} height={24} />
          </div>
        </div>
      </section>

      <section className="bg-white p-6 my-0! rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">آخر الطلبات</h2>
        {dashboardData.lastOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد طلبات بعد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full max-w-screen bg-white border border-gray-200 rounded-lg text-center">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2">رقم الطلب</th>
                  <th className="px-4 py-2">اسم العميل</th>
                  <th className="px-4 py-2">الإجمالي</th>
                  <th className="px-4 py-2">الحالة</th>
                  <th className="px-4 py-2">تاريخ الطلب</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.lastOrders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="px-4 py-2">{order.id.slice(0, 8)}...</td>
                    <td className="px-4 py-2">{order.customerName}</td>
                    <td className="px-4 py-2">{order.total} جنيه</td>
                    <td className="px-4 py-2 min-w-fit capitalize">
                      {order.status === "pending" && (
                        <span className="inline-block rounded-full p-3 text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                          قيد الانتظار
                        </span>
                      )}
                      {order.status === "processing" && (
                        <span className="inline-block rounded-full p-3 text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          قيد المعالجة
                        </span>
                      )}
                      {order.status === "shipped" && (
                        <span className="inline-block rounded-full p-3 text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          تم الشحن
                        </span>
                      )}
                      {order.status === "delivered" && (
                        <span className="inline-block rounded-full p-3 text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          تم التسليم
                        </span>
                      )}
                      {order.status === "cancelled" && (
                        <span className="inline-block rounded-full p-3 text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          ملغي
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">{order.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
