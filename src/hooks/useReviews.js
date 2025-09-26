"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

// Custom hook for fetching product reviews with pagination
export function useProductReviews(productId, initialData = null) {
  const [reviews, setReviews] = useState(initialData?.reviews || []);
  const [stats, setStats] = useState(
    initialData?.stats || { averageRating: 0, totalReviews: 0 }
  );
  const [pagination, setPagination] = useState(
    initialData?.pagination || { page: 1, hasNext: false }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(
    async (page = 1, options = {}) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams({
          page: page.toString(),
          pageSize: options.pageSize || "10",
          ...(options.sort && { sort: options.sort }),
          ...(options.rating && { rating: options.rating }),
        });

        const response = await fetch(
          `/api/reviews/product/${productId}?${searchParams}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await response.json();

        if (page === 1) {
          setReviews(data.data.reviews);
        } else {
          setReviews((prev) => [...prev, ...data.data.reviews]);
        }

        setStats(data.data.stats);
        setPagination(data.data.pagination);

        return data.data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [productId, loading]
  );

  const loadMore = useCallback(() => {
    if (pagination.hasNext && !loading) {
      return fetchReviews(pagination.page + 1);
    }
  }, [fetchReviews, pagination.hasNext, pagination.page, loading]);

  const refresh = useCallback(() => {
    return fetchReviews(1);
  }, [fetchReviews]);

  return {
    reviews,
    stats,
    pagination,
    loading,
    error,
    fetchReviews,
    loadMore,
    refresh,
  };
}

// Custom hook for user review permissions
export function useUserReviewPermissions(productId) {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState({
    canReview: false,
    hasPurchased: false,
    hasReviewed: false,
    loading: true,
  });

  useEffect(() => {
    async function checkPermissions() {
      if (status === "loading") return;

      if (!session?.user?.id) {
        setPermissions({
          canReview: false,
          hasPurchased: false,
          hasReviewed: false,
          loading: false,
        });
        return;
      }

      try {
        const response = await fetch(
          `/api/reviews/user-permissions?productId=${productId}`
        );

        if (response.ok) {
          const data = await response.json();
          setPermissions({
            canReview: data.hasPurchased && !data.hasReviewed,
            hasPurchased: data.hasPurchased,
            hasReviewed: data.hasReviewed,
            loading: false,
          });
        } else {
          setPermissions((prev) => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error("Error checking review permissions:", error);
        setPermissions((prev) => ({ ...prev, loading: false }));
      }
    }

    checkPermissions();
  }, [session, status, productId]);

  return permissions;
}

// Custom hook for submitting reviews
export function useReviewSubmission() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitReview = useCallback(async (reviewData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setSuccess(true);
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    submitReview,
    loading,
    error,
    success,
    reset,
  };
}

// Utility functions for reviews
export const reviewUtils = {
  // Format review date
  formatReviewDate(dateString, locale = ar) {
    try {
      const { formatDistanceToNow } = require("date-fns");
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale,
      });
    } catch {
      return "منذ فترة";
    }
  },

  // Truncate review comment
  truncateComment(comment, maxLength = 150) {
    if (!comment || comment.length <= maxLength) return comment;
    return comment.substring(0, maxLength) + "...";
  },

  // Get rating text in Arabic
  getRatingText(rating) {
    const ratingTexts = {
      1: "ضعيف جداً",
      2: "ضعيف",
      3: "متوسط",
      4: "جيد",
      5: "ممتاز",
    };
    return ratingTexts[rating] || "غير محدد";
  },

  // Calculate rating percentage
  calculateRatingPercentage(count, total) {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  },

  // Get positive rating percentage
  getPositiveRatingPercentage(distribution) {
    const total = distribution.reduce((sum, count) => sum + count, 0);
    const positiveCount = distribution[3] + distribution[4]; // 4 and 5 stars
    return this.calculateRatingPercentage(positiveCount, total);
  },

  // Validate review form
  validateReviewForm(rating, comment) {
    const errors = {};

    if (!rating || rating < 1 || rating > 5) {
      errors.rating = "يرجى اختيار تقييم من 1 إلى 5 نجوم";
    }

    if (!comment || comment.trim().length < 10) {
      errors.comment = "يرجى كتابة تعليق لا يقل عن 10 أحرف";
    }

    if (comment && comment.length > 500) {
      errors.comment = "التعليق لا يجب أن يزيد عن 500 حرف";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};
