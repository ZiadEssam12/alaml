"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, Filter, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function ProductFiltersCode() {
  const isMobile = useIsMobile();
  const router = useRouter();

  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    categories: [],
    minPrice: "",
    maxPrice: "",
    rating: 0,
    inStock: false,
  });
  const [categories, setCategories] = useState([]);
  const [showScrollbar, setShowScrollbar] = useState(false);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/categories`,
          {
            next: { revalidate: 3600 },
          }
        );
        const categoriesList = await res.json();
        // Using your test data - replace with: setCategories(categoriesList.data);

        setCategories(categoriesList.data);

        // Calculate if scrollbar is needed (assuming each item is ~40px height)
        const itemHeight = 40; // approximate height per category item
        const maxHeight = 200; // max-h-[200px]
        const totalHeight = categoriesList.data.length * itemHeight;
        setShowScrollbar(totalHeight > maxHeight);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    getCategories();
  }, []);

  useEffect(() => {
    // Initialize filters from URL params
    initializeFiltersFromURL();
  }, []);

  const initializeFiltersFromURL = () => {
    const urlCategories = searchParams.get("categories")?.split(",") || [];
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const rating = parseInt(searchParams.get("rating")) || 0;
    const inStock = searchParams.get("inStock") === "true";

    setFilters({
      categories: urlCategories,
      minPrice,
      maxPrice,
      rating,
      inStock,
    });
  };

  const applyFilters = () => {
    updateURLAndNavigate();
  };

  const updateURLAndNavigate = () => {
    const params = new URLSearchParams();

    if (filters.categories.length > 0) {
      // filters.categories already contains seoTitles as strings
      const categorySlugs = filters.categories.join(",");
      params.set("categories", categorySlugs);
    }
    if (filters.minPrice) {
      params.set("minPrice", filters.minPrice);
    }
    if (filters.maxPrice) {
      params.set("maxPrice", filters.maxPrice);
    }
    if (filters.rating > 0) {
      params.set("rating", filters.rating.toString());
    }
    if (filters.inStock) {
      params.set("inStock", "true");
    }

    const queryString = params.toString();
    const newURL = queryString ? `?${queryString}` : window.location.pathname;

    router.push(newURL);
  };

  const handleCategoryChange = (seoTitle, checked) => {
    setFilters((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, seoTitle]
        : prev.categories.filter((title) => title !== seoTitle),
    }));
  };

  const handlePriceChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      minPrice: "",
      maxPrice: "",
      rating: 0,
      inStock: false,
    });

    router.push(window.location.pathname);
  };

  if (isMobile) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Filter className="h-5 w-5" />
            <span>تصفية المنتجات</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تصفية المنتجات</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            <CardContent className="space-y-6">
              {/* Categories Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  الأقسام
                </Label>
                <div
                  className={`space-y-2 max-h-[200px] ${
                    showScrollbar
                      ? "overflow-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
                      : "overflow-hidden"
                  }`}
                >
                  {categories?.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center space-x-2 "
                    >
                      <Checkbox
                        id={category.id}
                        checked={filters.categories.includes(category.seoTitle)}
                        onCheckedChange={(checked) =>
                          handleCategoryChange(category.seoTitle, checked)
                        }
                      />
                      <Label
                        htmlFor={category.id}
                        className="text-sm cursor-pointer"
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Price Range Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  نطاق السعر
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label
                      htmlFor="minPrice"
                      className="text-xs text-muted-foreground"
                    >
                      الحد الأدنى
                    </Label>
                    <Input
                      id="minPrice"
                      type="number"
                      placeholder="0"
                      value={filters.minPrice}
                      onChange={(e) =>
                        handlePriceChange("minPrice", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="maxPrice"
                      className="text-xs text-muted-foreground"
                    >
                      الحد الأقصى
                    </Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      placeholder="1000"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        handlePriceChange("maxPrice", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>ج.م</span>
                  <span>ج.م</span>
                </div>
              </div>

              <Separator />

              {/* Rating Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  التقييم
                </Label>
                <RadioGroup
                  value={filters.rating.toString()}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      rating: parseInt(value),
                    }))
                  }
                >
                  {[4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={rating.toString()}
                        id={`rating-${rating}`}
                      />
                      <Label
                        htmlFor={`rating-${rating}`}
                        className="flex items-center space-x-1 cursor-pointer"
                      >
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm">فأكثر</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              {/* Stock Filter */}
              <div className="flex items-center space-x-2 ">
                <Checkbox
                  id="inStock"
                  checked={filters.inStock}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, inStock: checked }))
                  }
                />
                <Label htmlFor="inStock" className="text-sm cursor-pointer">
                  متوفر في المخزون فقط
                </Label>
              </div>

              <Separator />

              {/* Apply Filters Button */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex-1"
                >
                  مسح الكل
                </Button>
                <Button onClick={applyFilters} className="flex-1">
                  تطبيق التصفية
                </Button>
              </div>
            </CardContent>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 ">
            <Filter className="h-5 w-5" />
            <span>تصفية المنتجات</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories Filter */}
        <div>
          <Label className="text-sm font-medium mb-3 block">الأقسام</Label>
          <div
            className={`space-y-2 max-h-[200px] ${
              showScrollbar
                ? "overflow-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
                : "overflow-hidden"
            }`}
          >
            {categories?.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.seoTitle}
                  checked={filters.categories.includes(category.seoTitle)}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category.seoTitle, checked)
                  }
                />
                <Label
                  htmlFor={category.seoTitle}
                  className="text-sm cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Price Range Filter */}
        <div>
          <Label className="text-sm font-medium mb-3 block">نطاق السعر</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label
                htmlFor="minPrice"
                className="text-xs text-muted-foreground"
              >
                الحد الأدنى
              </Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => handlePriceChange("minPrice", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="maxPrice"
                className="text-xs text-muted-foreground"
              >
                الحد الأقصى
              </Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="1000"
                value={filters.maxPrice}
                onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>ج.م</span>
            <span>ج.م</span>
          </div>
        </div>

        <Separator />

        {/* Rating Filter */}
        <div>
          <Label className="text-sm font-medium mb-3 block">التقييم</Label>
          <RadioGroup
            value={filters.rating.toString()}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                rating: parseInt(value),
              }))
            }
          >
            {[4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={rating.toString()}
                  id={`rating-${rating}`}
                />
                <Label
                  htmlFor={`rating-${rating}`}
                  className="flex items-center space-x-1 cursor-pointer"
                >
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm">فأكثر</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        {/* Stock Filter */}
        <div className="flex items-center space-x-2 ">
          <Checkbox
            id="inStock"
            checked={filters.inStock}
            onCheckedChange={(checked) =>
              setFilters((prev) => ({ ...prev, inStock: checked }))
            }
          />
          <Label htmlFor="inStock" className="text-sm cursor-pointer">
            متوفر في المخزون فقط
          </Label>
        </div>

        <Separator />

        {/* Apply Filters Button */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearFilters} className="flex-1">
            مسح الكل
          </Button>
          <Button onClick={applyFilters} className="flex-1">
            تطبيق التصفية
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton fallback for the filter
function ProductFiltersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32 mb-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories Skeleton */}
        <div>
          <Skeleton className="h-4 w-24 mb-3" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
        <Separator />
        {/* Price Skeleton */}
        <div>
          <Skeleton className="h-4 w-24 mb-3" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Separator />
        {/* Rating Skeleton */}
        <div>
          <Skeleton className="h-4 w-24 mb-3" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
        <Separator />
        {/* Stock Skeleton */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Separator />
        {/* Buttons Skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

// Export with Suspense wrapper
export function ProductFilters(props) {
  return (
    <Suspense fallback={<ProductFiltersSkeleton />}>
      <ProductFiltersCode {...props} />
    </Suspense>
  );
}
