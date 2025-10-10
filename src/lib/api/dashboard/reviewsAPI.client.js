// Client-side API functions for reviews management (no server-side dependencies)

export const fetchReviewsClient = async ({ page, pageSize, status }) => {
  try {
    const statusParam = status ? `&status=${status}` : "";
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/reviews?page=${page}&pageSize=${pageSize}${statusParam}`
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "فشل في جلب التقييمات");
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return { reviews: [], pagination: {} };
  }
};

export const approveReview = async (reviewId) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/reviews/${reviewId}/approve`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || "فشل في قبول التقييم. الرجاء المحاولة مرة أخرى"
      );
    }

    return await res.json();
  } catch (error) {
    console.error("Error approving review:", error);
    throw error;
  }
};

export const rejectReview = async (reviewId) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/reviews/${reviewId}/reject`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || "فشل في رفض التقييم. الرجاء المحاولة مرة أخرى"
      );
    }

    return await res.json();
  } catch (error) {
    console.error("Error rejecting review:", error);
    throw error;
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/reviews/${reviewId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || "فشل في حذف التقييم. الرجاء المحاولة مرة أخرى"
      );
    }

    return await res.json();
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};
