"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const pathName = usePathname();

  useEffect(() => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  }, [pathName]);

  const router = useRouter();
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const searchAPI = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) return [];

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/search?q=${searchQuery}`
      );
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error("Search API error:", error);
      toast.error("فشل في جلب نتائج البحث");
    }

    return [];
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim()) {
        setIsLoading(true);
        try {
          const searchResults = await searchAPI(query);
          setResults(searchResults);
          setIsOpen(searchResults.length > 0);
          setSelectedIndex(-1);
        } catch (error) {
          console.error("Search failed:", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchAPI]);

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        } else {
          router.push(`/products?q=${encodeURIComponent(query)}`);
          setQuery("");
          setIsOpen(false);
          setSelectedIndex(-1);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultClick = (result) => {
    if (!result) {
      toast.error("Invalid result selected");
      return;
    }
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);

    if (result.entityType === "offer") {
      if (result.scope === "product" && result.product?.slug) {
        router.push(`/products/${result.product.slug}`);
      } else if (result.scope === "category" && result.categoryId) {
        router.push(`/offers/${result.categoryId}`);
      } else {
        router.push("/offers");
      }
    } else {
      router.push(`/products/${result.slug}`);
    }
  };

  const getResultHref = (result) => {
    if (result.entityType === "offer") {
      if (result.scope === "product" && result.product?.slug) {
        return `/products/${result.product.slug}`;
      } else if (result.scope === "category" && result.categoryId) {
        return `/offers/${result.categoryId}`;
      }
      return "/offers";
    }
    return `/products/${result.slug}`;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fix for the 'Cannot read properties of undefined (reading 'trim')' error
  const safeQuery = query || "";

  return (
    <div className="w-full lg:w-lg mr-auto" ref={resultsRef}>
      <div className="relative z-50">
        {isLoading ? (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2  animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
        ) : (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        )}
        <Input
          ref={inputRef}
          type="text"
          placeholder="ابحث..."
          value={safeQuery}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsOpen(true);
          }}
          className="pr-2 h-10 text-base rounded-lg border-2 focus:border-primary transition-colors"
        />
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute w-screen lg:w-lg right-0 translate-x-0 lg:right-1/2 -mt-10 pt-10 lg:translate-x-1/2 bg-popover border border-border rounded-lg shadow-lg z-40">
          <div className=" max-h-80 overflow-y-auto">
            {results.map((result, index) => (
              <Link
                href={getResultHref(result)}
                key={result.id}
                className={cn(
                  "block w-full text-left px-4 py-5 hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border last:border-b-0 focus:outline-none focus:bg-accent focus:text-accent-foreground",
                  selectedIndex === index && "bg-accent text-accent-foreground"
                )}
              >
                {result.entityType === "offer" ? (
                  <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4 text-green-600 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{result.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {result.type === "percentage"
                          ? `${result.value}% خصم`
                          : `${result.value} ج.م خصم`}
                        {result.scope === "product" &&
                          result.product &&
                          ` على ${result.product.name}`}
                        {result.scope === "category" &&
                          result.category &&
                          ` على قسم ${result.category.name}`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="font-medium text-sm flex justify-between items-center">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-1">
                      <p>{result.name}</p>
                      <div className="flex gap-1">
                        <p>في</p>
                        <p className="text-primary">{result.category.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <p className="text-primary">{result.price}</p>
                      <p>جنيه</p>
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query.trim() && results.length === 0 && !isLoading && (
        <div className="absolute w-screen lg:w-lg right-0 translate-x-0 lg:right-1/2  lg:translate-x-1/2 -mt-10 pt-10 bg-popover border border-border rounded-lg shadow-lg z-40">
          <div className="max-h-80 overflow-y-auto p-4 text-center text-muted-foreground">
            لا يوجد نتائج لـ "{query}"
          </div>
        </div>
      )}
    </div>
  );
}
