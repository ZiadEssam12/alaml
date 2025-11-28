"use client";

import { useState, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ProductCartControlsWrapper } from "@/components/ProductCard/ProductCartControlsWrapper";
import { Package, Truck, Shield, Star } from "lucide-react";
import PriceDisplay from "@/components/Product/PriceDisplay";
import { useSearchParams, useRouter } from "next/navigation";

export function ProductDetailsClient({ displayProduct, options, variants }) {
  const [selectedVariant, setSelectedVariant] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Find variant based on selected option values
  const handleVariantChange = useCallback(
    (variant) => {
      setSelectedVariant(variant);

      // Append variant ID to URL
      if (variant?.id) {
        const params = new URLSearchParams(searchParams);
        params.set("variant", variant.id);
        router.replace(`?${params.toString()}`);
      }
    },
    [searchParams, router]
  );

  const currentVariantId = searchParams.get("variant");

  // On initial load, set the selected variant if specified in URL
  useEffect(() => {
    if (currentVariantId && variants.length > 0) {
      const initialVariant = variants.find(
        (variant) => variant.id === currentVariantId
      );
      if (initialVariant) {
        setSelectedVariant(initialVariant);
      }
    }
  }, [currentVariantId, variants]);

  return (
    <div className="space-y-6 lg:col-span-3">
      {/* Product Status */}
      {!displayProduct.isActive && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
              <Package className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-red-800 dark:text-red-200">
                المنتج غير متاح للعامة
              </p>
              <p className="text-sm text-red-600 dark:text-red-300">
                هذا المنتج غير متاح للشراء حالياً
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Product Details */}
      <div className="bg-white dark:bg-card rounded-2xl shadow-lg p-8 border space-y-6">
        {/* Category and Title */}
        <div className="space-y-4">
          {displayProduct.category && (
            <a href={`/categories/${displayProduct.category.seoTitle}`}>
              <Badge variant="secondary" className="w-fit">
                {displayProduct.category.name}
              </Badge>
            </a>
          )}
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight mt-5">
            {displayProduct.name}
          </h1>
        </div>

        {/* Price and Stock - Right after product name */}
        <div className="space-y-3">
          <PriceDisplay
            product={displayProduct}
            selectedVariant={selectedVariant}
            variants={variants}
          />

          {selectedVariant && (
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border text-sm">
              <div
                className={`w-2.5 h-2.5 rounded-full mt-0.5 shrink-0 ${
                  selectedVariant.stockQuantity > 10
                    ? "bg-green-500"
                    : selectedVariant.stockQuantity > 0
                    ? "bg-orange-500"
                    : "bg-red-500"
                }`}
              />
              <div>
                <p className="font-medium">
                  {selectedVariant.stockQuantity > 10
                    ? "متوفر"
                    : selectedVariant.stockQuantity > 0
                    ? "كمية محدودة"
                    : "غير متوفر"}
                </p>
                <p className="text-xs text-muted-foreground">
                  ({selectedVariant.stockQuantity} قطعة متاحة)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">وصف المنتج</h2>
          <p className="text-muted-foreground leading-relaxed">
            {displayProduct.description}
          </p>
        </div>

        {/* Add to Cart Section - Full controls */}
        <div className="pt-6 border-t">
          <ProductCartControlsWrapper
            product={displayProduct}
            options={options}
            variants={variants}
            onVariantChange={handleVariantChange}
          />
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-card rounded-xl p-4 border text-center">
          <Truck className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">شحن مجاني</p>
          <p className="text-xs text-muted-foreground">
            على الطلبات فوق 500 جنيه
          </p>
        </div>
        <div className="bg-white dark:bg-card rounded-xl p-4 border text-center">
          <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">ضمان الجودة</p>
          <p className="text-xs text-muted-foreground">منتجات أصلية 100%</p>
        </div>
        <div className="bg-white dark:bg-card rounded-xl p-4 border text-center">
          <Star className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">تقييم عالي</p>
          <p className="text-xs text-muted-foreground">رضا العملاء</p>
        </div>
      </div>
    </div>
  );
}
