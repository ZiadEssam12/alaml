import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/reviews/product/[productId] - Fetch approved reviews for a product
export async function GET(req, { params }) {
  const { productId } = await params;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const pageSize = parseInt(searchParams.get("pageSize")) || 10;
  const sort = searchParams.get("sort") || "newest";
  const ratingFilter = searchParams.get("rating") || "all";

  const skip = (page - 1) * pageSize;

  // Build sort order
  let orderBy = { createdAt: "desc" }; // default: newest first
  switch (sort) {
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "highest":
      orderBy = { rating: "desc" };
      break;
    case "lowest":
      orderBy = { rating: "asc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  // Build rating filter
  const ratingWhere =
    ratingFilter !== "all" ? { rating: parseInt(ratingFilter) } : {};

  // Combine filters
  const whereClause = {
    productId,
    status: "approved",
    ...ratingWhere,
  };

  try {
    // Check if product exists first
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    // Get total count of approved reviews for this product
    const totalCount = await prisma.review.count({
      where: whereClause,
    });

    // Fetch approved reviews for the product
    const reviews = await prisma.review.findMany({
      where: whereClause,
      skip,
      take: pageSize,
      orderBy,
      select: {
        id: true,
        userName: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    // Calculate average rating
    const ratingStats = await prisma.review.aggregate({
      where: {
        productId,
        status: "approved",
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

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
        stats: {
          averageRating: ratingStats._avg.rating || 0,
          totalReviews: ratingStats._count.rating || 0,
        },
        productInfo: {
          id: product.id,
          name: product.name,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب تقييمات المنتج" },
      { status: 500 }
    );
  }
}
