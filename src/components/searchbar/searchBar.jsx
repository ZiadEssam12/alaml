"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
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
    setQuery(query || "");
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
    setQuery(result.title || "");
    setIsOpen(false);
    setSelectedIndex(-1);
    router.push(`/products/${result.slug}`);
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
    <div className="relative w-full lg:w-[200px] mx-auto" ref={resultsRef}>
      <div className="relative">
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
            if (results.length > 0) setIsOpen(true);
          }}
          className="pr-2 h-10 text-base rounded-lg border-2 focus:border-primary transition-colors"
        />
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full w-[90vw] lg:w-lg left-0 -translate-x-1/2 lg:right-1/2 translate-x-1/2 mt-4 bg-popover border border-border rounded-lg shadow-lg z-[52] max-h-80 overflow-y-auto">
          {results.map((result, index) => (
            <Link
              href={`/products/${result.slug}`}
              key={result.id}
              className={cn(
                "block w-full text-left px-4 py-5 hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border last:border-b-0 focus:outline-none focus:bg-accent focus:text-accent-foreground",
                selectedIndex === index && "bg-accent text-accent-foreground"
              )}
            >
              <div className="font-medium text-sm flex justify-between items-center">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2">
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
            </Link>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && query.trim() && results.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 px-4 py-6 text-center text-muted-foreground text-sm">
          لا يوجد نتائج لـ "{query}"
        </div>
      )}
    </div>
  );
}
