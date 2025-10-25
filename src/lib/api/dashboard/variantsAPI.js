/**
 * Load all variants for a product
 * @param {string} productId - The ID of the product
 * @returns {Promise<Array>} Array of variants
 */
export const loadVariants = async (productId) => {
  try {
    const response = await fetch(
      `/api/dashboard/products/${productId}/variants`
    );
    const data = await response.json();
    if (response.ok) {
      return data.data || [];
    } else {
      throw new Error(data.error || "فشل في تحميل المتغيرات");
    }
  } catch (error) {
    console.error("Error loading variants:", error);
    throw error;
  }
};

/**
 * Load all options for a product
 * @param {string} productId - The ID of the product
 * @returns {Promise<Array>} Array of options
 */
export const loadOptions = async (productId) => {
  try {
    const response = await fetch(
      `/api/dashboard/products/${productId}/options`
    );
    const data = await response.json();
    if (response.ok) {
      return data.options || [];
    } else {
      throw new Error(data.error || "فشل في تحميل الخيارات");
    }
  } catch (error) {
    console.error("Error loading options:", error);
    throw error;
  }
};

/**
 * Generate variants from product options using Cartesian product
 * @param {string} productId - The ID of the product
 * @returns {Promise<Object>} Generation result with count of new variants
 */
export const generateVariants = async (productId) => {
  try {
    const response = await fetch(
      `/api/dashboard/products/${productId}/variants/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy: "cartesian",
          includeInactive: false,
        }),
      }
    );

    const data = await response.json();
    if (response.ok) {
      return data.generated;
    } else {
      throw new Error(data.error || "فشل في إنشاء المتغيرات");
    }
  } catch (error) {
    console.error("Error generating variants:", error);
    throw error;
  }
};

/**
 * Create a new variant
 * @param {string} productId - The ID of the product
 * @param {Object} variantData - The variant data
 * @returns {Promise<Object>} The created variant
 */
export const createVariant = async (productId, variantData) => {
  try {
    const response = await fetch(
      `/api/dashboard/products/${productId}/variants`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(variantData),
      }
    );

    const data = await response.json();
    if (response.ok) {
      return data.data;
    } else {
      throw new Error(data.error || "فشل في إنشاء المتغير");
    }
  } catch (error) {
    console.error("Error creating variant:", error);
    throw error;
  }
};

/**
 * Update an existing variant
 * @param {string} productId - The ID of the product
 * @param {string} variantId - The ID of the variant
 * @param {Object} variantData - The updated variant data
 * @returns {Promise<Object>} The updated variant
 */
export const updateVariant = async (productId, variantId, variantData) => {
  try {
    const response = await fetch(
      `/api/dashboard/products/${productId}/variants/${variantId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(variantData),
      }
    );

    const data = await response.json();
    if (response.ok) {
      return data.data;
    } else {
      throw new Error(data.error || "فشل في تحديث المتغير");
    }
  } catch (error) {
    console.error("Error updating variant:", error);
    throw error;
  }
};

/**
 * Delete a variant
 * @param {string} productId - The ID of the product
 * @param {string} variantId - The ID of the variant
 * @returns {Promise<Object>} Deletion result
 */
export const deleteVariant = async (productId, variantId) => {
  try {
    const response = await fetch(
      `/api/dashboard/products/${productId}/variants/${variantId}`,
      { method: "DELETE" }
    );

    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.error || "فشل في حذف المتغير");
    }
  } catch (error) {
    console.error("Error deleting variant:", error);
    throw error;
  }
};
