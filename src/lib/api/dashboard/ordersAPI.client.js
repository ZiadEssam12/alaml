// Client-side API functions for orders (no server-side dependencies)

export const updateOrderStatusClient = async (orderId, status) => {
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
