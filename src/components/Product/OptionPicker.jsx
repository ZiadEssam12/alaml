"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * OptionPicker Component
 * Displays product option values with smart UI based on value type
 *
 * Props:
 * - option: ProductOption { id, name, presentation?, values[] }
 * - selectedValueId: Currently selected value ID
 * - onSelect: (valueId) => void callback when value selected
 * - disabled: Whether to disable all options
 */
export default function OptionPicker({
  option,
  selectedValueId,
  onSelect,
  disabled = false,
}) {
  // Determine UI type based on presentation
  const isColorOption =
    option.presentation === "color" ||
    option.name.includes("اللون") ||
    option.name.includes("Color");
  const isImageOption =
    option.presentation === "image" || option.values?.some((v) => v.imageUrl);

  // Color swatches UI
  if (isColorOption && option.values?.length > 0) {
    return (
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          {option.name}
        </label>
        <div className="flex flex-wrap gap-3">
          {option.values.map((value) => (
            <button
              key={value.id}
              onClick={() => !disabled && onSelect(value.id)}
              disabled={disabled}
              className={cn(
                "relative group transition-all",
                selectedValueId === value.id
                  ? "ring-2 ring-offset-2 ring-primary"
                  : ""
              )}
              title={value.value}
              aria-label={`Select ${value.value}`}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg border-2 transition-all shadow-sm",
                  selectedValueId === value.id
                    ? "border-primary"
                    : "border-muted-foreground/30 hover:border-muted-foreground/50"
                )}
                style={{
                  backgroundColor: value.hex || "#e5e7eb",
                }}
              />
              <span className="text-xs font-medium mt-1 block text-foreground">
                {value.value}
              </span>
              <div className="absolute top-full left-0 mt-1 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {value.value}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Image variants UI
  if (isImageOption && option.values?.some((v) => v.imageUrl)) {
    return (
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          {option.name}
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
          {option.values.map((value) => (
            <button
              key={value.id}
              onClick={() => !disabled && onSelect(value.id)}
              disabled={disabled}
              className={cn(
                "relative transition-all rounded-lg overflow-hidden border-2",
                selectedValueId === value.id
                  ? "border-primary ring-2 ring-offset-2 ring-primary"
                  : "border-muted-foreground/20 hover:border-muted-foreground/50"
              )}
              title={value.value}
              aria-label={`Select ${value.value}`}
            >
              <div className="aspect-square relative">
                {value.imageUrl ? (
                  <img
                    src={value.imageUrl}
                    alt={value.value}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-medium">{value.value}</span>
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-center block mt-1 truncate">
                {value.value}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Default: Button/text UI for sizes, materials, etc.
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        {option.name}
      </label>
      <div className="flex flex-wrap gap-2">
        {option.values?.map((value) => (
          <Button
            key={value.id}
            onClick={() => !disabled && onSelect(value.id)}
            disabled={disabled}
            variant={selectedValueId === value.id ? "default" : "outline"}
            size="sm"
            className="transition-all"
          >
            {value.value}
          </Button>
        ))}
      </div>
    </div>
  );
}
