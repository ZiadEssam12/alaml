// Server-side API functions for reviews management

export const fetchReviewsData = async ({ page, pageSize, status }) => {
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
    console.error("Error fetching reviews data:", error);
    return { reviews: [], pagination: {} };
  }
};
