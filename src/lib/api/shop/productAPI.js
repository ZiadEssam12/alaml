import { cookies } from "next/headers";

export async function getProduct(slug) {
  const cookiesStore = await cookies();
  const token =
    cookiesStore.get("authjs.session-token")?.value ||
    cookiesStore.get("__Secure-authjs.session-token")?.value;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/product/${slug}`,
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) {
      const error = await res.json();
      return { error: error.message || "حدث خطأ ما، يرجى المحاولة مرة أخرى" };
    }
    const { data } = await res.json();
    return data;
  } catch (error) {
    console.log(error);
    return { error: "حدث خطأ ما، يرجى المحاولة مرة أخرى" };
  }
}

export async function getProducts({
  categories = [],
  minPrice = "",
  maxPrice = "",
  inStock = "",
  page = "1",
  q = "",
  sort = "new-to-old",
  rating = "",
} = {}) {
  const params = new URLSearchParams();
  if (categories) params.append("categories", categories);
  if (minPrice) params.append("minPrice", minPrice);
  if (maxPrice) params.append("maxPrice", maxPrice);
  if (inStock) params.append("inStock", inStock);
  if (page) params.append("page", page);
  if (q) params.append("q", q);
  if (sort) params.append("sort", sort);
  if (rating) params.append("rating", rating);

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/product?${params.toString()}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }

    const { data: products = [], pagination: { maxPage: totalPages } = {} } =
      await res.json();

    return { products, totalPages };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], totalPages: 0 };
  }
}
