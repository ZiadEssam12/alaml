import { Suspense } from "react";
import prisma from "@/lib/prisma";
import RatingStatistics from "./RatingStatistics";
import ReviewsPreviewClient from "./ReviewsPreviewClient";
import ReviewForm from "./ReviewForm";
import { auth } from "@/auth/auth";

// Server Component - Main orchestrator for the review system
export default async function ProductReviewsContainer({
  productId,
  productName,
}) {
  const reviewsData = await fetchProductReviews(productId, 1, 5);

  const { user: session } = await auth();

  let userHasPurchased = false;
  let userHasReviewed = false;

  if (session?.id) {
    [userHasPurchased, userHasReviewed] = await Promise.all([
      checkUserPurchase(session.id, productId),
      checkUserReview(session.id, productId),
    ]);
  }

  console.log("user has purchased:", userHasPurchased);
  console.log("user has reviewed:", userHasReviewed);

  return (
    <div className="space-y-6">
      <Suspense fallback={<ReviewFormSkeleton />}>
        <ReviewForm
          productId={productId}
          productName={productName}
          userHasPurchased={userHasPurchased}
          userHasReviewed={userHasReviewed}
        />
      </Suspense>

      {/* Reviews Display Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Rating Statistics - Left Side */}
        <div className="lg:col-span-1">
          <RatingStatistics
            averageRating={reviewsData.stats.averageRating}
            totalReviews={reviewsData.stats.totalReviews}
            ratingDistribution={reviewsData.ratingDistribution}
          />
        </div>

        {/* Reviews Preview - Right Side */}
        <div className="lg:col-span-2">
          <ReviewsPreviewClient
            initialReviews={reviewsData.reviews}
            totalReviews={reviewsData.stats.totalReviews}
            productId={productId}
          />
        </div>
      </div>
    </div>
  );
}

// Loading skeleton for review form
function ReviewFormSkeleton() {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
}

// Server-side data fetching functions
async function fetchProductReviews(productId, page = 1, pageSize = 5) {
  try {
    // Get product reviews with stats
    const [reviews, totalCount, ratingStats, ratingDistribution] =
      await Promise.all([
        // Get reviews
        prisma.review.findMany({
          where: {
            productId,
            status: "approved",
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            userName: true,
            rating: true,
            comment: true,
            createdAt: true,
          },
        }),

        // Get total count
        prisma.review.count({
          where: {
            productId,
            status: "approved",
          },
        }),

        // Get rating statistics
        prisma.review.aggregate({
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
        }),

        // Get rating distribution
        prisma.review.groupBy({
          by: ["rating"],
          where: {
            productId,
            status: "approved",
          },
          _count: {
            rating: true,
          },
        }),
      ]);

    // Process rating distribution
    const distribution = Array(5).fill(0);
    ratingDistribution.forEach(({ rating, _count }) => {
      distribution[rating - 1] = _count.rating;
    });

    return {
      reviews,
      stats: {
        averageRating: ratingStats._avg.rating || 0,
        totalReviews: ratingStats._count.rating || 0,
      },
      ratingDistribution: distribution,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNext: page * pageSize < totalCount,
        hasPrevious: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return {
      reviews: [],
      stats: { averageRating: 0, totalReviews: 0 },
      ratingDistribution: Array(5).fill(0),
      pagination: {
        page: 1,
        pageSize,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
    };
  }
}

async function checkUserPurchase(userId, productId) {
  try {
    console.log("🔍 Debugging purchase check:");
    console.log("- User ID:", userId);
    console.log("- Product ID:", productId);

    // Step 1: Check if user has any orders at all
    const userOrders = await prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        customerName: true,
      },
    });
    console.log("📦 User orders:", userOrders);

    // Step 2: Check if there are any order items for this product
    const orderItems = await prisma.orderItem.findMany({
      where: { productId },
      select: {
        id: true,
        orderId: true,
        productId: true,
        productName: true,
        order: {
          select: {
            userId: true,
            status: true,
            customerName: true,
          },
        },
      },
    });
    console.log("🛍️ Order items for product:", orderItems);

    // Step 2.5: Check if any of the order items belong to the user's orders
    const matchingItems = orderItems.filter((item) =>
      userOrders.some((order) => order.id === item.orderId)
    );
    console.log("🔗 Matching order items for this user:", matchingItems);

    // Step 3: Now do the actual check
    console.log("🔍 Running final query with conditions:");
    console.log("- userId:", userId);
    console.log("- productId:", productId);
    console.log("- statuses:", ["shipped", "delivered"]);

    // Step 3.5: Test simpler query first
    const simpleOrderCheck = await prisma.order.findFirst({
      where: { userId },
      select: { id: true, status: true },
    });
    console.log("📋 Simple order check for user:", simpleOrderCheck);

    const purchase = await prisma.order.findFirst({
      where: {
        userId, // Use direct userId field instead of relationship
        status: { in: ["shipped", "delivered"] },
        items: {
          some: {
            productId: productId,
          },
        },
      },
      select: {
        id: true,
        status: true,
        customerName: true,
        items: {
          where: { productId },
          select: { productName: true, quantity: true },
        },
      },
    });

    console.log("✅ Final purchase result:", purchase);

    return !!purchase;
  } catch (error) {
    console.error("❌ Error checking user purchase:", error);
    return false;
  }
}

async function checkUserReview(userId, productId) {
  try {
    const review = await prisma.review.findFirst({
      where: { userId, productId },
      select: { id: true },
    });

    return !!review;
  } catch (error) {
    console.error("Error checking user review:", error);
    return false;
  }
}
