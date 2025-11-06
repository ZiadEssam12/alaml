import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import prisma from "@/lib/prisma";
import { auth } from "@/auth/auth";
import CustomOrderForm from "./CustomOrderForm";

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

export default async function CustomOrderPage({ searchParams }) {
  const session = await auth();
  if (!session) {
    redirect("/");
  }

  const userId = session.user.id;
  const paramsPage = searchParams?.page;
  const page = Math.max(1, Number(paramsPage || 1));
  const limit = 10;
  const skip = (page - 1) * limit;

  const [customOrders, total] = await Promise.all([
    getUserCustomOrders(userId, skip, limit),
    getUserCustomOrdersCount(userId),
  ]);

  const maxPage = Math.ceil(total / limit);

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

        <div className="mt-12 space-y-6">
          {customOrders.map((order) => (
            <div key={order.id} className="p-4 border rounded-lg shadow-md">
              <h3 className="font-semibold text-lg">{order.productType}</h3>
              <p className="text-sm text-muted-foreground">
                {order.description}
              </p>
              <p className="text-sm text-muted-foreground">
                الحالة: {order.status}
              </p>
              <p className="text-sm text-muted-foreground">
                التاريخ: {new Date(order.createdAt).toLocaleDateString("ar-EG")}
              </p>
            </div>
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
