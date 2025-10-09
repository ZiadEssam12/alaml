export const fetchCategories = async ({ page = 1, pageSize = 10, q = "" }) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/categories?page=${page}&pageSize=${pageSize}&q=${q}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch categories");
    }

    const categoriesData = await res.json();

    if (!Array.isArray(categoriesData.data)) {
      return { data: [], pagination: {} };
    }

    return categoriesData;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { data: [], pagination: {} };
  }
};

export const createCategory = async (categoryData) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/categories`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...categoryData, createdAt: new Date() }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to create category");
    }

    return await res.json();
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/categories/${categoryId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to update category");
    }

    return await res.json();
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/categories/${categoryId}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to delete category");
    }

    return await res.json();
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};
