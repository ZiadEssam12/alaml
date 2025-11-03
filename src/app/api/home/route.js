import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [categoriesData, productsData] = await prisma.$transaction([
      prisma.category.findMany({
        where: {
          status: "active", // Only fetch active categories
        },
        include: {
          products: {
            where: {
              isActive: true, // Only count active products
            },
            select: {
              id: true, // Just to count
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
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

    // Filter categories that have at least one active product
    const categories = categoriesData
      .filter((category) => category.products.length > 0)
      .map((category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        status: category.status,
        seoTitle: category.seoTitle,
        seoDescription: category.seoDescription,
        createdAt: category.createdAt,
      }));

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
          ratingCount: reviewStats._count.id || 0,
        };
      })
    );

    return NextResponse.json(
      {
        data: {
          categories,
          products,
        },
        message: "Home data fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching home data:", error);
    return NextResponse.json(
      { error: "Failed to fetch home data" },
      { status: 500 }
    );
  }
}
