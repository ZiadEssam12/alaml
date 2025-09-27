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
  userPermissions = null,
}) {
  const user = await auth();
  console.log("Authenticated user:", user);

  const reviewsData = await fetchProductReviews(productId, 1, 5);

  let userHasPurchased = false;
  let userHasReviewed = false;

  if (userPermissions) {
    userHasPurchased = userPermissions.hasPurchased;
    userHasReviewed = userPermissions.hasReviewed;
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
