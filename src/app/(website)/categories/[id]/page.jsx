import { PaginationClient } from "@/components/Pagination";
import ProductCard from "@/components/ProductCard/ProductCard";
import React from "react";

// Dummy fetch function, replace with your actual data fetching logic
async function getCategoryById(id) {
  // Example: fetch from your DB or API
  // return await fetch(`/api/categories/${id}`).then(res => res.json());
  return { id, name: "القرطاسية" }; // Replace with real fetch
}

export default async function page({ params }) {
  const { id } = await params;
  const category = await getCategoryById(id);

  // You should also fetch products for this category here
  // const products = await getProductsByCategory(id);

  // Dummy products for demonstration
  const filteredProducts = [
    { id: 1, name: "دفتر" },
    { id: 2, name: "قلم" },
    { id: 3, name: "قلم" },
    { id: 4, name: "قلم" },
    { id: 5, name: "قلم" },
    { id: 6, name: "قلم" },
    { id: 7, name: "قلم" },
    { id: 8, name: "قلم" },
    // ...etc
  ];

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
                {filteredProducts.length} منتج متاح
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <PaginationClient maxPage={5} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
