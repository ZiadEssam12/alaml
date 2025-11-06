import React from "react";
import { redirect } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import CustomOrderForm from "./CustomOrderForm";
import DeleteOrderButton from "./DeleteOrderButton";

export const metadata = {
  title: "طلباتي المخصصة | مكتبة الأمل",
  description: "عرض وإدارة الطلبات المخصصة الخاصة بك في مكتبة الأمل.",
};

async function getUserCustomOrders(userId, skip, take) {
  return await prisma.customOrder.findMany({
    where: { userId },
    skip,
    take,
    orderBy: { createdAt: "desc" },
  });
}

async function getUserCustomOrdersCount(userId) {
  return await prisma.customOrder.count({
    where: { userId },
  });
}

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

export default async function CustomOrderPage({ searchParams }) {
  const session = await auth();
  if (!session) {
    redirect("/");
  }

  const userId = session.user.id;
  const params = await searchParams;
  const paramsPage = params?.page;
  const page = Math.max(1, Number(paramsPage || 1));
  const limit = 10;
  const skip = (page - 1) * limit;

  const [customOrders, total] = await Promise.all([
    getUserCustomOrders(userId, skip, limit),
    getUserCustomOrdersCount(userId),
  ]);

  const maxPage = Math.ceil(total / limit);

  // No custom orders case
  if (customOrders.length === 0) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-4">طلباتي المخصصة</h1>
              <p className="text-muted-foreground text-lg">
                عرض وإدارة جميع الطلبات المخصصة الخاصة بك.
              </p>
            </div>
          </div>

          <CustomOrderForm />

          <Card className="text-center border-0 shadow-transparent h-96 flex items-center justify-center mt-12">
            <CardContent>
              <div className="text-4xl mb-4">📋</div>
              <h2 className="text-lg font-semibold mb-2 text-muted-foreground">
                لا توجد طلبات مخصصة
              </h2>
              <p className="text-muted-foreground">
                لم تقم بإنشاء أي طلبات مخصصة حتى الآن. انقر على الزر أعلاه
                لإنشاء طلب جديد.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-4">طلباتي المخصصة</h1>
            <p className="text-muted-foreground text-lg">
              إدارة جميع طلباتك المخصصة - إجمالي: {total}
            </p>
          </div>
        </div>

        <CustomOrderForm />

        <div className="mt-12 space-y-6">
          {customOrders.map((order) => (
            <Card key={order.id} className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{order.productType}</CardTitle>
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
                    <p className="text-muted-foreground text-sm">الوصف</p>
                    <p className="font-semibold text-sm">{order.description}</p>
                  </div>
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
                  <div>
                    <p className="text-muted-foreground text-sm">الرابط</p>
                    <a
                      href={order.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all text-sm"
                    >
                      {order.url}
                    </a>
                  </div>
                )}

                <DeleteOrderButton orderId={order.id} status={order.status} />
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
