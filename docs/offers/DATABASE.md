# Offers: Database (Prisma)

Add normalized models that mirror existing coupon patterns and target either a single `Product` or a whole `Category`.

## Schema

```prisma


model OfferUsage {
  usageId Int    @id @default(autoincrement()) @map("usage_id")

  offerId String @map("offer_id")
  offer   Offer  @relation(fields: [offerId], references: [id], onDelete: Cascade)

  userId  String @map("user_id")
  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  orderId String @map("order_id")
  order   Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)

  appliedAt DateTime @default(now()) @map("applied_at")

  @@unique([offerId, userId, orderId])
  @@index([offerId])
  @@index([userId])
  @@index([orderId])
  @@map("offer_usages")
}
```

## Validation & Notes

- Exactly one of `productId` or `categoryId` must be set (enforce in APIs).
- If `type = free_shipping` ⇒ set `value = 0` and ignore `maxDiscountAmount`.
- Reuse existing `CouponType` enum for `percentage`, `fixed`, `free_shipping`.

## Commands (Windows cmd)

```bat
pnpm prisma generate
pnpm prisma migrate dev -n add_offers
```
