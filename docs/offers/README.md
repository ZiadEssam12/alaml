# Offers: Product- and Category-level Promotions

This plan adds automatic or code-based offers that target a single product or an entire category. It reuses coupon patterns, integrates with cart/checkout, and separates concerns by Database, Backend, and Frontend.

## Goals

- Support product-level and category-level offers
- Types: percentage, fixed amount, free shipping
- Auto-applied and code-based (with `code`)
- Usage limits, date windows, min cart
- Cart, checkout, order integration
- Admin CRUD in dashboard

---

## Database (Prisma)

Add two models mirroring `Coupon`/`CouponUsage`, with explicit targeting to `Product` or `Category`.

```prisma
enum OfferScope {
  product
  category
}

model Offer {
  id                String     @id @default(uuid()) @map("offer_id")
  title             String
  description       String?    @db.Text

  // Targeting
  scope             OfferScope
  productId         String?
  categoryId        String?
  product           Product?   @relation(fields: [productId], references: [id], onDelete: Cascade)
  category          Category?  @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  // Type & value (reuse CouponType semantics)
  type              CouponType
  value             Decimal    @db.Decimal(10, 2)

  // Behavior
  isActive          Boolean    @default(true) @map("is_active")
  isAutoApply       Boolean    @default(true) @map("is_auto_apply")
  code              String?    @unique // only for non-auto offers

  // Limits & windows
  maxUsageCount     Int?       @map("max_usage_count")
  perUserUsageCount Int?       @map("per_user_usage_count")
  maxDiscountAmount Decimal?   @map("max_discount_amount") @db.Decimal(10, 2)
  minCartAmount     Decimal?   @default(0.00) @map("min_cart_amount") @db.Decimal(10, 2)
  startDate         DateTime   @map("start_date")
  expirationDate    DateTime   @map("expiration_date")

  createdAt         DateTime   @default(now()) @map("created_at")

  usages            OfferUsage[]

  @@index([isActive])
  @@index([scope])
  @@index([productId])
  @@index([categoryId])
  @@index([startDate])
  @@index([expirationDate])
  @@map("offers")
}

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

Validation & Notes:

- Exactly one of `productId` or `categoryId` must be set (enforce in APIs).
- If `type = free_shipping` ⇒ set `value = 0` and ignore `maxDiscountAmount`.
- Reuse the existing `CouponType` enum.

Commands (Windows cmd):

```bat
pnpm prisma generate
pnpm prisma migrate dev -n add_offers
```

---

## Backend

Services (business logic):

- `src/lib/offers/offerService.js`
  - `findActiveOffersForCart(userId, cartItems)`
  - `isOfferApplicable({ offer, cartItems, userId })` (date range, active, usage limits, min cart)
  - `calculateCartDiscount({ offers, cartItems, shippingCost, coupon })`
    - Do not stack percentage/fixed offers with coupons; pick best total.
    - Allow stacking free_shipping with one monetary discount (coupon or offer).
  - `incrementUsage({ offerId, userId, orderId })`

Public endpoints:

- `src/app/api/offers/active/route.js`
  - `GET`: list active offers. Query by `productId` or `categoryId`.
- `src/app/api/offers/apply/route.js` (optional for code-based offers)
  - `POST`: validate `code`, compute discount for current cart.

Admin endpoints (mirror coupon CRUD):

- `src/app/api/dashboard/offers/route.js` (GET, POST)
- `src/app/api/dashboard/offers/[id]/route.js` (GET, PUT, DELETE soft-disable)
- `src/app/api/dashboard/offers/[id]/toggle-status/route.js` (PUT)

Cart/Checkout integration:

- `src/lib/api/shop/cartAPI.js`: include auto-offer evaluation in cart totals.
- `src/app/api/coupons/apply/route.js`: keep as-is; offers evaluated separately.
- `src/app/api/order/route.js`:
  - After computing `subtotal`, `shippingCost`, and optional coupon, call `offerService.calculateCartDiscount(...)`.
  - On order create, insert `OfferUsage` for applied offers.

Auth/guards:

- Reuse `getUserTokenSSR` from `src/lib/auth-helpers.js`.
- Mirror coupon admin route protections.

# Offers: Product- and Category-level Promotions

This plan adds automatic or code-based offers that target a single product or an entire category. It reuses coupon patterns, integrates with cart/checkout, and is split into three focused docs:

- Database: `docs/offers/DATABASE.md`
- Backend: `docs/offers/BACKEND.md`
- Frontend: `docs/offers/FRONTEND.md`

Use these as the source of truth for implementation details and rollout steps.
