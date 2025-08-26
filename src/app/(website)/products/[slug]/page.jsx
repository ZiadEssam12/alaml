import prisma from "@/lib/prisma";
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProductInfoWrapper } from "@/components/ProductCard/AddtoCartWrapper";
import Link from "next/link";
import { Home, Box } from "lucide-react"; // Importing icons

import ProductCarousel from "@/components/dashbaord/product/productCarousel";
import { imageService } from "@/lib/image-service";
import { cookies } from "next/headers";

export default async function ProductPage({ params }) {
  const cookiesStore = await cookies();
  const token =
    cookiesStore.get("authjs.session-token")?.value ||
    cookiesStore.get("__Secure-authjs.session-token")?.value;

  const { slug } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/product/${slug}`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 space-y-4"
        dir="rtl"
      >
        <h1 className="text-3xl font-bold text-red-500">المنتج غير موجود</h1>
        <p className="text-gray-600">
          عذرًا، لم نتمكن من العثور على المنتج الذي تبحث عنه.
        </p>
        <div className="flex space-x-4">
          <Link
            href="/"
            className="flex items-center space-x-2 text-blue-500 hover:underline"
          >
            <Home className="h-5 w-5" />
            <span>العودة إلى الرئيسية</span>
          </Link>
          <Link
            href="/products"
            className="flex items-center space-x-2 text-blue-500 hover:underline"
          >
            <Box className="h-5 w-5" />
            <span>عرض جميع المنتجات</span>
          </Link>
        </div>
      </div>
    );
  }

  const { data: displayProduct } = await res.json();

  const publicImageIds = displayProduct.imageUrls.map((url) =>
    imageService.extractPublicId(url)
  );

  const responsiveUrls = publicImageIds.map((id) =>
    imageService.generateResponsiveUrls(id)
  );

  displayProduct.responsiveImageUrls = responsiveUrls;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen" dir="rtl">
      <div className="flex flex-col md:flex-row gap-8 w-full">
        <div className="flex flex-col items-center justify-center md:w-1/2 w-full">
          <ProductCarousel displayProduct={displayProduct} />
        </div>
        <div className="md:w-1/2 w-full">
          <div>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">الرئيسية</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href={`/categories/${displayProduct.category.seoTitle}`}
                    >
                      {displayProduct.category.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{displayProduct.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {/* Show label if product is not available for public */}
          {!displayProduct.isActive && (
            <div className="my-6 flex items-center justify-center">
              <span className="inline-block bg-red-600 text-white text-lg font-extrabold px-6 py-3 rounded-lg shadow-lg border-2 border-red-800 animate-pulse">
                🚫 هذا المنتج غير متاح للعامة
              </span>
            </div>
          )}
          <ProductInfoWrapper product={displayProduct} />
        </div>
      </div>
    </div>
  );
}
