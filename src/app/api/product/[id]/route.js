import { getUserTokenSSR } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const session = await getUserTokenSSR(request);

    const role = session?.role;
    const userId = session?.id;

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Product id is required" },
        { status: 400 }
      );
    }

    // First get the product with all nested data in one query
    const product = await prisma.product.findUnique({
      where: { slug: id },
      include: {
        category: true,
        // Get reviews with stats in one query
        reviews: {
          where: { status: "approved" },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            userName: true,
            userId: true,
            rating: true,
            comment: true,
            createdAt: true,
          },
        },
        // Get options with values
        options: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            name: true,
            presentation: true,
            position: true,
            values: {
              orderBy: { position: "asc" },
              select: {
                id: true,
                value: true,
                hex: true,
                imageUrl: true,
                position: true,
              },
            },
          },
        },
        // Get variants with options
        variants: {
          select: {
            id: true,
            sku: true,
            price: true,
            stockQuantity: true,
            isActive: true,
            imageUrls: true,
            combinationHash: true,
            options: {
              select: {
                optionId: true,
                valueId: true,
                option: { select: { name: true, position: true } },
                value: {
                  select: {
                    value: true,
                    hex: true,
                    imageUrl: true,
                    position: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product || (product.isActive === false && role !== "admin")) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch only user-specific data and similar products in parallel (2 queries)
    const [purchase, review, similarProducts, reviewStats] = await Promise.all([
      // Check if user has purchased
      userId
        ? prisma.order.findFirst({
            where: {
              userId,
              status: { in: ["shipped", "delivered"] },
              items: {
                some: {
                  productId: product.id,
                },
              },
            },
            select: { id: true },
          })
        : null,

      // Check if user has reviewed
      userId
        ? prisma.review.findFirst({
            where: { userId, productId: product.id },
            select: { id: true },
          })
        : null,

      // Get similar products
      prisma.product.findMany({
        where: {
          categoryID: product.categoryID,
          isActive: true,
          NOT: { id: product.id },
        },
        take: 4,
      }),

      // Get review stats and distribution
      prisma.review.groupBy({
        by: ["rating"],
        where: { productId: product.id, status: "approved" },
        _count: { rating: true },
      }),
    ]);

    // Extract data from nested queries
    const reviews = product.reviews;
    const options = product.options;
    const variants = product.variants;
    const totalCount = reviews.length; // Already limited to 5

    // Calculate rating stats from fetched reviews and distribution
    const ratingStats = {
      _avg: {
        rating:
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0,
      },
      _count: { rating: product.ratingCount },
    };

    // Process rating distribution
    const distribution = Array(5).fill(0);
    reviewStats.forEach(({ rating, _count }) => {
      distribution[rating - 1] = _count.rating;
    });

    // Process user permissions
    const hasPurchased = !!purchase;
    const hasReviewed = !!review;

    const reviewsData = {
      reviews,
      stats: {
        averageRating: product.averageRating,
        totalReviews: product.ratingCount,
      },
      ratingDistribution: distribution,
      pagination: {
        page: 1,
        pageSize: 5,
        totalCount: product.ratingCount,
        totalPages: Math.ceil(product.ratingCount / 5),
        hasNext: product.ratingCount > 5,
        hasPrevious: false,
      },
    };

    const userPermissions = userId
      ? {
          hasPurchased: hasPurchased,
          hasReviewed: hasReviewed,
          canReview: hasPurchased && !hasReviewed,
          userReview: review?.status !== "approved" ? review : null,
        }
      : null;

    return NextResponse.json(
      {
        data: {
          product,
          similarProducts,
          userPermissions,
          reviews: reviewsData,
          options,
          variants,
        },
        message: "Product fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
