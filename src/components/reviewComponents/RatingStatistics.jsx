import { Star, StarHalf } from "lucide-react";

// Server Component - Renders rating statistics for SEO and performance
export default function RatingStatistics({
  averageRating = 0,
  totalReviews = 0,
  ratingDistribution = [],
}) {
  // Format average rating to 1 decimal place
  const formattedAverage = Number(averageRating).toFixed(1);

  // Create rating distribution if not provided
  const distribution =
    ratingDistribution.length > 0 ? ratingDistribution : Array(5).fill(0);

  // Render star rating display
  const renderStars = (rating, size = "w-4 h-4") => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className={`${size} fill-yellow-400 text-yellow-400`}
        />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className={`${size} fill-yellow-400 text-yellow-400`}
        />
      );
    }

    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className={`${size} text-gray-300`} />
      );
    }

    return stars;
  };

  // Calculate percentage for each rating
  const getPercentage = (count) => {
    return totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
  };

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        تقييمات العملاء
      </h3>

      {/* No reviews message */}
      {totalReviews === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <Star className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">لا توجد تقييمات بعد</p>
        </div>
      ) : (
        <>
          {/* Overall Rating Display */}
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {formattedAverage}
              </div>
              <div className="text-sm text-gray-500">من 5</div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-1 mb-2">
                {renderStars(averageRating, "w-5 h-5")}
              </div>
              <div className="text-sm text-gray-600">
                {totalReviews} تقييم عالمي
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = distribution[rating - 1] || 0;
              const percentage = getPercentage(count);

              return (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-8 text-gray-700">{rating} نجوم</span>

                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="w-12 text-right text-gray-600">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Additional Stats */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {getPercentage(distribution[4] + distribution[3])}%
                </div>
                <div className="text-xs text-gray-500">تقييم إيجابي</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">
                  {totalReviews}
                </div>
                <div className="text-xs text-gray-500">إجمالي التقييمات</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
