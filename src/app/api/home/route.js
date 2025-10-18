import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [categories, productsData] = await prisma.$transaction([
      prisma.category.findMany({
        take: 10,
      }),
      prisma.product.findMany({
        take: 10,
        where: {
          isActive: true,
          stockQuantity: { gt: 0 },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Fetch review statistics for each product
    const products = await Promise.all(
      productsData.map(async (product) => {
        const reviewStats = await prisma.review.aggregate({
          where: { productId: product.id, status: "approved" },
          _avg: { rating: true },
          _count: { id: true },
        });

        return {
          ...product,
          averageRating: reviewStats._avg.rating || 0,
          totalSales: reviewStats._count.id || 0,
        };
      })
    );

    return NextResponse.json(
      {
        categories,
        products,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
