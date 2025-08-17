import { ProductFilters } from "@/components/Filter";
import { PaginationClient } from "@/components/Pagination";
import ProductCard from "@/components/ProductCard/ProductCard";
import React from "react";

export default async function Page({ searchParams }) {
  // Extract filters and pagination from searchParams
  const {
    categoryID = "",
    minPrice = "",
    maxPrice = "",
    inStock = "",
    page = "1",
  } = (await searchParams) || {};

  // Build query string for API
  const params = new URLSearchParams();
  if (categoryID) params.append("categoryID", categoryID);
  if (minPrice) params.append("minPrice", minPrice);
  if (maxPrice) params.append("maxPrice", maxPrice);
  if (inStock) params.append("inStock", inStock);
  if (page) params.append("page", page);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/product?${params.toString()}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  const products = data.data;
  const { maxPage: totalPages } = data.pagination;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4">
            <ProductFilters
              currentFilters={{ categoryID, minPrice, maxPrice, inStock }}
            />
          </aside>
          <div className="lg:w-3/4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">جميع المنتجات</h1>
              <p className="text-muted-foreground">
                {products.length} منتج متاح
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <PaginationClient maxPage={totalPages} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
