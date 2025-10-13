# Product Variants - Prisma Schema Changes

Below is the proposed Prisma schema extension to support product options and variants. Adjust model and field names to match existing schema conventions.

```prisma
model ProductOption {
  id         String   @id @default(cuid())
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId  String
  name       String
  presentation String? // swatch | pill | select
  position   Int       @default(0)
  values     ProductOptionValue[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([productId, name])
}

model ProductOptionValue {
  id         String  @id @default(cuid())
  option     ProductOption @relation(fields: [optionId], references: [id], onDelete: Cascade)
  optionId   String
  value      String
  hex        String?  // for color swatch
  imageUrl   String?
  position   Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([optionId, value])
}

model ProductVariant {
  id            String   @id @default(cuid())
  product       Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId     String
  sku           String?  @unique
  price         Decimal  @db.Decimal(10,2)
  stockQuantity Int      @default(0)
  isActive      Boolean  @default(true)
  imageUrls     String[]
  // Hash of option value ids sorted, used for uniqueness
  combinationHash String @unique
  options       ProductVariantOption[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([productId])
}

model ProductVariantOption {
  // join table representing variant's chosen values per option
  id          String @id @default(cuid())
  variant     ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  variantId   String
  option      ProductOption @relation(fields: [optionId], references: [id], onDelete: Cascade)
  optionId    String
  value       ProductOptionValue @relation(fields: [valueId], references: [id], onDelete: Cascade)
  valueId     String

  @@unique([variantId, optionId]) // each option appears once per variant
}
```

## Computed combinationHash

- Sort selected `valueId`s lexicographically and join with `-` to create a unique `combinationHash` per product.
- Enforce uniqueness at DB level to prevent duplicate variants.

## Migration Notes

- Backfill existing products with a single default variant using base price and stock.
- If existing `Product` has `price` and `stockQuantity`, keep as base fields but surface variant if exists.

## Example Queries

- Fetch product with options and variants

```ts
prisma.product.findUnique({
  where: { slug },
  include: {
    options: { include: { values: true }, orderBy: { position: "asc" } },
    variants: {
      include: {
        options: { include: { option: true, value: true } },
      },
    },
  },
});
```

- Create variant with hashed combination

