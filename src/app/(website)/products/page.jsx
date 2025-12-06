import { ProductFilters } from "@/components/Filter";
import { PaginationClient } from "@/components/Pagination";
import ProductCard from "@/components/ProductCard/ProductCard";
import SortingForm from "@/components/SortingForm";
import { getProducts } from "@/lib/api/shop/productAPI";
import {
  generateOrganizationSchema,
  generateProductsPageBreadcrumbSchema,
  generateCollectionPageSchema,
} from "@/lib/schemas/productSchemas";
import { cache } from "react";

// Cache products fetch to prevent duplicate calls
const getCachedProducts = cache(async (filters) => {
  return await getProducts(filters);
});

export const metadata = {
  title: "جميع المنتجات | مكتبة الأمل - أدوات مكتبية وأدوات مكتبية",
  description:
    "تصفح آلاف المنتجات من الأدوات المكتبية  الإلكترونية بأفضل الأسعار. اكتشف مجموعة واسعة من أقلام، دفاتر، ملفات وأكثر. توصيل سريع وآمن.",
  keywords:
    "منتجات أدوات مكتبية، أدوات مكتبية، متجر إلكتروني، أقلام، دفاتر، ملفات، مكتبة الأمل، شراء أدوات مكتبية أونلاين",
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
  openGraph: {
    title: "جميع المنتجات | مكتبة الأمل",
    description: "اكتشف مجموعة واسعة من الأدوات المكتبية  بأفضل الأسعار",
    type: "website",
    url: "https://alaml-theta.vercel.app/products",
    siteName: "مكتبة الأمل",
    locale: "ar_EG",
    images: [
      {
        url: "https://alaml-theta.vercel.app/og-products.jpg",
        width: 1200,
        height: 630,
        alt: "جميع المنتجات - مكتبة الأمل",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "جميع المنتجات | مكتبة الأمل",
    description: "اكتشف مجموعة واسعة من الأدوات المكتبية ",
    images: ["https://alaml-theta.vercel.app/og-products.jpg"],
    creator: "@alaml_store",
    site: "@alaml_store",
  },
  alternates: {
    canonical: "https://alaml-theta.vercel.app/products",
  },
};

export default async function Page({ searchParams }) {
  const {
    categories = [],
    minPrice = "",
    maxPrice = "",
    inStock = "",
    page = "1",
    q = "",
    sort = "new-to-old",
    rating = "",
  } = (await searchParams) || {};

  const { products, totalPages } = await getCachedProducts({
    categories,
    minPrice,
    maxPrice,
    inStock,
    page,
    q,
    sort,
    rating,
  });

  // Generate JSON-LD schemas
  const organizationSchema = generateOrganizationSchema();
  const breadcrumbSchema = generateProductsPageBreadcrumbSchema();
  const collectionPageSchema = generateCollectionPageSchema(
    products,
    products.length * totalPages
  );

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageSchema),
        }}
      />
      <main>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4">
            <ProductFilters
              currentFilters={{ categories, minPrice, maxPrice, inStock }}
            />
          </aside>
          <div className="lg:w-3/4">
            <div className="mb-6">
              {q.length > 0 ? (
                <p className="text-muted-foreground mb-2">
                  نتائج البحث عن: <span className="font-medium">{q}</span>
                </p>
              ) : (
                <>
                  <h1 className="text-2xl font-bold mb-2">جميع المنتجات</h1>
                </>
              )}
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
