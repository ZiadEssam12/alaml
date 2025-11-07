import { CartItems } from "@/components/cart/CartItems";
import { CartSummary } from "@/components/cart/CartSummary";
import { getUserTokenFromHeaders } from "@/lib/auth-helpers";
import Link from "next/link";
import React from "react";
import { generateWebSiteSchema } from "@/lib/schemas/productSchemas";
import { auth } from "@/auth/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata() {
  return {
    title: "سلة التسوق | مكتبة الأمل",
    description:
      "عرض ومراجعة منتجات سلة التسوق الخاصة بك قبل الشراء. إضافة أو حذف المنتجات وتطبيق الكوبونات بسهولة.",
    keywords: "سلة التسوق, الشراء, منتجات, كوبونات, خصومات, مكتبة الأمل",
    robots: {
      index: false, // Don't index shopping carts for privacy
      follow: true,
    },
    openGraph: {
      title: "سلة التسوق | مكتبة الأمل",
      description: "عرض ومراجعة منتجات سلة التسوق الخاصة بك",
      type: "website",
      url: "https://alaml-theta.vercel.app/cart",
      siteName: "مكتبة الأمل",
      locale: "ar_EG",
      images: [
        {
          url: "https://alaml-theta.vercel.app/og-image.png",
          width: 1200,
          height: 630,
          alt: "سلة التسوق - مكتبة الأمل",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "سلة التسوق | مكتبة الأمل",
      description: "عرض ومراجعة منتجات سلة التسوق الخاصة بك",
      creator: "@alaml_store",
      site: "@alaml_store",
    },
    alternates: {
      canonical: "https://alaml-theta.vercel.app/cart",
    },
  };
}

export default async function CartPage() {
  const session = await auth();

  // Get cart items directly from session (faster)
  const items = session?.cart?.items ?? [];

  // Generate JSON-LD schemas
  const websiteSchema = generateWebSiteSchema();
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "الرئيسية",
        item: "https://alaml-theta.vercel.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "سلة التسوق",
        item: "https://alaml-theta.vercel.app/cart",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">سلة التسوق</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground mb-4">
              سلة التسوق فارغة
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CartItems />
            </div>
            <div className="lg:col-span-1">
              <CartSummary showCouponField={true} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
