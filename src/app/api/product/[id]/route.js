import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const cookieKey =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

export async function GET(request, { params }) {
  try {
    const session = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      salt: cookieKey,
      cookieName: cookieKey,
    });

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

    // Get similar products
    const similarProducts = await prisma.product.findMany({
      where: {
        categoryID: product.categoryID,
        isActive: true,
        NOT: { id: product.id },
      },
      take: 4,
    });

    // Check user permissions if authenticated
    let hasPurchased = false;
    let hasReviewed = false;
    let review = null;
    if (userId) {
      // Check if user has purchased the product
      const purchase = await prisma.order.findFirst({
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
      });
      hasPurchased = !!purchase;

      // Check if user has reviewed the product
      review = await prisma.review.findFirst({
        where: { userId, productId: product.id },
        select: { id: true },
      });
      hasReviewed = !!review;
    }

    // Fetch product reviews with stats
    const [
      reviews,
      totalCount,
      ratingStats,
      ratingDistribution,
      options,
      variants,
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
    ]);

    // Process rating distribution
    const distribution = Array(5).fill(0);
    ratingDistribution.forEach(({ rating, _count }) => {
      distribution[rating - 1] = _count.rating;
    });

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
