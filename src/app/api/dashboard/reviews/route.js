import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/dashboard/reviews - Fetch all reviews with pagination
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const pageSize = parseInt(searchParams.get("pageSize")) || 10;
  const status = searchParams.get("status"); // Filter by status (optional)
  const productId = searchParams.get("productId"); // Filter by product (optional)

  const skip = (page - 1) * pageSize;

  // Build where clause for filtering
  const where = {};
  if (status) {
    where.status = status;
  }
  if (productId) {
    where.productId = productId;
  }

  try {
    // Get total count for pagination
    const totalCount = await prisma.review.count({ where });

    // Fetch reviews with pagination
    const reviews = await prisma.review.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return NextResponse.json({
      data: {
        reviews,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
          hasNext,
          hasPrevious,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب التقييمات" },
      { status: 500 }
    );
  }
}
