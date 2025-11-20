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

  // Color swatches UI
  if (isColorOption && option.values?.length > 0) {
    return (
      <div className="flex flex-col gap-y-3">
        <label className="text-sm  text-foreground">
          {option.name} -{" "}
          <span className="font-bold">
            {option.values.find((v) => v.id === selectedValueId)?.value ||
              "اختر"}
          </span>
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
                  ? "ring-2 ring-offset-2 ring-primary"
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
