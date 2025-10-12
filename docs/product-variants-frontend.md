# Product Variants - Website Frontend

This document describes the architecture, components, data flows, and integration patterns to support Product Options (e.g., Size, Color) and Variants on the public website.

## Goals

- Each Product can have one or more Options (e.g., Size, Color).
- Each Option has one or more Values (e.g., Size: S, M, L; Color: Red, Blue).
- A Variant represents a concrete combination of option values with its own price, SKU, stock, and image(s).
- Seamless UX for selecting variant and adding to cart.

## Data Shapes

- Product (expanded)
  - id, name, slug, description, basePrice, images[]
  - options: Option[]
  - variants: Variant[]
- Option
  - id, name (e.g., "Size"), position (sort)
  - values: OptionValue[]
- OptionValue
  - id, value (e.g., "M"), hex (for color), imageUrl?, position
- Variant
  - id, sku, price, stockQuantity, imageUrls[], isActive
  - options: Array<{ optionId: string, valueId: string }>

## Pages & Components

- Product Page: `src/app/(website)/products/[slug]/page.jsx`

  - Fetch product with options and variants.
  - State: `selectedValues: Record<optionId, valueId>`
  - Compute `selectedVariant` by matching variant.options with selectedValues.
  - Components:
    - `<OptionPicker />` generic option UI
      - Props: `option, selectedValueId, onSelect(valueId)`
      - For Color show swatches using value.hex; for Size show buttons; fallback to select.
    - `<PriceDisplay />` shows variant price or base price.
    - `<AddToCartButton />` posts selectedVariantId and quantity.

- Cart Mini/Drawer
  - Line item includes `variantId` and resolved option values for display.

## State Management Hooks

- `useVariantSelection(product)`

  - Inputs: product.options, product.variants
  - Returns:
    - selectedValues (state)
    - setSelected(optionId, valueId)
    - selectedVariant
    - availability map: `{ [variantId]: boolean }`

- `useAddToCart()`
  - `add({ productId, variantId, quantity })`
  - Validates variant availability client-side

## API Integration

- GET `/api/product/:slug` → returns product with options and variants.
- POST `/api/cart/items` Body: `{ productId, variantId, quantity }`
- Optional: GET `/api/product/:id/variant/:variantId` for hydration.

## Input Names (DOM/Form)

- For OptionPicker, names follow: `option[<optionId>]`
- Example:
  - `option[opt_size] = val_m`
  - `option[opt_color] = val_red`
- Quantity input: `quantity`

## Edge Cases

- Product with zero variants: use base product price/stock.
- Option without values: hide picker.
- Variant out of stock: disable Add to Cart; show "غير متاح".
- Invalid selection: disable CTA until all required options selected.

## Performance

- Lazy compute selectedVariant; memoize with useMemo.
- Defer high-res images for variant until selected.

## Analytics

- Fire view_item_variant when selection changes.
