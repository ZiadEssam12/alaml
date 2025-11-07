import { PaginationClient } from "@/components/Pagination";
import ProductCard from "@/components/ProductCard/ProductCard";
import Link from "next/link";
import React from "react";
import SortingForm from "@/components/SortingForm";
import {
  getCategoryDetails,
  getAllActiveCategorySlugs,
} from "@/lib/api/shop/categoryAPI";
import { cache } from "react";
import {
  generateOrganizationSchema,
  generateCategoryPageSchema,
  generateCategoryPageBreadcrumbSchema,
} from "@/lib/schemas/productSchemas";

// Cache category data fetch to prevent duplicate calls
const getCachedCategoryDetails = cache(async (slug) => {
  return await getCategoryDetails(slug);
});

// Generate static params for all active categories
export async function generateStaticParams() {
  try {
    const categories = await getAllActiveCategorySlugs();

    return categories.map((category) => ({
      slug: category.seoTitle,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const { category } = await getCachedCategoryDetails(slug);

    if (!category) {
      return {
        title: "القسم غير موجود | مكتبة الأمل",
        description: "القسم الذي تبحث عنه غير موجود",
      };
    }

    return {
      title: `${category.name} | مكتبة الأمل`,
      description:
        category.description ||
        `تصفح جميع منتجات قسم ${category.name} من الأدوات المكتبية والقرطاسية`,
      keywords: [
        category.name,
        "منتجات",
        "قرطاسية",
        "أدوات مكتبية",
        "متجر إلكتروني",
        "مكتبة الأمل",
      ].join(", "),
      robots: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
      openGraph: {
        title: `${category.name} | مكتبة الأمل`,
        description:
          category.description || `اكتشف جميع منتجات قسم ${category.name}`,
        type: "website",
        url: `https://alaml-theta.vercel.app/categories/${category.seoTitle}`,
        siteName: "مكتبة الأمل",
        locale: "ar_EG",
        images: [
          {
            url:
              category.imageUrl ||
              "https://alaml-theta.vercel.app/og-category.jpg",
            width: 1200,
            height: 630,
            alt: category.name,
            type: "image/jpeg",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${category.name} | مكتبة الأمل`,
        description: category.description || `منتجات قسم ${category.name}`,
        images: [
          category.imageUrl || "https://alaml-theta.vercel.app/og-category.jpg",
        ],
        creator: "@alaml_store",
        site: "@alaml_store",
      },
      alternates: {
        canonical: `https://alaml-theta.vercel.app/categories/${category.seoTitle}`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "مكتبة الأمل",
      description: "متجر القرطاسية الإلكتروني",
    };
  }
}

export default async function page({ params, searchParams }) {
  const { slug } = await params;
  const params_obj = await searchParams;
  const page = Math.max(1, Number(params_obj?.page || 1));

  const { category, pagination, products } = await getCachedCategoryDetails(
    slug,
    page
  );

  // Generate JSON-LD schemas
  const organizationSchema = generateOrganizationSchema();
  const categoryPageSchema = generateCategoryPageSchema(category, products);
  const breadcrumbSchema = generateCategoryPageBreadcrumbSchema(category);

  const currentSort = null; // No sort by default
  const currentFilters = null; // No filters by default

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(categoryPageSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
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
            <SortingForm
              currentSort={currentSort}
              currentFilters={currentFilters}
            />
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
                  {pagination.maxPage > 1 && (
                    <PaginationClient
                      maxPage={pagination.maxPage}
                      currentPage={page}
                      basePath={`/categories/${slug}`}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
