"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function SearchDropdown({
  onInputChange,
  isCollapsed = false,
  onToggleCollapse,
  placeholder = "ابحث...",
  onResultSelect = null,
  selectedResult = null,
  disabled = false,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim() && query.length >= 3) {
        setIsLoading(true);
        try {
          const searchResults = await onInputChange(query);
          setResults(searchResults || []);
          setIsOpen((searchResults || []).length > 0);
          setSelectedIndex(-1);
        } catch (error) {
          console.error("Search failed:", error);
          toast.error("فشل في جلب نتائج البحث");
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
  }, [query, onInputChange]);

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

    if (onResultSelect && typeof onResultSelect === "function") {
      onResultSelect(result);
    }

    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const safeQuery = query || "";

  return (
    <div className="w-full relative" ref={containerRef}>
      {/* Collapsible Header */}
      {onToggleCollapse && (
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            <span>
              {selectedResult ? selectedResult.name : "البحث المتقدم"}{" "}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isCollapsed ? "-rotate-90" : ""
              }`}
            />
          </button>
        </div>
      )}

      {/* Selected Result Display */}
      {selectedResult && !isCollapsed && (
        <div className="flex items-center justify-between mb-2 p-2 bg-accent/50 rounded-md border">
          <span className="text-sm font-medium">{selectedResult.name}</span>
          <button
            type="button"
            onClick={() => {
              if (onResultSelect) {
                onResultSelect(null);
              }
            }}
            className="text-muted-foreground hover:text-destructive text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search Input - Hidden when collapsed */}
      {!isCollapsed && (
        <>
          {/* Input Container */}
          <div className="relative">
            {isLoading ? (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            )}
            <Input
              ref={inputRef}
              type="text"
              placeholder={selectedResult ? "تغيير الاختيار..." : placeholder}
              value={safeQuery}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (results.length > 0) {
                  setIsOpen(true);
                }
              }}
              className="pr-2 h-10 text-base rounded-lg border-2 focus:border-primary transition-colors"
              disabled={disabled}
            />
          </div>

          {/* Search Results Dropdown - Rendered via Portal Pattern */}
          {isOpen && results.length > 0 && (
            <div
              className="absolute w-full mt-1 bg-popover border border-border rounded-lg shadow-lg"
              style={{ zIndex: 9999 }}
            >
              <div className="max-h-80 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={result.id || index}
                    onClick={() => handleResultClick(result)}
                    className={cn(
                      "block w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border last:border-b-0 cursor-pointer focus:outline-none",
                      selectedIndex === index &&
                        "bg-accent text-accent-foreground"
                    )}
                  >
                    <div className="font-medium text-sm flex justify-between items-center">
                      <p className="font-semibold">{result.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {isOpen && safeQuery.trim() && results.length === 0 && !isLoading && (
            <div
              className="absolute w-full mt-1 bg-popover border border-border rounded-lg shadow-lg"
              style={{ zIndex: 9999 }}
            >
              <div className="max-h-80 overflow-y-auto p-4 text-center text-muted-foreground">
                لا يوجد نتائج لـ "{query}"
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
