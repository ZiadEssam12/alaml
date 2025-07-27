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

export function PaginationClient({ maxPage }) {
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;

  // Preserve existing query parameters when navigating
  const createPageUrl = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `?${params.toString()}`;
  };

  return (
    <Pagination className="py-10 ">
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
