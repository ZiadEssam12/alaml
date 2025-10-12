# Product Variants - Admin Dashboard (Frontend)

This document describes UI/UX and component structure to manage Product Options and Variants in the admin dashboard.

## Goals

- CRUD for Options (per product) and their Values.
- Generate variants programmatically from Cartesian product of option values.
- Edit variant-specific fields: SKU, price, stock, status, images.

## Screens

### 1) Product Edit Screen

- Tabs: Details | Images | Options | Variants

#### Options Tab

- List existing Options with drag handle (position order)
- Add Option modal: fields
  - name (text) [e.g., Size, Color]
  - presentation (select: swatch, pill, select)
- For each Option: Values sub-list
  - Add Value row fields:
    - value (text)
    - hex (for color pick) optional
    - imageUrl optional
    - position
  - Actions: Edit, Delete

#### Variants Tab

- Toolbar:
  - Button: Generate Variants (from current option values)
  - Button: Bulk Update (price, stock)
- Variant Table Columns:
  - Combination (e.g., Size: M | Color: Red)
  - SKU (input name: `variants[<id>][sku]`)
  - Price (input name: `variants[<id>][price]`)
  - Stock (input name: `variants[<id>][stockQuantity]`)
  - Active (input name: `variants[<id>][isActive]`)
  - Images (multi-upload)
- Row Actions: Save, Delete

## Component Contracts

- `<OptionsManager productId />`

  - Fetch: GET `/dashboard/products/:id/options`
  - Mutations:
    - POST `/dashboard/products/:id/options` Body: `{ name, presentation }`
    - POST `/dashboard/products/:id/options/:optionId/values` Body: `{ value, hex?, imageUrl?, position? }`
    - PUT `/dashboard/products/:id/options/:optionId` Body: `{ name, presentation, position }`
    - PUT `/dashboard/products/:id/options/:optionId/values/:valueId` Body: `{ value, hex?, imageUrl?, position? }`
    - DELETE endpoints

- `<VariantsManager productId />`
  - Fetch: GET `/dashboard/products/:id/variants`
  - Generate: POST `/dashboard/products/:id/variants/generate` Body: `{ strategy: "cartesian", includeInactive?: boolean }`
  - Update: PUT `/dashboard/products/:id/variants/:variantId`
  - Bulk Update: PUT `/dashboard/products/:id/variants/bulk` Body: `{ ids: string[], set: Partial<Variant> }`

## Input Names

- Option name: `option[name]`
- Option value: `optionValue[value]`, `optionValue[hex]`, `optionValue[imageUrl]`
- Variant fields:
  - `variants[<id>][sku]`
  - `variants[<id>][price]`
  - `variants[<id>][stockQuantity]`
  - `variants[<id>][isActive]`

## Validation

- Option name required and unique per product.
- Option value required and unique per option.
- Variant combination unique per product.

## Edge Cases

- Deleting an option value removes variants containing it (confirm modal).
- Regenerate variants merges: create new combos, keep edited ones by id.
- Stock tracking disabled for digital products.
