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
