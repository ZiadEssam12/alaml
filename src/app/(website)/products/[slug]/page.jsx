import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Fake product data for testing
const fakeProduct = {
  name: "دفتر ملاحظات",
  slug: "notebook",
  description: "دفتر ملاحظات عالي الجودة مناسب للمدرسة والعمل.",
  price: 45,
  imageUrls: [
    "/images/notebook-main.jpg",
    "/images/notebook-side.jpg",
    "/images/notebook-back.jpg",
  ],
  stockQuantity: 12,
  maxQuantityPerUser: 5,
  category: { name: "قرطاسية" },
};

export default async function ProductPage({ params }) {
  const { slug } = params;

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
          <Image
            src={displayProduct.imageUrls[0]}
            alt={displayProduct.name}
            width={500}
            height={500}
            className="rounded-lg object-cover w-full h-auto max-h-[400px]"
          />
          <div className="flex gap-2 mt-4">
            {displayProduct.imageUrls.slice(1).map((img, i) => (
              <Image
                key={i}
                src={img}
                alt={`${displayProduct.name} صورة ${i + 2}`}
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
                  <BreadcrumbLink href="/">الرئيسية</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={`/categories/${displayProduct.category.name}`}
                  >
                    {displayProduct.category.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{displayProduct.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex flex-col gap-4 h-full mt-8">
            <div className="flex items-center gap-2 mb-2">
              {displayProduct.category && (
                <Badge variant="secondary">
                  {displayProduct.category.name}
                </Badge>
              )}
              <span className="text-2xl font-bold">{displayProduct.name}</span>
            </div>
            <p className="text-lg font-semibold text-primary">
              السعر: {displayProduct.price} جنيه
            </p>
            <p className="text-muted-foreground">
              {displayProduct.description}
            </p>
            <p>
              الكمية المتاحة:{" "}
              <span className="font-bold">{displayProduct.stockQuantity}</span>
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <label className="block mb-2">الكمية:</label>
                <div className="bg-gray-100 dark:bg-gray-800 flex items-center gap-3 p-2 rounded">
                  <button className="selection:bg-transparent">-</button>
                  <span>1</span>
                  <button className="selection:bg-transparent">+</button>
                </div>
              </div>
              <Button>أضف إلى السلة</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