```ts
const valueIds = selectedValues.sort();
const combinationHash = valueIds.join("-");
await prisma.productVariant.create({
  data: {
    productId,
    sku,
    price,
    stockQuantity,
    imageUrls,
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

## Model rationale — why each table exists

Below is a concise explanation of what each model represents, why it is needed, and how it is used across the app.

### ProductOption

- What: A dimension of variation for a product (e.g., Size, Color, Material). Stored per product.
- Why:
  - Products can have multiple, ordered dimensions of choice.
  - UI needs label and ordering (position) and may need a presentation hint (swatch/pill/select).
  - Unique per product to prevent duplicate options with the same name.
- How it’s used:
  - Website renders an OptionPicker per ProductOption.
  - Dashboard allows CRUD and reordering of options.

### ProductOptionValue

- What: The allowed values for a given option (e.g., Size: S/M/L, Color: Red/Blue).
- Why:
  - Each option has a controlled set of values; values can carry metadata like `hex` for color swatches or an `imageUrl` for thumbnails.
  - Enforce uniqueness per option to avoid duplicate values (e.g., two "M" entries).
- How it’s used:
  - Website renders the selectable chips/swatches.
  - Dashboard manages the set of available values per option and their order.

### ProductVariant

- What: A concrete sellable unit representing a combination of option-values.
- Why:
  - Each combination may have its own `sku`, `price`, `stockQuantity`, `imageUrls`, and activation state.
  - `combinationHash` enforces uniqueness of combinations and enables fast lookup of a selected combination.
  - Index on `productId` speeds up queries to list/aggregate variants for a product.
- How it’s used:
  - Website resolves a selected combination to the correct variant, then uses its price/stock for Add to Cart and display.
  - Dashboard lists variants, supports bulk updates to price/stock/status.

### ProductVariantOption

- What: Join table linking a variant to the chosen value for each option.
- Why:
  - Normalized representation of the combination, instead of a denormalized array, allows relational integrity and efficient queries.
  - `@@unique([variantId, optionId])` guarantees exactly one value per option in a variant.
  - Cascading relations keep data consistent when options/values are deleted.
- How it’s used:
  - Construct and validate variant combinations.
  - Query for variants matching a partial selection (e.g., all variants where Size = "M").

### Why not a single JSON field?

- Data integrity: relational constraints prevent duplicate or invalid combinations.
- Queryability: filter by option/value, aggregate stock, and paginate variants efficiently.
- Performance: indexes on product and unique hash make lookups and validations fast.
- Maintainability: partial updates (price/stock/status) don’t require rewriting a JSON blob.

### Effects on existing features

- Backfill: existing products get a default variant from base fields to remain sellable.
- Compatibility: frontend can gracefully fallback to base product data if no variants are defined.

### Deletion and cascading behavior

- Deleting an Option cascades to its Values and invalidates any variants referencing them (via cascade on join rows).
- Deleting a Value removes join rows and may orphan a variant from a full combination; business logic should either delete the variant or mark it inactive during such operations.

### Indexing and uniqueness summary

- `@@unique([productId, name])` on ProductOption prevents duplicate option names per product.
- `@@unique([optionId, value])` on ProductOptionValue prevents duplicates per option.
- `combinationHash @unique` on ProductVariant ensures a combination only exists once.
- `@@unique([variantId, optionId])` on ProductVariantOption ensures one value per option in a variant.

## Interaction flows — how models drive UI

This section explains what should happen in the app when a shopper opens a product page and selects option values, mapped to each model. It includes small example queries and helper snippets you can adapt.

### When a user opens a product page

- Load the product, its ordered options and values, and the minimal variant fields needed for availability.
- Compute which values are selectable (e.g., only those that lead to at least one active, in-stock variant when combined with the current partial selection, which is empty on load).
- Display a price range “From …” if multiple variants have different prices.

Example query (load minimal fields):

```ts
const product = await prisma.product.findUnique({
  where: { slug },
  include: {
    options: { include: { values: true }, orderBy: { position: "asc" } },
    variants: {
      where: { isActive: true },
      select: {
        id: true,
        price: true,
        stockQuantity: true,
        combinationHash: true,
      },
    },
  },
});

// Build a set of available valueIds for each option based on active, in-stock variants
const inStockVariants = product.variants.filter((v) => v.stockQuantity > 0);
// If you keep variant.options included, you can compute exact availability per option/value.
```

Model roles on load:

- Product: base info; anchors options and variants.
- ProductOption / ProductOptionValue: render pickers in UI; order by `position`.
- ProductVariant: provides price range, stock presence and determines which values are initially selectable.
- ProductVariantOption: if included, allows precise availability by mapping variants back to option/value pairs.

### When a user selects a value for an option

- Filter down to the set of variants that match the current partial selection (e.g., Color: Red).
- Recompute availability for the remaining options: a value is enabled if there is at least one active, in-stock variant matching the partial selection plus that value.
- If the filtered set collapses to a single variant, show its concrete `price`, `sku`, `stockQuantity`, and choose variant-specific images if present.

Pseudocode:

```ts
type Selection = Record<string /* optionId */, string /* valueId */>;

function filterVariantsBySelection(
  variants: VariantWithOptions[],
  selection: Selection
) {
  return variants.filter(
    (v) =>
      v.isActive &&
      Object.entries(selection).every(([optionId, valueId]) =>
        v.options.some(
          (vo) => vo.optionId === optionId && vo.valueId === valueId
        )
      )
  );
}

