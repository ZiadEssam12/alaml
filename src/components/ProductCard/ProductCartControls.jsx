"use client";

import React, { useContext } from "react";
import AddToCartButton from "./AddToCartButton";
import OptionPicker from "@/components/Product/OptionPicker";
import PriceDisplay from "@/components/Product/PriceDisplay";
import useVariantSelection from "@/hooks/useVariantSelection";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ProductCartControls({
  product,
  options = [],
  variants = [],
}) {
  const { selectedValues, setSelected, selectedVariant, isComplete } =
    useVariantSelection(options, variants);

  const hasVariants = options.length > 0 && variants.length > 0;

  // If product has no variants, use simple add to cart
  if (!hasVariants) {
    return (
      <div className="space-y-4">
        <PriceDisplay product={product} selectedVariant={null} variants={[]} />
        <AddToCartButton
          product={product}
          quantity={1}
          showQuantityControls={true}
          className="w-full h-12 text-base font-medium relative overflow-hidden group"
          size="lg"
        />
      </div>
    );
  }

  // Product with variants
  return (
    <div className="space-y-6">
      {/* Option Pickers */}
      <div className="space-y-4">
        {options.map((option) => (
          <OptionPicker
            key={option.id}
            option={option}
            selectedValueId={selectedValues[option.id]}
            onSelect={(valueId) => setSelected(option.id, valueId)}
          />
        ))}
      </div>

      {/* Price Display */}
      <div className="border-t pt-4">
        <PriceDisplay
          product={product}
          selectedVariant={selectedVariant}
          variants={variants}
        />
      </div>

      {/* Stock Status */}
      {selectedVariant && (
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border">
          <div
            className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${
              selectedVariant.stockQuantity > 10
                ? "bg-green-500"
                : selectedVariant.stockQuantity > 0
                ? "bg-orange-500"
                : "bg-red-500"
            }`}
          />
          <div>
            <p className="text-sm font-medium">
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

      {/* Add to Cart Button */}
      {!isComplete ? (
        <Button
          disabled
          variant="outline"
          className="w-full h-12 text-base"
          size="lg"
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          اختر جميع الخيارات المطلوبة
        </Button>
      ) : !selectedVariant?.isActive ? (
        <Button
          disabled
          variant="outline"
          className="w-full h-12 text-base"
          size="lg"
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          هذا الخيار غير متاح
        </Button>
      ) : selectedVariant.stockQuantity === 0 ? (
        <Button
          disabled
          variant="outline"
          className="w-full h-12 text-base"
          size="lg"
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          غير متوفر الآن
        </Button>
      ) : (
        <AddToCartButton
          product={product}
          quantity={1}
          variantId={selectedVariant.id}
          showQuantityControls={true}
          className="w-full h-12 text-base font-medium relative overflow-hidden group"
          size="lg"
        />
      )}
    </div>
  );
}
