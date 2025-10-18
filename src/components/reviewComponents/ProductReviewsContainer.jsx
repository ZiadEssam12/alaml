import { Suspense } from "react";
import RatingStatistics from "./RatingStatistics";
import ReviewsPreviewClient from "./ReviewsPreviewClient";
import ReviewForm from "./ReviewForm";

// Server Component - Main orchestrator for the review system
export default async function ProductReviewsContainer({
  productId,
  productName,
  userPermissions = null,
  reviewsData = null,
  userReview = null,
}) {
  let userHasPurchased = false;
  let userHasReviewed = false;

  if (userPermissions) {
    userHasPurchased = userPermissions.hasPurchased;
    userHasReviewed = userPermissions.hasReviewed;
  }

  // Fallback reviews data structure if not provided
  const defaultReviewsData = {
    reviews: [],
    stats: { averageRating: 0, totalReviews: 0 },
    ratingDistribution: Array(5).fill(0),
    pagination: {
      page: 1,
      pageSize: 5,
      totalCount: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    },
  };

  const reviews = reviewsData || defaultReviewsData;

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
            averageRating={reviews.stats.averageRating}
            totalReviews={reviews.stats.totalReviews}
            ratingDistribution={reviews.ratingDistribution}
          />
        </div>

        {/* Reviews Preview - Right Side */}
        <div className="lg:col-span-2">
          <ReviewsPreviewClient
            initialReviews={reviews.reviews}
            totalReviews={reviews.stats.totalReviews}
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
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
        <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
      </div>
    </div>
  );
}
