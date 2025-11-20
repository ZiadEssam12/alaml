import { CartPageContent } from "@/components/cart/CartPageContent";
import { generateWebSiteSchema } from "@/lib/schemas/productSchemas";

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

export default function CartPage() {
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

      <CartPageContent />
    </div>
  );
}
