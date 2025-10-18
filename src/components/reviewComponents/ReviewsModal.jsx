"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Star, Loader2, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export default function ReviewsModal({
  isOpen,
  onClose,
  productId,
  initialReviews = [],
  totalReviews = 0,
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(totalReviews > initialReviews.length);
  const [sortBy, setSortBy] = useState("newest");
  const [filterRating, setFilterRating] = useState("all");

  // Reset state when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setReviews(initialReviews);
      setPage(1);
      setHasMore(totalReviews > initialReviews.length);
    }
  }, [isOpen, initialReviews, totalReviews]);

  // Load more reviews
  const loadMoreReviews = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/reviews/product/${productId}?page=${
          page + 1
        }&pageSize=10&sort=${sortBy}&rating=${filterRating}`
      );

      if (response.ok) {
        const data = await response.json();
        const newReviews = data.data.reviews;

        setReviews((prev) => [...prev, ...newReviews]);
        setPage((prev) => prev + 1);
        setHasMore(data.data.pagination.hasNext);
      }
    } catch (error) {
      console.error("Failed to load more reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [productId, page, sortBy, filterRating, loading, hasMore]);

  // Filter and sort reviews
  const applyFiltersAndSort = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/reviews/product/${productId}?page=1&pageSize=${
          reviews.length || 10
        }&sort=${sortBy}&rating=${filterRating}`
      );

      if (response.ok) {
        const data = await response.json();
        setReviews(data.data.reviews);
        setPage(1);
        setHasMore(data.data.pagination.hasNext);
      }
    } catch (error) {
      console.error("Failed to apply filters:", error);
    } finally {
      setLoading(false);
    }
  }, [productId, sortBy, filterRating, reviews.length]);

  // Apply filters when they change
  useEffect(() => {
    if (isOpen && (sortBy !== "newest" || filterRating !== "all")) {
      applyFiltersAndSort();
    }
  }, [sortBy, filterRating, isOpen, applyFiltersAndSort]);

  // Render stars
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

  // Format date
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

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-gray-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">جميع التقييمات</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              {totalReviews} تقييم للمنتج
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-900 dark:text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                فرز وتصفية:
              </span>
            </div>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="newest">الأحدث أولاً</option>
              <option value="oldest">الأقدم أولاً</option>
              <option value="highest">أعلى تقييم</option>
              <option value="lowest">أقل تقييم</option>
            </select>

            {/* Rating Filter */}
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all">جميع التقييمات</option>
              <option value="5">5 نجوم</option>
              <option value="4">4 نجوم</option>
              <option value="3">3 نجوم</option>
              <option value="2">نجمتان</option>
              <option value="1">نجمة واحدة</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="flex-1 overflow-y-auto">
          {reviews.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Star className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-700" />
                <p className="text-gray-500 dark:text-slate-400">
                  لا توجد تقييمات تطابق المعايير المحددة
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-slate-800">
              {reviews.map((review, index) => (
                <div key={`${review.id}-${index}`} className="p-6">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* User Avatar */}
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {review.userName?.charAt(0)?.toUpperCase() || "م"}
                      </div>

                      <div>
                        <div className="font-medium text-gray-900 dark:text-slate-100">
                          {review.userName || "مستخدم مجهول"}
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
                    <div className="text-gray-700 dark:text-slate-300 leading-relaxed mb-3">
                      {review.comment}
                    </div>
                  )}

                  {/* Quality Labels */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      ✓ عملية شراء موثقة
                    </span>
                    {review.rating >= 4 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                        ⭐ تقييم ممتاز
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="p-6 border-t border-gray-200 dark:border-slate-800">
              <button
                onClick={loadMoreReviews}
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري التحميل...
                  </>
                ) : (
                  "تحميل المزيد"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
