// Server-side API functions for products management

export const fetchProductsData = async ({ q, page, pageSize }) => {
  try {
    const productsRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/products?page=${page}&pageSize=${pageSize}&q=${q}`
    );

    if (!productsRes.ok) {
      throw new Error("Failed to fetch products data");
    }

    const data = await productsRes.json();
    const { products, categories } = data.data;
    const { pagination } = data;

    return { products, categories, pagination };
  } catch (error) {
    console.error("Error fetching products data:", error);
    return { products: [], categories: [], pagination: {} };
  }
};
