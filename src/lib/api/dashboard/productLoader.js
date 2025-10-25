/**
 * Load a single product by ID
 * Used in edit mode to fetch product details
 * @param {string} productId - The ID of the product to load
 * @returns {Promise<Object>} The product data
 */
export const loadProduct = async (productId) => {
  if (!productId) return null;

  try {
    const response = await fetch(`/api/dashboard/products/${productId}`);
    const data = await response.json();

    if (response.ok) {
      return data.data;
    } else {
      throw new Error(data.error || "فشل تحميل تفاصيل المنتج");
    }
  } catch (error) {
    console.error("Error loading product:", error);
    throw error;
  }
};
