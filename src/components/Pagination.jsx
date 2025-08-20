"use client";
import { useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

function PaginationClientCode({
  maxPage,
  currentPage: propCurrentPage,
  basePath,
}) {
  const searchParams = useSearchParams();
  const currentPage =
    propCurrentPage || parseInt(searchParams.get("page")) || 1;

  // Preserve existing query parameters when navigating
  const createPageUrl = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    const prefix = basePath ? basePath : "";
    return `${prefix}?${params.toString()}`;
  };

  return (
    <Pagination className="py-10">
      <PaginationContent>
        {/* Previous button */}
        <PaginationItem>
          <PaginationPrevious
            href={currentPage > 1 ? createPageUrl(currentPage - 1) : "#"}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {/* Page numbers */}
        {Array.from({ length: maxPage }, (_, index) => (
          <PaginationItem key={index}>
            <PaginationLink
              href={createPageUrl(index + 1)}
              isActive={currentPage === index + 1}
            >
              {index + 1}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Next button */}
        <PaginationItem>
          <PaginationNext
            href={currentPage < maxPage ? createPageUrl(currentPage + 1) : "#"}
            className={
              currentPage >= maxPage ? "pointer-events-none opacity-50" : ""
            }
            disabled={currentPage >= maxPage}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

// Skeleton component for pagination loading state
function PaginationSkeleton() {
  return (
    <div className="py-10">
      <div className="flex items-center justify-center space-x-1">
        {/* Previous button skeleton */}
        <Skeleton className="h-10 w-20" />

        {/* Page number skeletons */}
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-10" />
        ))}

        {/* Next button skeleton */}
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

export function PaginationClient({ maxPage, currentPage, basePath }) {
  return (
    <Suspense fallback={<PaginationSkeleton />}>
      <PaginationClientCode
        maxPage={maxPage}
        currentPage={currentPage}
        basePath={basePath}
      />
    </Suspense>
  );
}
