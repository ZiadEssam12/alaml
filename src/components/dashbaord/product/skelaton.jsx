import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductCardSkeleton = () => (
  <Card className="border-transparent shadow-none">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />{" "}
          {/* Placeholder for product name */}
          <Skeleton className="h-4 w-1/2" />{" "}
          {/* Placeholder for author/muted text */}
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <Skeleton className="w-full h-32 rounded" />{" "}
      {/* Placeholder for product image */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <Skeleton className="h-4 w-1/3" />{" "}
          {/* Placeholder for 'Price' label */}
          <Skeleton className="h-5 w-2/3 mt-1" />{" "}
          {/* Placeholder for price value */}
        </div>
        <div>
          <Skeleton className="h-4 w-1/3" />{" "}
          {/* Placeholder for 'Stock' label */}
          <Skeleton className="h-5 w-2/3 mt-1" />{" "}
          {/* Placeholder for stock value */}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <Skeleton className="h-4 w-1/3" />{" "}
          {/* Placeholder for 'Category' label */}
          <Skeleton className="h-5 w-2/3 mt-1" />{" "}
          {/* Placeholder for category name */}
        </div>
      </div>
      <div className="flex justify-end space-x-2 ">
        <Skeleton className="h-8 w-8 rounded" />{" "}
        {/* Placeholder for Edit button */}
        <Skeleton className="h-8 w-8 rounded" />{" "}
        {/* Placeholder for Delete button */}
      </div>
    </CardContent>
  </Card>
);
