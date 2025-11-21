import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProductDetailsClient } from "@/components/ProductDetails/ProductDetailsClient";
import Link from "next/link";
import { Home, Box } from "lucide-react";
import { cache } from "react";

import ProductCarousel from "@/components/dashbaord/product/productCarousel";
import { imageService } from "@/lib/image-service";
import ProductsList from "@/components/Home/productsList";
import ProductReviewsContainer from "@/components/reviewComponents/ProductReviewsContainer";
import { getAllSlugs, getProduct } from "@/lib/api/shop/productAPI";
import {
  generateProductSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
} from "@/lib/schemas/productSchemas";

// Cache the product fetch to prevent duplicate calls in the same request
const getCachedProduct = cache(async (slug) => {
  return await getProduct(slug);
});

// Generate static params for all active products
export async function generateStaticParams() {
  try {
    const products = await getAllSlugs();

    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export const dynamic = "auto";
export const revalidate = 86400; // Revalidate every day (ISR)

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const { product: displayProduct } = await getCachedProduct(slug);

    if (!displayProduct) {
      return {
        title: "المنتج غير موجود | مكتبة الأمل",
        description: "المنتج الذي تبحث عنه غير موجود",
      };
    }

    // Generate responsive URLs for better image quality
    const publicImageIds = displayProduct.imageUrls.map((url) =>
      imageService.extractPublicId(url)
    );
    const responsiveUrls = publicImageIds.map((id) =>
      imageService.generateResponsiveUrls(id)
    );

    // Use the first image's large version for OG (1200x1200)
    const firstImage = responsiveUrls[0];
    const ogImageUrl = firstImage?.large || displayProduct.imageUrls[0];

    return {
      title: `${displayProduct.name} | مكتبة الأمل`,
      description: displayProduct.description,
      keywords: [
        displayProduct.name,
        displayProduct.category?.name,
        "أدوات مكتبية",
        "متجر إلكتروني",
        ...(displayProduct?.keywords || []),
      ].join(", "),
      openGraph: {
        title: `${displayProduct.name} | مكتبة الأمل`,
        description: displayProduct.description,
        type: "website",
        url: `https://alaml-theta.vercel.app/products/${displayProduct.slug}`,
        siteName: "مكتبة الأمل",
        locale: "ar_EG",
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: displayProduct.name,
            type: "image/jpeg",
          },
          {
            url: firstImage?.medium || displayProduct.imageUrls[0],
            width: 800,
            height: 600,
            alt: displayProduct.name,
            type: "image/jpeg",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${displayProduct.name} | مكتبة الأمل`,
        description: displayProduct.description,
        images: [ogImageUrl],
        creator: "@alaml_store",
        site: "@alaml_store",
      },
      alternates: {
        canonical: `https://alaml-theta.vercel.app/products/${displayProduct.slug}`,
      },
      other: {
        "fb:app_id": "YOUR_FACEBOOK_APP_ID", // Replace with your actual Facebook App ID
        "product:price:amount": displayProduct.price,
        "product:price:currency": "EGP",
        "product:availability":
          displayProduct.stockQuantity > 0 ? "in stock" : "out of stock",
        "product:category": displayProduct.category?.name,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "مكتبة الأمل",
      description: "متجر الأدوات المكتبية الإلكتروني",
    };
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params;

  const {
    product: displayProduct,
    similarProducts,
    userPermissions,
    reviews: reviewsData,
    options,
    variants,
  } = await getCachedProduct(slug);

  // if the product is not found, show a friendly message
  // or if the product is only shown for admin and the user is not an admin
  if (!displayProduct) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-card rounded-2xl shadow-lg p-8 text-center border">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Box className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
            المنتج غير موجود
          </h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            عذرًا، لم نتمكن من العثور على المنتج الذي تبحث عنه. قد يكون قد تم
            حذفه أو أن الرابط غير صحيح.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Home className="h-4 w-4" />
              العودة إلى الرئيسية
            </Link>
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Box className="h-4 w-4" />
              عرض جميع المنتجات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const publicImageIds = displayProduct.imageUrls.map((url) =>
    imageService.extractPublicId(url)
  );
  const responsiveUrls = publicImageIds.map((id) =>
    imageService.generateResponsiveUrls(id)
  );

  displayProduct.responsiveImageUrls = responsiveUrls;

  const userReview = userPermissions?.userReview;

  // Generate JSON-LD schemas
  const productSchema = generateProductSchema(displayProduct);
  const organizationSchema = generateOrganizationSchema();
  const breadcrumbSchema = generateBreadcrumbSchema(displayProduct);

  return (
    <div className="min-h-screen pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/"
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <Home className="h-4 w-4" />
                    الرئيسية
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={`/categories/${displayProduct.category.seoTitle}`}
                    className="hover:text-primary transition-colors"
                  >
                    {displayProduct.category.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">
                  {displayProduct.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4 lg:col-span-2">
            <ProductCarousel displayProduct={displayProduct} />
          </div>

          {/* Product Information - Client Component */}
          <ProductDetailsClient
            displayProduct={displayProduct}
            options={options}
            variants={variants}
          />
        </div>

        {/* Reviews Section */}
        <section className="border-t pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            آراء العملاء والتقييمات
          </h2>

          <ProductReviewsContainer
            productId={displayProduct.id}
            productName={displayProduct.name}
            userPermissions={userPermissions}
            reviewsData={reviewsData}
            userReview={userReview}
          />
        </section>

        {/* Similar products section  */}
        <ProductsList data={similarProducts} title="منتجات من نفس القسم" />
      </div>
    </div>
  );
}
