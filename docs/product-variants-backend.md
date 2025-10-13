# Product Variants - Backend API

This document specifies the backend domain model and public website API endpoints for Product Options and Variants.

## Domain Model (Prisma)

Proposed additions (see schema section below for full model):

- ProductOption (per product)
- ProductOptionValue (per option)
- ProductVariant (per product combination)
- ProductVariantOption (join: variant x option value)

## Public API Endpoints

Base: `/api/product`

- GET `/api/product/:slug`
  - Returns: `{ product: ProductWithOptionsAndVariantIndex }`
- GET `/api/product/:id/variant/:variantId`
  - Returns: `{ variant: VariantFull }`
- GET `/api/product/:id/variants`
  - Query: `?ids=variantId1,variantId2,...`
  - Returns: `{ variants: VariantFull[] }`

## Request/Response Schemas

- ProductWithOptionsAndVariantIndex

```json
{
  "id": "prod_1",
  "name": "T-Shirt",
  "slug": "t-shirt",
  "description": "Soft cotton",
  "basePrice": "250.00",
  "images": ["..."],
  "options": [
    {
      "id": "opt_size",
      "name": "Size",
      "position": 1,
      "values": [
        {
          "id": "val_s",
          "value": "S",
          "hex": null,
          "imageUrl": null,
          "position": 1
        },
        {
          "id": "val_m",
          "value": "M",
          "hex": null,
          "imageUrl": null,
          "position": 2
        }
      ]
    },
    {
      "id": "opt_color",
      "name": "Color",
      "position": 2,
      "values": [
        {
          "id": "val_red",
          "value": "Red",
          "hex": "#F00",
          "imageUrl": null,
          "position": 1
        },
        {
          "id": "val_blue",
          "value": "Blue",
          "hex": "#00F",
          "imageUrl": null,
          "position": 2
        }
      ]
    }
  ],
  "variantsIndex": [
    {
      "id": "var_1",
      "combo": { "opt_size": "val_s", "opt_color": "val_red" }, // or combinationHash
      "price": "260.00",
      "stockQuantity": 12,
      "isActive": true,
      "primaryImage": "..." // optional
    },
    {
      "id": "var_2",
      "combo": { "opt_size": "val_m", "opt_color": "val_blue" },
      "price": "270.00",
      "stockQuantity": 0,
      "isActive": false
    }
  ],
  "priceRange": { "min": "250.00", "max": "300.00" } // optional, precomputed
}
```

- VariantFull

```json
{
  "id": "var_1",
  "sku": "TS-RED-S",
  "price": "260.00",
  "stockQuantity": 12,
  "isActive": true,
  "imageUrls": ["...", "..."],
  "options": [
    { "optionId": "opt_size", "valueId": "val_s" },
    { "optionId": "opt_color", "valueId": "val_red" }
  ],
  "attributes": { "weight": "180g/m2" } // optional extension
}
```

## Interaction flow (PDP)

1. Initial render:

- Fetch `/api/product/:slug` -> product, options, values, variantsIndex.
- UI renders pickers immediately; compute availability client-side from variantsIndex.

2. On option select:

- Resolve matching variant using variantsIndex (combo or combinationHash).
- If a single variant resolves, fetch details:
  - GET `/api/product/:id/variant/:variantId` (or batch via `/variants?ids=...`).
- Update price/sku/stock/gallery from VariantFull.

3. Prefetch:

- Optionally prefetch likely variants on hover/focus for instant transitions.

## Caching

- Cache GET `/api/product/:slug` at the edge (stale-while-revalidate).
- Cache variant detail responses with short TTL; they’re small.

## Admin/Dashboard

- Admin endpoints can return full variants since the counts are manageable and tools need full data:
  - GET `/api/dashboard/products/:id/variants` -> full list
  - PUT `/api/dashboard/variants/:id` -> update one
  - POST `/api/dashboard/products/:id/variants/generate` -> cartesian generation
