"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function SortingForm({ currentSort, currentFilters }) {
  const [sort, setSort] = useState(currentSort);
  const router = useRouter();
  const pathname = usePathname();

  const handleSortChange = (e) => {
    setSort(e.target.value);
    // Build URL with new sort
    const params = new URLSearchParams();
    if (currentFilters) {
      if (currentFilters.categories)
        params.append("categories", currentFilters.categories);
      if (currentFilters.minPrice)
        params.append("minPrice", currentFilters.minPrice);
      if (currentFilters.maxPrice)
        params.append("maxPrice", currentFilters.maxPrice);
      if (currentFilters.inStock)
        params.append("inStock", currentFilters.inStock);
      if (currentFilters.q) params.append("q", currentFilters.q);
    }
    params.append("sort", e.target.value);

    // Use current pathname to stay on the same page (categories or products)
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mb-4">
      <form className="flex items-center gap-4">
        <label htmlFor="sort" className="font-medium">
          ترتيب حسب:
        </label>
        <select
          id="sort"
          name="sort"
          value={sort}
          onChange={handleSortChange}
          className="border rounded px-3 py-2"
        >
          <option value="new-to-old">الأحدث أولاً</option>
          <option value="old-to-new">الأقدم أولاً</option>
          <option value="low-to-high">السعر من الأقل للأعلى</option>
          <option value="high-to-low">السعر من الأعلى للأقل</option>
          <option value="rating-high-to-low">التقييم من الأعلى للأقل</option>
          <option value="rating-low-to-high">التقييم من الأقل للأعلى</option>
        </select>
      </form>
    </div>
  );
}
