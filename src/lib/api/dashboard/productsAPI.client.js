// Client-side API functions for products management (no server-side dependencies)

export const createProduct = async (productData) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/products`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...productData, createdAt: new Date() }),
      }
    );

    if (!res.ok) {
      throw new Error("Add failed");
    }

    return await res.json();
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/products/${productId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      }
    );

    if (!res.ok) {
      throw new Error("Update failed");
    }

    return await res.json();
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const toggleProductStatus = async (productId, isActive) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/products/${productId}/toggle-status`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      }
    );

    if (!res.ok) {
      throw new Error("Toggle failed");
    }

    return await res.json();
  } catch (error) {
    console.error("Error toggling product status:", error);
    throw error;
  }
};

export const fetchProductsDataClient = async ({ q, page, pageSize }) => {
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