function computeAvailability(
  variants: VariantWithOptions[],
  selection: Selection
) {
  const remainingVariants = filterVariantsBySelection(
    variants,
    selection
  ).filter((v) => v.stockQuantity > 0);
  const available: Record<string, Set<string>> = {};
  for (const v of remainingVariants) {
    for (const vo of v.options) {
      if (!available[vo.optionId]) available[vo.optionId] = new Set();
      available[vo.optionId].add(vo.valueId);
    }
  }
  return available; // use to enable/disable values in the UI
}
```

### When the selection forms a full combination

- Compute the `combinationHash` from the selected `valueId`s, or query by the join table.
- Resolve the exact `ProductVariant`. If none exists or it’s inactive/out of stock, disable Add to Cart and show availability messaging.
- Update price, SKU, stock, and media preview to the variant’s values.

Example resolver:

```ts
const valueIds = Object.values(selection).sort();
const combinationHash = valueIds.join("-");
const variant = await prisma.productVariant.findFirst({
  where: { productId, combinationHash, isActive: true },
  include: { options: { include: { option: true, value: true } } },
});
// If variant is null -> the chosen combo doesn’t exist; mark invalid/disabled.
```

If you don’t rely on `combinationHash`, resolve via the join table:

```ts
const variant = await prisma.productVariant.findFirst({
  where: {
    productId,
    isActive: true,
    AND: Object.entries(selection).map(([optionId, valueId]) => ({
      options: { some: { optionId, valueId } },
    })),
  },
});
```

### When the selection leads to no valid variant

- UX: keep the conflicting value selected but mark it as invalid, or prevent selection and show a tooltip “Unavailable”.
- Data: compute availability before committing the change; if a click would yield an empty variant set, reject the change.
- Behavior: Add to Cart remains disabled; show “Out of stock” or “Not available in this configuration”.

### Add to Cart flow

- Payload includes: `productId`, resolved `variantId`, `quantity`, and a snapshot of chosen options (e.g., array of `{ optionId, optionName, valueId, valueLabel }`).
- Server validates:
  - Variant exists for that product, `isActive === true`.
  - `stockQuantity >= quantity` (unless backorders are allowed).
- Server records price from the variant (not the base product), so cart/order totals reflect the chosen configuration.

```ts
await prisma.cartItem.create({
  data: {
    userId,
    productId,
    variantId,
    quantity,
    unitPrice: variant.price,
    selectedOptionsSnapshot: JSON.stringify(selectedPairs),
  },
});
```

### Products without options

- If a product has no `options`, either expose a single default variant (backfilled) or use base product fields. The UI should hide pickers and show a single price/stock state.

### Quick reference — model responsibilities during interactions

- Product

  - Load: base info; min/max price from variants; whether any variant is in stock.
  - Select: none directly; used to scope variant queries.
  - Add to Cart: referenced by `productId`.

- ProductOption / ProductOptionValue

  - Load: render pickers ordered by `position`; all values initially visible.
  - Select: UI enables/disables values based on availability computed from variants.
  - Add to Cart: included as a human-readable snapshot for order history.

- ProductVariant

  - Load: drives price range and availability; may be fetched minimally for performance.
  - Select: resolves concrete price/sku/stock when a full combination is chosen.
  - Add to Cart: source of `variantId`, `unitPrice`, and stock checks.

- ProductVariantOption
  - Load: optionally included to precompute per-value availability.
  - Select: primary mechanism to match variants against partial/complete selections.
  - Add to Cart: not stored directly; selection is snapshotted for readability.

### Helper snippets

- Compute `combinationHash` consistently:

```ts
function combinationHashFromValueIds(valueIds: string[]) {
  return [...valueIds].sort().join("-");
}
```

- Resolve available values for all options given a partial selection:

```ts
async function listAvailableValues(
  prisma: PrismaClient,
  productId: string,
  selection: Selection
) {
  const variants = await prisma.productVariant.findMany({
    where: { productId, isActive: true },
    include: { options: true },
  });
  const remaining = filterVariantsBySelection(variants, selection).filter(
    (v) => v.stockQuantity > 0
  );
  return computeAvailability(remaining, {}); // availability across remaining variants
}
```

- Resolve a variant by selection and guard stock:

```ts
async function resolveVariantBySelection(
  prisma: PrismaClient,
  productId: string,
  selection: Selection
) {
  const valueIds = Object.values(selection);
  if (!valueIds.length) return null;
  const hash = combinationHashFromValueIds(valueIds);
  const v = await prisma.productVariant.findFirst({
    where: { productId, combinationHash: hash, isActive: true },
  });
  if (!v || v.stockQuantity <= 0) return null;
  return v;
}
```

Notes:

- For large catalogs, avoid loading all variants at once. Query lazily (per selection step) or cache per product.
- If variants have per-value images (e.g., Color swatches), prefer `imageUrls` from the resolved variant; otherwise fall back to product-level images.
- Always compute availability from active, in-stock variants to avoid letting users pick dead-end combinations.
