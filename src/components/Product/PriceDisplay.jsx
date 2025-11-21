"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

/**
 * PriceDisplay Component
 * Shows current variant price or base product price
 *
 * Props:
 * - product: Base product object with basePrice/price
 * - selectedVariant: Currently selected variant or null
 * - variants: Array of all variants for price range calculation
 */
export default function PriceDisplay({
  product,
  selectedVariant,
  variants = [],
}) {
  // If variant is selected, show variant price
  if (selectedVariant) {
    const discountPercent = selectedVariant.originalPrice
      ? Math.round(
          ((selectedVariant.originalPrice - selectedVariant.price) /
            selectedVariant.originalPrice) *
            100
        )
      : 0;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-primary">
            {Number(selectedVariant.price).toLocaleString()} جنيه
          </span>
          {discountPercent > 0 && (
            <Badge
              variant="secondary"
              className="text-orange-600 bg-orange-100 border-orange-300"
            >
              -{discountPercent}%
            </Badge>
          )}
        </div>
        {selectedVariant.originalPrice &&
          selectedVariant.originalPrice > selectedVariant.price && (
            <p className="text-sm text-muted-foreground line-through">
              {Number(selectedVariant.originalPrice).toLocaleString()} جنيه
            </p>
          )}
      </div>
    );
  }

  // No variant selected - show base price or price range
  const prices = variants
    ?.filter((v) => v.isActive)
    .map((v) => Number(v.price))
    .sort((a, b) => a - b);

  if (prices && prices.length > 1) {
    const minPrice = prices[0];
    const maxPrice = prices[prices.length - 1];
    const samePrice = minPrice === maxPrice;

    return (
      <div className="space-y-2">
        <div className="text-3xl font-bold text-primary">
          {samePrice
            ? `${minPrice.toLocaleString()} جنيه`
            : `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()} جنيه`}
        </div>
        {samePrice ? null : (
          <p className="text-sm text-muted-foreground">
            السعر يختلف حسب الخيارات المختارة
          </p>
        )}
      </div>
    );
  }

  // Single price or base price
  const displayPrice = product.price || product.basePrice || 0;
  return (
    <div className="space-y-2">
      <div className="text-3xl font-bold text-primary">
        {Number(displayPrice).toLocaleString()} جنيه
      </div>
    </div>
  );
}
