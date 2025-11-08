import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { ProductCartControlsWrapper } from "@/components/ProductCard/ProductCartControlsWrapper";
import Link from "next/link";
import { Home, Box, Star, Package, Truck, Shield } from "lucide-react";
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
        "قرطاسية",
        "متجر إلكتروني",
        ...(displayProduct?.keywords || []),
      ].join(", "),
      openGraph: {
        title: `${displayProduct.name} | مكتبة الأمل`,
        description: displayProduct.description,
        type: "product",
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
      description: "متجر القرطاسية الإلكتروني",
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
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
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

          {/* Product Information */}
          <div className="space-y-6 lg:col-span-3">
            {/* Product Status */}
            {!displayProduct.isActive && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-200">
                      المنتج غير متاح للعامة
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      هذا المنتج غير متاح للشراء حالياً
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Product Details */}
            <div className="bg-white dark:bg-card rounded-2xl shadow-lg p-8 border space-y-6">
              {/* Category and Title */}
              <div className="space-y-4">
                {displayProduct.category && (
                  <Link
                    href={`/categories/${displayProduct.category.seoTitle}`}
                    className="hover:text-primary transition-colors"
                  >
                    <Badge variant="secondary" className="w-fit">
                      {displayProduct.category.name}
                    </Badge>
                  </Link>
                )}
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight mt-5">
                  {displayProduct.name}
                </h1>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-primary">
                  {displayProduct.price.toLocaleString()} جنيه
                </div>
                {displayProduct.stockQuantity <= 5 &&
                  displayProduct.stockQuantity > 0 && (
                    <Badge
                      variant="outline"
                      className="text-orange-700 border-orange-600"
                    >
                      {displayProduct.stockQuantity} متبقي
                    </Badge>
                  )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                <div
                  className={`w-3 h-3 rounded-full ${
                    displayProduct.stockQuantity > 10
                      ? "bg-green-500"
                      : displayProduct.stockQuantity > 0
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}
                />
                <span className="text-sm font-medium">
                  {displayProduct.stockQuantity > 10
                    ? "متوفر"
                    : displayProduct.stockQuantity > 0
                    ? "كمية محدودة"
                    : "غير متوفر"}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({displayProduct.stockQuantity} قطعة)
                </span>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">وصف المنتج</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {displayProduct.description}
                </p>
              </div>

              {/* Add to Cart Section */}
              <div className="pt-6 border-t">
                <ProductCartControlsWrapper
                  product={displayProduct}
                  options={options}
                  variants={variants}
                />
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-card rounded-xl p-4 border text-center">
                <Truck className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">شحن مجاني</p>
                <p className="text-xs text-muted-foreground">
                  على الطلبات فوق 500 جنيه
                </p>
              </div>
              <div className="bg-white dark:bg-card rounded-xl p-4 border text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">ضمان الجودة</p>
                <p className="text-xs text-muted-foreground">
                  منتجات أصلية 100%
                </p>
              </div>
              <div className="bg-white dark:bg-card rounded-xl p-4 border text-center">
                <Star className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">تقييم عالي</p>
                <p className="text-xs text-muted-foreground">رضا العملاء</p>
              </div>
            </div>
          </div>
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
