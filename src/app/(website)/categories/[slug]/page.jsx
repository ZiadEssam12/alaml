import { PaginationClient } from "@/components/Pagination";
import ProductCard from "@/components/ProductCard/ProductCard";
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
        <main className="container mx-auto px-4 py-8">
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

            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <PaginationClient maxPage={pagination.maxPage} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
