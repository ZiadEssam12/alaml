"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "../ui/skeleton";

export default function ProductCartControlsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Quantity Selector Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" /> {/* Label */}
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-input rounded-lg bg-background">
            <Skeleton className="h-10 w-10 rounded-none" /> {/* Minus button */}
            <Skeleton className="h-10 w-16" /> {/* Quantity */}
            <Skeleton className="h-10 w-10 rounded-none" /> {/* Plus button */}
          </div>
          <Skeleton className="h-4 w-32" /> {/* Quantity info */}
        </div>
      </div>

      {/* Add to Cart Button Skeleton */}
      <Skeleton className="h-12 w-full rounded-lg" />

      {/* Additional Info Skeleton */}
      <div className="text-center">
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  );
}

const ProductCartControlsDynamic = dynamic(() => import("./AddtoCart"), {
  ssr: false,
  loading: () => <ProductCartControlsSkeleton />,
});

export function ProductCartControlsWrapper({ product }) {
  return <ProductCartControlsDynamic product={product} />;
}
