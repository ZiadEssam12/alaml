export const fetchCoupons = async ({ q, page, pageSize }) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/coupons?page=${page}&pageSize=${pageSize}&q=${q}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch coupons");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return { data: [], pagination: {} };
  }
};

export const createCoupon = async (couponData) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/coupons`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(couponData),
      }
    );

    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(`خطأ في الإضافة: ${errorMsg}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw error;
  }
};

export const updateCoupon = async (couponId, couponData) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/coupons/${couponId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(couponData),
      }
    );

    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(`خطأ في التحديث: ${errorMsg}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error updating coupon:", error);
    throw error;
  }
};

export const toggleCouponStatus = async (couponId, isActive) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/coupons/${couponId}/toggle-status`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      }
    );

    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(`خطأ في تغيير الحالة: ${errorMsg}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error toggling coupon status:", error);
    throw error;
  }
};
