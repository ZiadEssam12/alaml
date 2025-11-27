export async function getCategoriesOffers({ page = 1 }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE}/api/offers?page=${page}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching categories offers:", error);
    return {
      error: "حدث خطأ أثناء جلب العروض",
      status: 500,
      data: {
        categoriesWithOffers: [],
        pagination: { page, limit: 10 },
      },
    };
  }
}
