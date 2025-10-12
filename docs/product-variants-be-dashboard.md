# Product Variants - Backend Admin (Dashboard) API

This document defines admin endpoints to manage product options, option values, and variants.

Base: `/dashboard/products/:productId`

## Options

- GET `/options`
  - 200 `{ options: Option[] }`
- POST `/options`
  - Body `{ name: string, presentation?: "swatch"|"pill"|"select" }`
  - 201 `{ option }`
- PUT `/options/:optionId`
  - Body `{ name?, position?, presentation? }`
  - 200 `{ option }`
- DELETE `/options/:optionId`
  - 204

## Option Values

- POST `/options/:optionId/values`
  - Body `{ value: string, hex?: string, imageUrl?: string, position?: number }`
  - 201 `{ value }`
- PUT `/options/:optionId/values/:valueId`
  - Body `{ value?, hex?, imageUrl?, position? }`
  - 200 `{ value }`
- DELETE `/options/:optionId/values/:valueId`
  - 204

## Variants

- GET `/variants`
  - 200 `{ variants: Variant[] }`
- POST `/variants/generate`
  - Body `{ strategy: "cartesian", includeInactive?: boolean }`
  - 201 `{ created: number, existing: number }`
- PUT `/variants/:variantId`
  - Body `{ sku?, price?, stockQuantity?, isActive?, imageUrls? }`
  - 200 `{ variant }`
- PUT `/variants/bulk`
  - Body `{ ids: string[], set: Partial<Variant> }`
  - 200 `{ updated: number }`
- DELETE `/variants/:variantId`
  - 204

## Errors

- 400 validation
- 404 not found
- 409 conflict (duplicate combination)

## Notes

- On option value delete, cascade delete affected variant-option rows and variants that no longer have full combination.
- Unique index on (productId, combinationHash).
