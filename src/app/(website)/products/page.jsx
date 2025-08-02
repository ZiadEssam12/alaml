import { ProductFilters } from "@/components/Filter";
import { PaginationClient } from "@/components/Pagination";
import ProductCard from "@/components/ProductCard/ProductCard";
import React from "react";

export default function page() {
  const filteredProducts = [];
  const products = [];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4">
            <ProductFilters products={products} />
          </aside>
          <div className="lg:w-3/4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">جميع المنتجات</h1>
              <p className="text-muted-foreground">
                {filteredProducts.length} منتج متاح
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}

                {new Array(9).fill(null).map((_, index) => (
                  <ProductCard
                    key={index}
                    product={{ id: index, name: `Product ${index + 1}` }}
                  />
                ))}
              </div>

              <PaginationClient maxPage={5} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
