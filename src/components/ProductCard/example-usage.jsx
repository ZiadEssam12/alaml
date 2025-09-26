// Example usage in a product page - /app/(website)/products/[id]/page.jsx

import ProductReviewsContainer from "@/components/reviewComponents/ProductReviewsContainer";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

// Server Component - Product Page
export default async function ProductPage({ params }) {
  const { id } = await params;

  // Fetch product data
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      images: true,
      // ... other product fields
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Product Details Section */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div>{/* Product image gallery component */}</div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <div className="text-2xl font-bold text-blue-600 mb-6">
            {product.price} ج.م
          </div>
          {/* Add to cart button, etc. */}
        </div>
      </div>

      {/* Reviews Section */}
      <section className="border-t pt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          آراء العملاء والتقييمات
        </h2>

        <ProductReviewsContainer
          productId={product.id}
          productName={product.name}
        />
      </section>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { name: true, description: true },
  });

  if (!product) {
    return {
      title: "المنتج غير موجود",
      description: "المنتج المطلوب غير متاح",
    };
  }

  return {
    title: `${product.name} - متجر الأمل`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      type: "product",
    },
  };
}
