import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import prisma from "@/lib/prisma";
import { cache } from "react";

// Cache custom orders fetch
const getCachedCustomOrders = cache(async (skip, take) => {
  return await prisma.customOrder.findMany({
    skip,
    take,
    orderBy: { createdAt: "desc" },
  });
});

const getCachedCustomOrdersCount = cache(async () => {
  return await prisma.customOrder.count();
});

export const metadata = {
  title: "الطلبات المخصصة | لوحة التحكم",
  description: "إدارة الطلبات المخصصة من العملاء",
};

const statusBadgeVariant = (status) => {
  switch (status) {
    case "done":
      return "default";
    case "refused":
      return "destructive";
    case "in_progress":
      return "secondary";
    default:
      return "outline";
  }
};

const statusLabel = (status) => {
  switch (status) {
    case "done":
      return "مكتمل";
    case "refused":
      return "مرفوض";
    case "in_progress":
      return "قيد التنفيذ";
    default:
      return status;
  }
};

export default async function CustomOrdersPage({ searchParams }) {
  const paramsPage = (await searchParams).page;

  const page = Math.max(1, Number(paramsPage || 1));
  const limit = 10;
  const skip = (page - 1) * limit;

  const [customOrders, total] = await Promise.all([
    getCachedCustomOrders(skip, limit),
    getCachedCustomOrdersCount(),
  ]);

  const maxPage = Math.ceil(total / limit);

  // No custom orders case
  if (customOrders.length === 0) {
    return (
      <Card className="text-center border-0 shadow-transparent h-screen flex items-center justify-center">
        <CardContent>
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2 text-muted-foreground">
            لا توجد طلبات مخصصة
          </h2>
          <p className="text-muted-foreground">
            لم يتم استقبال أي طلبات مخصصة حتى الآن
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">الطلبات المخصصة</h1>
          <p className="text-muted-foreground">
            إدارة جميع طلبات العملاء المخصصة - إجمالي: {total}
          </p>
        </div>

        <div className="space-y-6">
          {customOrders.map((order) => (
            <Card key={order.id} className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    طلب من: {order.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    ID: {order.id}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant={statusBadgeVariant(order.status)}>
                    {statusLabel(order.status)}
                  </Badge>
                  <Badge variant="outline">
                    {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-muted-foreground text-sm">الاسم</p>
                    <p className="font-semibold">{order.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      البريد الإلكتروني
                    </p>
                    <p className="font-semibold">
                      <a
                        href={`mailto:${order.email}`}
                        className="text-primary hover:underline"
                      >
                        {order.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">رقم الهاتف</p>
                    <p className="font-semibold">
                      <a
                        href={`tel:${order.phone}`}
                        className="text-primary hover:underline"
                      >
                        {order.phone}
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">نوع المنتج</p>
                    <p className="font-semibold">{order.productType}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-muted-foreground text-sm">الوصف</p>
                  <p className="font-semibold text-sm bg-gray-50 p-3 rounded mt-1">
                    {order.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-muted-foreground text-sm">الكمية</p>
                    <p className="font-semibold">{order.quantity || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">الميزانية</p>
                    <p className="font-semibold">
                      {order.budget ? `${order.budget} جنيه` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">التاريخ</p>
                    <p className="font-semibold">
                      {new Date(order.createdAt).toLocaleString("ar-EG")}
                    </p>
                  </div>
                </div>

                {order.url && (
                  <div className="mb-4">
                    <p className="text-muted-foreground text-sm">الرابط</p>
                    <p className="font-semibold">
                      <a
                        href={order.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all"
                      >
                        {order.url}
                      </a>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {maxPage > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={`?page=${Math.max(1, page - 1)}`}
                    className={
                      page === 1
                        ? "opacity-50 cursor-not-allowed pointer-events-none"
                        : ""
                    }
                    aria-disabled={page === 1}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4 py-2">
                    الصفحة {page} من {maxPage}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href={`?page=${Math.min(maxPage, page + 1)}`}
                    className={
                      page === maxPage
                        ? "opacity-50 cursor-not-allowed pointer-events-none"
                        : ""
                    }
                    aria-disabled={page === maxPage}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
    </div>
  );
}
