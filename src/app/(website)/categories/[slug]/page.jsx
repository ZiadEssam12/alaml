import { PaginationClient } from "@/components/Pagination";
import ProductCard from "@/components/ProductCard/ProductCard";
import Link from "next/link";
import React from "react";

export default async function page({ params }) {
  const { slug } = await params;
  console.log("slug :", slug);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/categories/${slug}`
  );
  const data = await res.json();
  const category = data.data;
  const pagination = data.pagination;
  const products = category.products;

  return (
    <>
      <div className="min-h-screen bg-background" dir="rtl">
        <main>
          <div className="">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">
                عرض منتجات قسم{" "}
                <span className="text-primary">{category.name}</span>
              </h1>
              <p className="text-muted-foreground">
                {products.length} منتج متاح
              </p>
            </div>

            <div>
              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-muted rounded-lg shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-muted-foreground mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2a4 4 0 018 0v2M5 11V9a7 7 0 0114 0v2a7 7 0 01-14 0z"
                    />
                  </svg>
                  <h2 className="text-xl font-semibold mb-2">
                    لا توجد منتجات في هذا القسم حالياً
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    يرجى تصفح الأقسام الأخرى أو العودة للصفحة الرئيسية.
                  </p>
                  <div className="flex gap-4">
                    <Link
                      href="/"
                      className="px-6 py-2 rounded-md bg-primary text-white font-medium shadow hover:bg-primary/90 transition"
                    >
                      الصفحة الرئيسية
                    </Link>
                    <Link
                      href="/products"
                      className="px-6 py-2 rounded-md border border-primary text-primary font-medium shadow hover:bg-primary hover:text-white transition"
                    >
                      كل المنتجات
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 lg:gap-x-6 gap-y-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  <PaginationClient maxPage={pagination.maxPage} />
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
