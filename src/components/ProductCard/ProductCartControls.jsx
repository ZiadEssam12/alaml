"use client";

import React, { use, useEffect } from "react";
import AddToCartButton from "./AddToCartButton";
import OptionPicker from "@/components/Product/OptionPicker";
import PriceDisplay from "@/components/Product/PriceDisplay";
import useVariantSelection from "@/hooks/useVariantSelection";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ProductCartControls({
  product,
  options = [],
  variants = [],
  onVariantChange,
}) {
  const { selectedValues, setSelected, selectedVariant, isComplete } =
    useVariantSelection(options, variants);

  const hasVariants = options.length > 0 && variants.length > 0;
  const searchParams = useSearchParams();
  const variantIdFromUrl = searchParams.get("variant");

  // Automatically select variant from URL or first available option
  useEffect(() => {
    if (!hasVariants || options.length === 0) return;

    // If variant ID is in URL, find it and select its options
    if (variantIdFromUrl) {
      const variantFromUrl = variants.find((v) => v.id === variantIdFromUrl);
      if (variantFromUrl) {
        // Select options from this variant
        variantFromUrl.options?.forEach((variantOption) => {
          setSelected(variantOption.optionId, variantOption.valueId);
        });
        return;
      }
    }

    // Only auto-select first available if no variant ID in URL and no variant selected yet
    if (!variantIdFromUrl && !selectedVariant) {
      // Build a map of available value IDs per option
      const availableValuesByOption = new Map();

      variants.forEach((variant) => {
        variant.options?.forEach((variantOption) => {
          if (!availableValuesByOption.has(variantOption.optionId)) {
            availableValuesByOption.set(variantOption.optionId, new Set());
          }
          availableValuesByOption
            .get(variantOption.optionId)
            .add(variantOption.valueId);
        });
      });

      // Select first available value for each option
      options.forEach((option) => {
        const availableIds = availableValuesByOption.get(option.id);
        if (availableIds) {
          const firstValue = option.values.find((value) =>
            availableIds.has(value.id)
          );
          if (firstValue) {
            setSelected(option.id, firstValue.id);
          }
        }
      });
    }
  }, [variantIdFromUrl]);

  // Notify parent when variant changes
  useEffect(() => {
    if (onVariantChange) {
      onVariantChange(selectedVariant);
    }
  }, [selectedVariant, onVariantChange]);

  // If product has no variants, use simple add to cart
  if (!hasVariants) {
    return (
      <div className="space-y-4">
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
