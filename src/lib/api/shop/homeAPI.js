import { cookies } from "next/headers";

export async function getHomeData() {
  const cookiesStore = await cookies();
  const token =
    cookiesStore.get("authjs.session-token")?.value ||
    cookiesStore.get("__Secure-authjs.session-token")?.value;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/home`, {
      next: { revalidate: 3600 }, // Revalidate every hour (ISR)
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch home data");
    }

    const response = await res.json();
    const { categories, products } = response.data || response;
    return { categories: categories || [], products: products || [] };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return { categories: [], products: [] };
  }
}
