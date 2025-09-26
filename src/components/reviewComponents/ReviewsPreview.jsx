import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

// Server Component - Shows initial reviews for SEO and performance
export default function ReviewsPreview({
  reviews = [],
  totalReviews = 0,
  onShowMore,
}) {
  // Render individual star rating
  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Star
          key={index}
          className={`w-4 h-4 ${
            index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ));
  };

  // Format review date
  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ar,
      });
    } catch {
      return "منذ فترة";
    }
  };

  // Truncate long comments
  const truncateComment = (comment, maxLength = 150) => {
    if (!comment || comment.length <= maxLength) return comment;
    return comment.substring(0, maxLength) + "...";
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-center py-8">
          <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            لا توجد تقييمات بعد
          </h3>
          <p className="text-gray-500">كن أول من يشارك رأيه في هذا المنتج</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            أحدث التقييمات
          </h3>
          <span className="text-sm text-gray-500">{totalReviews} تقييم</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="divide-y">
        {reviews.map((review) => (
          <div key={review.id} className="p-6">
            {/* Review Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* User Avatar Placeholder */}
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {review.userName?.charAt(0)?.toUpperCase() || "م"}
                </div>

                <div>
                  <div className="font-medium text-gray-900">
                    {review.userName || "مستخدم مجهول"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </div>
                </div>
              </div>

              {/* Rating Stars */}
              <div className="flex items-center gap-1">
                {renderStars(review.rating)}
              </div>
            </div>

            {/* Review Content */}
            {review.comment && (
              <div className="text-gray-700 leading-relaxed">
                {truncateComment(review.comment)}
              </div>
            )}

            {/* Quality Label */}
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ عملية شراء موثقة
              </span>
              {review.rating >= 4 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  ⭐ تقييم ممتاز
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {totalReviews > reviews.length && (
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onShowMore}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            عرض جميع التقييمات ({totalReviews})
          </button>
        </div>
      )}
    </div>
  );
}
