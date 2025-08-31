import { auth } from "@/auth/auth";
import { ShoppingCart, Package, DollarSign, Users } from "lucide-react";

const dashboardData = {
  totalOrders: 120,
  pendingOrders: 15,
  completedOrders: 95,
  cancelledOrders: 10,
  revenue: 50000,
  users: 200,
  products: 50,
  categories: 10,
  lastOrders: [
    {
      id: "1",
      customerName: "John Doe",
      total: 150,
      status: "delivered",
      createdAt: "2025-08-30",
    },
    {
      id: "2",
      customerName: "Jane Smith",
      total: 200,
      status: "shipped",
      createdAt: "2025-08-29",
    },
    {
      id: "3",
      customerName: "Alice Johnson",
      total: 300,
      status: "processing",
      createdAt: "2025-08-28",
    },
    {
      id: "4",
      customerName: "Bob Brown",
      total: 100,
      status: "cancelled",
      createdAt: "2025-08-27",
    },
    {
      id: "5",
      customerName: "Charlie Green",
      total: 250,
      status: "pending",
      createdAt: "2025-08-26",
    },
  ],
};

export default async function Page() {
  const session = await auth();

  return (
    <main className="-mb-10">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 !mt-0 !p-0">
        {/* Total Orders */}
        <div className="h-fit border border-accent px-4 py-5 flex items-center justify-between gap-8 rounded-lg">
          <div className="flex flex-col">
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
        <div className="h-fit border border-accent px-4 py-5 flex items-center justify-between gap-8 rounded-lg">
          <div className="flex flex-col">
            <p>الطلبات المعلقة</p>
            <div className="flex items-center gap-1">
              <p>{dashboardData.pendingOrders}</p>
            </div>
          </div>
          <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
            <ShoppingCart width={24} height={24} />
          </div>
        </div>

        {/* Completed Orders */}
        <div className="h-fit border border-accent px-4 py-5 flex items-center justify-between gap-8 rounded-lg">
          <div className="flex flex-col">
            <p>الطلبات المكتملة</p>
            <div className="flex items-center gap-1">
              <p>{dashboardData.completedOrders}</p>
            </div>
          </div>
          <div className="p-2 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <ShoppingCart width={24} height={24} />
          </div>
        </div>

        {/* Cancelled Orders */}
        <div className="h-fit border border-accent px-4 py-5 flex items-center justify-between gap-8 rounded-lg">
          <div className="flex flex-col">
            <p>الطلبات الملغاة</p>
            <div className="flex items-center gap-1">
              <p>{dashboardData.cancelledOrders}</p>
            </div>
          </div>
          <div className="p-2 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <ShoppingCart width={24} height={24} />
          </div>
        </div>

        {/* Revenue */}
        <div className="h-fit border border-accent px-4 py-5 flex items-center justify-between gap-8 rounded-lg">
          <div className="flex flex-col">
            <p>إجمالي الإيرادات</p>
            <div className="flex items-center gap-1">
              <p>{dashboardData.revenue} جنيه</p>
            </div>
          </div>
          <div className="p-2 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <DollarSign width={24} height={24} />
          </div>
        </div>

        {/* Total Users */}
        <div className="h-fit border border-accent px-4 py-5 flex items-center justify-between gap-8 rounded-lg">
          <div className="flex flex-col">
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
        <div className="h-fit border border-accent px-4 py-5 flex items-center justify-between gap-8 rounded-lg">
          <div className="flex flex-col">
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
        <div className="h-fit border border-accent px-4 py-5 flex items-center justify-between gap-8 rounded-lg">
          <div className="flex flex-col">
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

      <section className="bg-white p-6 !my-0 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">آخر الطلبات</h2>
        <table className="min-w-full bg-white border border-gray-200 rounded-lg text-center">
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
                <td className="px-4 py-2">{order.id}</td>
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
      </section>
    </main>
  );
}
