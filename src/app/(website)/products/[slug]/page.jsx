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

import ProductCarousel from "@/components/dashbaord/product/productCarousel";
import { imageService } from "@/lib/image-service";

export default async function ProductPage({ params }) {
  const { slug } = await params;

  // Fetch product by slug
  const displayProduct = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

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
          <ProductInfoWrapper product={displayProduct} />
        </div>
      </div>
    </div>
  );
}
