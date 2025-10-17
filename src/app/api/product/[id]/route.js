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

    // First get the product to ensure it exists
    const product = await prisma.product.findUnique({
      where: { slug: id },
      include: {
        category: true,
      },
    });

    if (!product || (product.isActive === false && role !== "admin")) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch product reviews with stats, similar products, and user permissions
    const [
      reviews,
      totalCount,
      ratingStats,
      ratingDistribution,
      options,
      variants,
      similarProducts,
      purchase,
      review,
    ] = await Promise.all([
      // reviews (unchanged)
      prisma.review.findMany({
        where: { productId: product.id, status: "approved" },
        skip: 0,
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
      }),
      prisma.review.count({
        where: { productId: product.id, status: "approved" },
      }),
      prisma.review.aggregate({
        where: { productId: product.id, status: "approved" },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      prisma.review.groupBy({
        by: ["rating"],
        where: { productId: product.id, status: "approved" },
        _count: { rating: true },
      }),

      // Product options with ordered values
      prisma.productOption.findMany({
        where: { productId: product.id },
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
      }),

      // Variants with their option/value selections
      prisma.productVariant.findMany({
        where: { productId: product.id },
        select: {
          id: true,
          sku: true,
          price: true,
          stockQuantity: true,
          isActive: true,
          imageUrls: true,
          combinationHash: true,
          options: {
            // ProductVariant.options: ProductVariantOption[]
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
      }),

      // Get similar products
      prisma.product.findMany({
        where: {
          categoryID: product.categoryID,
          isActive: true,
          NOT: { id: product.id },
        },
        take: 4,
      }),

      // Check if user has purchased the product (null if not authenticated)
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

      // Check if user has reviewed the product (null if not authenticated)
      userId
        ? prisma.review.findFirst({
            where: { userId, productId: product.id },
            select: { id: true },
          })
        : null,
    ]);

    // Process rating distribution
    const distribution = Array(5).fill(0);
    ratingDistribution.forEach(({ rating, _count }) => {
      distribution[rating - 1] = _count.rating;
    });

    // Process user permissions
    const hasPurchased = !!purchase;
    const hasReviewed = !!review;

    const reviewsData = {
      reviews,
      stats: {
        averageRating: ratingStats._avg.rating || 0,
        totalReviews: ratingStats._count.rating || 0,
      },
      ratingDistribution: distribution,
      pagination: {
        page: 1,
        pageSize: 5,
        totalCount,
        totalPages: Math.ceil(totalCount / 5),
        hasNext: totalCount > 5,
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
