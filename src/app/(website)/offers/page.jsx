import { getCategoriesOffers } from "@/lib/api/shop/offers";
import OffersContent from "./OffersContent";

export const metadata = {
  title: "العروض والخصومات | alaml",
  description:
    "اكتشف عروضنا المميزة والخصومات الحصرية على جميع الفئات والمنتجات",
};

export default async function OffersPage({ searchParams }) {
  const currentPage = parseInt((await searchParams).page || "1", 10);

  let initialData = {
    categoriesWithOffers: [],
    productsWithOffers: [],
    pagination: { page: 1, limit: 10, maxPage: 1 },
  };
  let error = null;

  try {
    const result = await getCategoriesOffers({ page: currentPage });

    if (result.error) {
      error = result.error;
      initialData = result.data || initialData;
    } else {
      initialData = result;
    }
  } catch (err) {
    console.error("Error fetching offers:", err);
    error = "فشل تحميل العروض";
  }

  return (
    <OffersContent
      initialData={initialData}
      currentPage={currentPage}
      error={error}
    />
  );
}
