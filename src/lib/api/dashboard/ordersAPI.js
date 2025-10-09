import { cookies } from "next/headers";

export const getOrders = async (page = 1, pageSize = 10, q = "") => {
  try {
    const params = new URLSearchParams({ page, pageSize });
    const cookieStore = await cookies();
    const token =
      cookieStore.get("authjs.session-token")?.value ||
      cookieStore.get("__Secure-authjs.session-token")?.value;

    if (q) params.set("q", q);

    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL
      }/dashboard/order?${params.toString()}`,
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch orders");
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { data: [], pagination: {} };
  }
};

export const getOrder = async (id) => {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("authjs.session-token")?.value ||
      cookieStore.get("__Secure-authjs.session-token")?.value;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/order/${id}`,
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return {
      ...data,
      couponCode: data.couponCode || "-",
      couponType: data.couponType || "-",
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/order/${orderId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );

    if (!res.ok) {
      throw new Error("فشل التحديث");
    }

    return await res.json();
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};
