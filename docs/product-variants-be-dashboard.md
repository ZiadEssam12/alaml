# Product Variants - Backend Admin (Dashboard) API

This document defines admin endpoints to manage product options, option values, and variants.

Base: `/dashboard/products/:productId`

## Options

- GET `/options`
  - Purpose: List all options for the product ordered by `position`.
  - Behavior: Returns an array with each option including its values ordered by `position` when needed by UI, or omit values if a lightweight list is preferred.
  - Validation: Ensure `productId` exists and the caller is authorized (admin).
  - 200 `{ options: Option[] }`
- POST `/options`
  - Purpose: Create a new option for the product.
  - Body `{ name: string, presentation?: "swatch"|"pill"|"select" }`
  - Behavior: Creates with `position` set to the next index (append). Enforces uniqueness of `name` per product (schema `@@unique([productId, name])`).
  - Errors: 409 if an option with the same name already exists.
  - 201 `{ option }`
- PUT `/options/:optionId`
  - Purpose: Update option metadata and/or reorder via `position`.
  - Body `{ name?, position?, presentation? }`
  - Behavior: Supports partial update. If `position` changes, reorder other options accordingly (stable reindex) if UI requires strict ordering.
  - Errors: 404 if not found, 409 if new `name` conflicts.
  - 200 `{ option }`
- DELETE `/options/:optionId`
  - Purpose: Remove an option and its values.
  - Behavior: Cascades to `ProductOptionValue` and to `ProductVariantOption` via schema. Any `ProductVariant` that no longer represents a full combination should be deleted or marked inactive per business rule.
  - Errors: 404 if not found.
  - 204

## Option Values

- POST `/options/:optionId/values`
  - Purpose: Add a value to an option.
  - Body `{ value: string, hex?: string, imageUrl?: string, position?: number }`
  - Behavior: Creates value with `position` appended unless provided. Enforces uniqueness of `value` per option (schema `@@unique([optionId, value])`).
  - Errors: 404 if option not found, 409 on duplicate `value`.
  - Side-effect: Consider revalidating variants; any existing variants missing this value are unaffected until generated.
  - 201 `{ value }`
- PUT `/options/:optionId/values/:valueId`
  - Purpose: Update a specific option value.
  - Body `{ value?, hex?, imageUrl?, position? }`
  - Behavior: Partial update; if `position` changes, reorder siblings.
  - Errors: 404 if not found, 409 if `value` duplicates another.
  - 200 `{ value }`
- DELETE `/options/:optionId/values/:valueId`
  - Purpose: Remove a specific option value.
  - Behavior: Cascades to `ProductVariantOption`. Variants referencing the removed value will lose completeness; delete or mark those variants inactive.
  - Errors: 404 if not found.
  - 204

## Variants

- GET `/variants`
  - Purpose: List all variants for the product.
  - Behavior: Returns variants including their selected option/value pairs (join rows) to make combinations explicit.
  - Filtering: Support `?active=true/false`, `?inStock=true/false` and pagination when counts are large.
  - 200 `{ variants: Variant[] }`
- POST `/variants/generate`
  - Purpose: Generate variants from the cartesian product of current option values.
  - Body `{ strategy: "cartesian", includeInactive?: boolean }`
  - Behavior: Computes all combinations, creates missing variants only. Does not overwrite existing ones.
  - Constraints: Compute `combinationHash` from sorted `valueId`s and enforce uniqueness. Optionally create as inactive (`isActive=false`) when bulk-generating.
  - Returns counts of created vs already-existing combinations.
  - 201 `{ created: number, existing: number }`
- PUT `/variants/:variantId`
  - Purpose: Update a variant’s commercial fields.
  - Body `{ sku?, price?, stockQuantity?, isActive?, imageUrls? }`
  - Behavior: Partial update; validate `price` is non-negative and `stockQuantity` is >= 0. Ensure `sku` uniqueness if provided.
  - Errors: 404 if not found, 409 if `sku` violates uniqueness.
  - 200 `{ variant }`
- PUT `/variants/bulk`
  - Purpose: Apply a uniform update to multiple variants.
  - Body `{ ids: string[], set: Partial<Variant> }`
  - Behavior: Only allow whitelisted fields in `set` (e.g., `price`, `stockQuantity`, `isActive`). Reject changes to structural fields (options/values) here.
  - 200 `{ updated: number }`
- DELETE `/variants/:variantId`
  - Purpose: Remove a variant.
  - Behavior: Cascades to `ProductVariantOption` via schema.
  - Errors: 404 if not found. Optionally 409 if business rules prevent deleting the last active variant when product requires at least one.
  - 204

## Errors

- 400 validation
- 404 not found
- 409 conflict (duplicate combination)

## Notes

- On option value delete, cascade delete affected variant-option rows and variants that no longer have full combination.
- Unique index on (productId, combinationHash).

### Validation & security

- All endpoints require admin authentication/authorization.
- Validate `productId` and that referenced `optionId`/`valueId`/`variantId` belong to the same product.
- Guard against race conditions when generating variants (use `combinationHash @unique` to safely ignore duplicates).

### Reordering considerations

- When updating `position`, use a stable reindex to avoid duplicate positions.
- Provide a drag-and-drop endpoint if frequent reordering is needed, or accept an array of `{ id, position }`.

### Example Prisma fragments

- Generate `combinationHash`:

```ts
function combinationHashFromValueIds(valueIds: string[]) {
  return [...valueIds].sort().join("-");
}
```

- Create a variant with join rows:

```ts
await prisma.productVariant.create({
  data: {
    productId,
    price,
    stockQuantity,
    isActive: includeInactive ? false : true,
    combinationHash,
    options: {
      create: selectedPairs.map(({ optionId, valueId }) => ({
        optionId,
        valueId,
      })),
    },
  },
});
```
