import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Package } from "lucide-react";

export default function OrdersPage({}) {
  const orders = [];
  const page = 1;
  const maxPage = 1;
  const onPageChange = () => {};

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">جميع الطلبات</h1>
        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2 text-muted-foreground">
                لا توجد طلبات حتى الآن
              </h2>
              <p className="text-muted-foreground">
                سيتم عرض الطلبات هنا عند إجرائها.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id}>
                <a href={`/order/${order.id}`} className="block">
                  <Card className="shadow-sm cursor-pointer hover:ring-2 hover:ring-primary transition">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">
                        طلب رقم #{order.id}
                      </CardTitle>
                      <Badge
                        variant={
                          order.status === "delivered" ? "default" : "secondary"
                        }
                      >
                        {order.status === "delivered"
                          ? "تم التوصيل"
                          : order.status === "pending"
                          ? "قيد الانتظار"
                          : order.status}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div>
                          <p className="text-muted-foreground">اسم العميل</p>
                          <p className="font-semibold">{order.customerName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            البريد الإلكتروني
                          </p>
                          <p className="font-semibold">{order.customerEmail}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div>
                          <p className="text-muted-foreground">تاريخ الطلب</p>
                          <p className="font-semibold">{order.createdAt}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            المبلغ الإجمالي
                          </p>
                          <p className="font-semibold">
                            {order.finalAmount} جنيه
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-muted-foreground mb-1">المنتجات:</p>
                        <ul className="list-disc pl-6">
                          {order.items.map((item) => (
                            <li key={item.id} className="text-sm">
                              {item.productName} × {item.quantity} ({item.price}{" "}
                              جنيه)
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </div>
            ))}
            <div className="flex justify-center mt-8">
              <Pagination
                page={page}
                maxPage={maxPage}
                onPageChange={onPageChange}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
