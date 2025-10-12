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
  - Returns: `{ product: ProductWithOptionsAndVariants }`
- GET `/api/product/:id/variant/:variantId`
  - Returns: `{ variant: Variant }`

## Request/Response Schemas

- ProductWithOptionsAndVariants

```
{
  id, name, slug, description, basePrice, images: string[],
  options: [
    { id, name, position, values: [{ id, value, hex, imageUrl, position }] }
  ],
  variants: [
    { id, sku, price, stockQuantity, isActive, imageUrls: string[],
      options: [{ optionId, valueId }]
    }
  ]
}
```

## Selection Algorithm

- A variant matches if for every optionId in product.options there is a pair in variant.options with the selected valueId.

## Caching

- Cache product by slug with options+variants.

## Security

- Only public-safe fields on website API; admin-only mutations under dashboard APIs.
