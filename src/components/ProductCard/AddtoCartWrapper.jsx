"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "../ui/skeleton";

export default function AddtoCartSkeleton() {
  return (
    <div className="flex flex-col gap-4 h-full mt-8">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="h-6 w-20" /> {/* Category badge */}
        <Skeleton className="h-8 w-32" /> {/* Product name */}
      </div>
      <Skeleton className="h-6 w-24 mb-2" /> {/* Price */}
      <Skeleton className="h-4 w-40 mb-2" /> {/* Description */}
      <Skeleton className="h-4 w-24 mb-2" /> {/* Stock quantity */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16" /> {/* Label */}
          <div className="bg-gray-100 dark:bg-gray-800 flex gap-3 rounded items-stretch px-2 py-1">
            <Skeleton className="h-8 w-8 rounded" /> {/* - button */}
            <Skeleton className="h-8 w-12 rounded" /> {/* Quantity */}
            <Skeleton className="h-8 w-8 rounded" /> {/* + button */}
          </div>
        </div>
        <Skeleton className="h-10 w-full mt-2 rounded" />{" "}
        {/* Add to cart button */}
      </div>
    </div>
  );
}

const AddtoCartDynamic = dynamic(() => import("./AddtoCart"), {
  ssr: false,
  loading: () => <AddtoCartSkeleton />,
});

export function ProductInfoWrapper({ product }) {
  return <AddtoCartDynamic product={product} />;
}
