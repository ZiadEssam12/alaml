export async function getCategoryDetails(slug) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/categories/${slug}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch category details");
    }

    const data = await res.json();
    const category = data.data;
    const pagination = data.pagination;
    const products = category.products;

    return { category, pagination, products };
  } catch (error) {
    console.error("Error fetching category details:", error);
    return { category: null, pagination: {}, products: [] };
  }
}
