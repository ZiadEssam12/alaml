"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

/**
 * PriceDisplay Component
 * Shows current variant price or base product price with offer support
 *
 * Props:
 * - product: Base product object with basePrice/price and optional offer
 * - selectedVariant: Currently selected variant or null (may have offer)
 * - variants: Array of all variants for price range calculation
 */
export default function PriceDisplay({
  product,
  selectedVariant,
  variants = [],
}) {
  // If variant is selected, show variant price with offer if available
  if (selectedVariant) {
    const variantPrice = Number(selectedVariant.price);
    const variantOffer = selectedVariant.offer;

    // Check if variant has an active offer
    if (variantOffer && variantOffer.discountedPrice !== null) {
      const discountedPrice = Number(variantOffer.discountedPrice);
      const savings = variantPrice - discountedPrice;
      const discountPercent = Math.round((savings / variantPrice) * 100);

      return (
        <div className="space-y-2">
          {/* Offer Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="text-green-700 bg-green-100 border-green-300 flex items-center gap-1"
            >
              <Tag className="h-3 w-3" />
              {variantOffer.title}
            </Badge>
            {discountPercent > 0 && (
              <Badge
                variant="secondary"
                className="text-orange-600 bg-orange-100 border-orange-300"
              >
                وفر {discountPercent}%
              </Badge>
            )}
          </div>

          {/* Price display */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-primary">
              {discountedPrice.toLocaleString()} جنيه
            </span>
          </div>

          {/* Original price strikethrough */}
          <p className="text-sm text-muted-foreground line-through">
            {variantPrice.toLocaleString()} جنيه
          </p>

          {/* Savings amount */}
          <p className="text-sm text-green-600 font-medium">
            وفر {savings.toLocaleString()} جنيه
          </p>
        </div>
      );
    }

    // No offer - check for legacy originalPrice discount
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
            {variantPrice.toLocaleString()} جنيه
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

  // No variant selected - check for product offer first
  const productOffer = product.offer;
  const basePrice = Number(product.price || product.basePrice || 0);

  if (productOffer && productOffer.discountedPrice !== null) {
    const discountedPrice = Number(productOffer.discountedPrice);
    const savings = basePrice - discountedPrice;
    const discountPercent = Math.round((savings / basePrice) * 100);

    // Check if there are variants with different prices
    const prices = variants
      ?.filter((v) => v.isActive)
      .map((v) => Number(v.price))
      .sort((a, b) => a - b);

    // If there are variant prices, show range with offer indication
    if (prices && prices.length > 1) {
      const minPrice = prices[0];
      const maxPrice = prices[prices.length - 1];
      const samePrice = minPrice === maxPrice;

      return (
        <div className="space-y-2">
          {/* Offer Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="text-green-700 bg-green-100 border-green-300 flex items-center gap-1"
            >
              <Tag className="h-3 w-3" />
              {productOffer.title}
            </Badge>
          </div>

          <div className="text-3xl font-bold text-primary">
            {samePrice
              ? `${minPrice.toLocaleString()} جنيه`
              : `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()} جنيه`}
          </div>
          <p className="text-sm text-green-600 font-medium">
            عرض خاص - اختر الخيارات لمعرفة السعر النهائي
          </p>
        </div>
      );
    }

    // Single price with offer
    return (
      <div className="space-y-2">
        {/* Offer Badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="text-green-700 bg-green-100 border-green-300 flex items-center gap-1"
          >
            <Tag className="h-3 w-3" />
            {productOffer.title}
          </Badge>
          {discountPercent > 0 && (
            <Badge
              variant="secondary"
              className="text-orange-600 bg-orange-100 border-orange-300"
            >
              وفر {discountPercent}%
            </Badge>
          )}
        </div>

        {/* Price display */}
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-primary">
            {discountedPrice.toLocaleString()} جنيه
          </span>
        </div>

        {/* Original price strikethrough */}
        <p className="text-sm text-muted-foreground line-through">
          {basePrice.toLocaleString()} جنيه
        </p>

        {/* Savings amount */}
        <p className="text-sm text-green-600 font-medium">
          وفر {savings.toLocaleString()} جنيه
        </p>
      </div>
    );
  }

  // No offer - show base price or price range
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
  return (
    <div className="space-y-2">
      <div className="text-3xl font-bold text-primary">
        {basePrice.toLocaleString()} جنيه
      </div>
    </div>
  );
}
