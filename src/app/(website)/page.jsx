import ProductsList from "@/components/Home/productsList";
import Hero from "../../components/Home/Hero";
import Categories from "@/components/Home/Categories";
import { HeadphonesIcon } from "lucide-react";
import { getHomeData } from "@/lib/api/shop/homeAPI";
import { cache } from "react";
import {
  generateLocalBusinessSchema,
  generateWebSiteSchema,
  generateFAQSchema,
  generateHomePageBreadcrumbSchema,
} from "@/lib/schemas/productSchemas";

// Cache home data fetch to prevent duplicate calls
const getCachedHomeData = cache(async () => {
  return await getHomeData();
});

// Generate static params for home page (static route, no dynamic params)
export async function generateStaticParams() {
  return [{}]; // Home page has no dynamic parameters, just one static page
}

export const revalidate = 3600; // Revalidate every hour (ISR)

export const metadata = {
  title: "مكتبة الأمل ابشواي | أدوات مكتبية",
  description:
    "اكتشف مكتبة الأمل، متجرك الإلكتروني الأول للأدوات المكتبية في ابشواي. توفر آلاف المنتجات الأصلية بأفضل الأسعار مع شحن مجاني وخدمة عملاء 24/7.",
  keywords:
    "أدوات مكتبية، أقلام، دفاتر، ملفات، متجر إلكتروني، شراء أونلاين، مكتبة الأمل، أدوات مكتب، منتجات مكتبية",
  authors: [{ name: "مكتبة الأمل" }],
  creator: "مكتبة الأمل",
  publisher: "مكتبة الأمل",
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
  openGraph: {
    title: "مكتبة الأمل ابشواي | أدوات مكتبية",
    description:
      "متجر إلكتروني متخصص في بيع الأدوات المكتبية بأفضل الأسعار في ابشواي",
    type: "website",
    url: "https://alaml-theta.vercel.app",
    siteName: "مكتبة الأمل",
    locale: "ar_EG",
    images: [
      {
        url: "https://alaml-theta.vercel.app/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "مكتبة الأمل - أدوات مكتبية",
        type: "image/jpeg",
      },
      {
        url: "https://alaml-theta.vercel.app/og-home-small.jpg",
        width: 800,
        height: 600,
        alt: "مكتبة الأمل",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "مكتبة الأمل ابشواي | أدوات مكتبية",
    description: "اكتشف أفضل الأدوات المكتبية بأسعار مميزة في ابشواي",
    images: ["https://alaml-theta.vercel.app/og-home.jpg"],
    creator: "@alaml_store",
    site: "@alaml_store",
  },
  alternates: {
    canonical: "https://alaml-theta.vercel.app",
    languages: {
      "ar-EG": "https://alaml-theta.vercel.app",
    },
  },
  other: {
    "fb:app_id": "YOUR_FACEBOOK_APP_ID", // Replace with your actual Facebook App ID
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export default async function Home() {
  const { categories, products, productsWithOffers } =
    await getCachedHomeData();

  // Generate JSON-LD schemas
  const localBusinessSchema = generateLocalBusinessSchema();
  const webSiteSchema = generateWebSiteSchema();
  const faqSchema = generateFAQSchema();
  const breadcrumbSchema = generateHomePageBreadcrumbSchema();

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <main>
        <Hero />
        <Categories data={categories} />
        <ProductsList data={products} />

        {productsWithOffers && productsWithOffers.length > 0 && (
          <section>
            <ProductsList data={productsWithOffers} title="عروض وخصومات" />
          </section>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-3 place-items-center text-center my-20!">
          <div className="flex flex-col justify-center items-center gap-4">
            <div className="bg-accent p-3 rounded-full w-fit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                className="h-20 w-20 p-3 rounded-full bg-primary text-accent"
              >
                <path
                  fill="currentColor"
                  d="M12.12 8.2h-.78v1.56h.78a.78.78 0 1 0 0-1.56"
                ></path>
                <path
                  fill="currentColor"
                  d="M21.68 2.54H7.55A2.66 2.66 0 0 0 5.2 4.63L3.37 10.8s-1.38.38-2.21.68a1.88 1.88 0 0 0-.93 1.74v5.16a1 1 0 0 0 1.05 1.05h.55a3 3 0 0 1 0-.53a3.56 3.56 0 0 1 7.12 0a4 4 0 0 1-.15 1h6.48a4 4 0 0 1-.15-1a3.56 3.56 0 0 1 7.12 0a3 3 0 0 1 0 .53h.55a1 1 0 0 0 1.05-1.05V4.63a2.09 2.09 0 0 0-2.17-2.09M8.15 10.27a.5.5 0 0 1 .5.5a.5.5 0 0 1-.5.5H6.86v2.06a.5.5 0 0 1-.5.5a.5.5 0 0 1-.5-.5V7.7a.51.51 0 0 1 .5-.5h1.79a.5.5 0 0 1 .5.5a.5.5 0 0 1-.5.5H6.86v2.07Zm5.75 2v1a.5.5 0 0 1-.5.5a.5.5 0 0 1-.5-.5v-1a1.56 1.56 0 0 0-1.55-1.55v2.57a.5.5 0 1 1-1 0V7.7a.5.5 0 0 1 .5-.5h1.28a1.78 1.78 0 0 1 1 3.26a2.55 2.55 0 0 1 .77 1.85Zm3.78-2a.5.5 0 0 1 .5.5a.5.5 0 0 1-.5.5h-1.29v1.56h1.29a.5.5 0 0 1 .5.5a.5.5 0 0 1-.5.5h-1.79a.5.5 0 0 1-.5-.5V7.7a.51.51 0 0 1 .5-.5h1.79a.5.5 0 0 1 .5.5a.5.5 0 0 1-.5.5h-1.29v2.07Zm4.29 0a.51.51 0 0 1 .5.5a.5.5 0 0 1-.5.5h-1.29v1.56H22a.51.51 0 0 1 .5.5a.5.5 0 0 1-.5.5h-1.82a.5.5 0 0 1-.5-.5V7.7a.5.5 0 0 1 .5-.5H22a.51.51 0 0 1 .5.5a.5.5 0 0 1-.5.5h-1.32v2.07Z"
                ></path>
                <path
                  fill="currentColor"
                  d="M2.79 18.9a2.56 2.56 0 1 0 5.12 0a2.56 2.56 0 1 0-5.12 0m13.3 0a2.56 2.56 0 1 0 5.12 0a2.56 2.56 0 1 0-5.12 0"
                ></path>
              </svg>
            </div>
            <div className="">
              <p className="font-bold text-lg">شحن سريع ومجاني</p>
              <p>للطلبات أكثر من 200 جنيه</p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center gap-4">
            <div className="bg-accent p-3 rounded-full w-fit">
              <HeadphonesIcon className="h-20 w-20 p-3 rounded-full bg-primary text-accent" />
            </div>
            <div className="">
              <p className="font-bold text-lg">خدمة عملاء 24/7</p>
              <p>نحن هنا لمساعدتك في أي وقت</p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center gap-4">
            <div className="bg-accent p-3 rounded-full w-fit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                className="h-20 w-20 p-3 rounded-full bg-primary text-accent"
              >
                <path
                  fill="currentColor"
                  d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"
                ></path>
                <path
                  fill="currentColor"
                  d="M12 6.5a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 12 6.5zm1 4.5h-2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z"
                ></path>
              </svg>
            </div>
            <div className="">
              <p className="font-bold text-lg">ضمان الجودة</p>
              <p>نضمن لك أفضل المنتجات بأعلى جودة</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
