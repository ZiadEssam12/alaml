export async function getCategoryDetails(slug, page = 1) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/categories/${slug}?page=${page}`,
      { cache: "no-store" }
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

export async function getAllActiveCategorySlugs() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/categories`, {
      cache: "revalidate",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch categories");
    }

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching category slugs:", error);
    return [];
  }
}
