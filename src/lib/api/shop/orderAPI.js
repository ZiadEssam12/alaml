import { getUserTokenFromHeaders } from "@/lib/auth-helpers";

export async function getOrders() {
  const userToken = await getUserTokenFromHeaders();

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/order`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch orders");
    }

    const { data: orders = [], pagination = {} } = await res.json();
    return { orders, pagination };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { orders: [], pagination: {} };
  }
}

export async function getOrderDetails(orderId) {
  const userToken = await getUserTokenFromHeaders();

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/order/${orderId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch order details");
    }

    const { data } = await res.json();
    return data.order;
  } catch (error) {
    console.error("Error fetching order details:", error);
    return null;
  }
}
