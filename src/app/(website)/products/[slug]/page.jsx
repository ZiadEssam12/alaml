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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Fake product data for testing
const fakeProduct = {
  id: 1,
  name: "دفتر ملاحظات",
  slug: "notebook",
  description: "دفتر ملاحظات عالي الجودة مناسب للمدرسة والعمل.",
  price: 45,
  imageUrls: ["/notebooks1.jpg", "/notebooks2.jpg", "/notebooks3.webp"],
  stockQuantity: 12,
  maxQuantityPerUser: 5,
  category: { name: "قرطاسية" },
};

export default async function ProductPage({ params }) {
  const { slug } = await params;

  // Fetch product by slug
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  // Use fake product if not found
  const displayProduct = product || fakeProduct;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen" dir="rtl">
      <div className="flex flex-col md:flex-row gap-8 w-full">
        <div className="flex flex-col items-center justify-center md:w-1/2 w-full">
          <Carousel className="w-full">
            <CarouselContent>
              {displayProduct.imageUrls.map((img, i) => (
                <CarouselItem key={i} className="w-full h-full">
                  <div className="relative w-full h-[400px]">
                    <Image
                      src={img}
                      alt={`${displayProduct.name} صورة ${i + 1}`}
                      fill
                      className="rounded-lg object-cover"
                      sizes="100vw"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselNext />
            <CarouselPrevious />
          </Carousel>
          <div className="flex gap-2 mt-4">
            {displayProduct.imageUrls.map((img, i) => (
              <Image
                key={i}
                src={img}
                alt={`${displayProduct.name} صورة ${i + 1}`}
                width={80}
                height={80}
                className="rounded border object-cover"
              />
            ))}
          </div>
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
                    <Link href={`/categories/${displayProduct.category.name}`}>
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
