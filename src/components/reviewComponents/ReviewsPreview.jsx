"use client";

import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ReviewDeleteButton, ReviewUpdateButton } from "./reviewActionButtons";

// Server Component - Shows initial reviews for SEO and performance
export default function ReviewsPreview({
  reviews = [],
  totalReviews = 0,
  onShowMore,
  handleReviewUpdated,
}) {
  const { data: session } = useSession();
  const userId = session?.user?.id || null;
  const router = useRouter();
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  // Handle review deletion
  const handleDeleteReview = async (reviewId) => {
    if (!confirm("هل تريد فعلاً حذف التقييم؟")) {
      return;
    }

    setDeletingReviewId(reviewId);
    const toastId = toast.loading("جاري حذف التقييم...");

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      toast.dismiss(toastId);

      if (response.ok) {
        toast.success("تم حذف التقييم بنجاح");
        router.refresh();
      } else {
        toast.error(data.error || "حدث خطأ أثناء حذف التقييم");
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("حدث خطأ أثناء حذف التقييم");
      console.error("Error deleting review:", error);
    } finally {
      setDeletingReviewId(null);
    }
  };

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
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
        <div className="text-center py-8">
          <Star className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-700" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">
            لا توجد تقييمات بعد
          </h3>
          <p className="text-gray-500 dark:text-slate-400">
            كن أول من يشارك رأيه في هذا المنتج
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            أحدث التقييمات
          </h3>
          <span className="text-sm text-gray-500 dark:text-slate-400">
            {totalReviews} تقييم
          </span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-gray-200 dark:divide-slate-800">
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
                  <div className="flex gap-2 items-center">
                    <div className="font-medium text-gray-900 dark:text-slate-100">
                      {review.userName || "مستخدم مجهول"}
                    </div>
                    {review.userId === userId && (
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        أنت
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-slate-400">
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
              <div className="text-gray-700 dark:text-slate-300 leading-relaxed">
                {truncateComment(review.comment)}
              </div>
            )}

            {/* Quality Label */}
            <div className="flex justify-between">
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                  ✓ عملية شراء موثقة
                </span>
                {review.rating >= 4 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                    ⭐ تقييم ممتاز
                  </span>
                )}
              </div>
              {review.userId === userId && (
                <div className="mr-auto flex items-center gap-2">
                  <ReviewUpdateButton
                    onClick={() => handleReviewUpdated(review)}
                  />
                  <ReviewDeleteButton
                    onClick={() => handleDeleteReview(review.id)}
                    isLoading={deletingReviewId === review.id}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {totalReviews > reviews.length && (
        <div className="p-6 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
          <button
            onClick={onShowMore}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            عرض جميع التقييمات ({totalReviews})
          </button>
        </div>
      )}
    </div>
  );
}
