import { ProductFilters } from "@/components/Filter";
import { PaginationClient } from "@/components/Pagination";
import ProductCard from "@/components/ProductCard/ProductCard";
import SortingForm from "@/components/SortingForm";
import { getProducts } from "@/lib/api/shop/productAPI";

export default async function Page({ searchParams }) {
  const {
    categories = [],
    minPrice = "",
    maxPrice = "",
    inStock = "",
    page = "1",
    q = "",
    sort = "new-to-old",
  } = (await searchParams) || {};

  const { products, totalPages } = await getProducts({
    categories,
    minPrice,
    maxPrice,
    inStock,
    page,
    q,
    sort,
  });

  console.log("Products:", products);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <main>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4">
            <ProductFilters
              currentFilters={{ categories, minPrice, maxPrice, inStock }}
            />
          </aside>
          <div className="lg:w-3/4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">جميع المنتجات</h1>
              <p className="text-muted-foreground">
                {products.length} منتج متاح
              </p>
            </div>
            <SortingForm
              currentSort={sort}
              currentFilters={{ categories, minPrice, maxPrice, inStock, q }}
            />
            {products.length === 0 ? (
              <div className="text-center">
                <p className="text-lg font-medium mb-4">
                  لا توجد منتجات متاحة حالياً
                </p>
                <p className="text-muted-foreground mb-6">
                  لا توجد منتجات تطابق نتائج التصفية
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <PaginationClient maxPage={totalPages} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
