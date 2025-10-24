import { useState, useMemo, useCallback } from "react";

/**
 * useVariantSelection Hook
 * Manages variant selection state and logic
 *
 * Input:
 * - options: ProductOption[] with values
 * - variants: ProductVariant[] with selected options
 *
 * Returns:
 * - selectedValues: Record<optionId, valueId>
 * - setSelected: (optionId, valueId) => void
 * - selectedVariant: matched variant or null
 * - availabilityMap: Record<variantId, boolean>
 * - isComplete: boolean - whether all required options are selected
 */
export function useVariantSelection(options = [], variants = []) {
  const [selectedValues, setSelectedValues] = useState({});

  // Find matching variant based on selected option values
  const selectedVariant = useMemo(() => {
    if (!options.length || !variants.length) return null;

    // Check if all options are selected
    const allOptionsSelected = options.every((opt) => selectedValues[opt.id]);
    if (!allOptionsSelected) return null;

    // Find variant matching all selected values
    return (
      variants.find((variant) => {
        // Check if this variant has entries for all selected options
        const variantOptions = variant.options || [];

        return options.every((option) => {
          const selectedValueId = selectedValues[option.id];
          const variantOption = variantOptions.find(
            (vo) => vo.optionId === option.id
          );

          return variantOption && variantOption.valueId === selectedValueId;
        });
      }) || null
    );
  }, [selectedValues, options, variants]);

  // Map of available variants for each option value
  const availabilityMap = useMemo(() => {
    const map = {};

    options.forEach((option) => {
      map[option.id] = {};

      option.values?.forEach((value) => {
        // Create temporary selected values with this value
        const testValues = { ...selectedValues, [option.id]: value.id };

        // Check if any active variant matches all current selections
        const isAvailable =
          variants.some((variant) => {
            const variantOptions = variant.options || [];
            return (
              variant.isActive &&
              options.every((opt) => {
                const testValueId = testValues[opt.id];
                if (!testValueId) return true; // Not yet selected, assume available
                const variantOption = variantOptions.find(
                  (vo) => vo.optionId === opt.id
                );
                return variantOption && variantOption.valueId === testValueId;
              })
            );
          }) || !testValues[option.id]; // Available if not yet selected

        map[option.id][value.id] = isAvailable;
      });
    });

    return map;
  }, [selectedValues, options, variants]);

  // Update selected value for an option
  const setSelected = useCallback((optionId, valueId) => {
    setSelectedValues((prev) => ({
      ...prev,
      [optionId]: valueId,
    }));
  }, []);

  // Check if all options are selected
  const isComplete =
    options.length > 0 && options.every((opt) => selectedValues[opt.id]);

  return {
    selectedValues,
    setSelected,
    selectedVariant,
    availabilityMap,
    isComplete,
  };
}

export default useVariantSelection;
