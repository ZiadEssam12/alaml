# Offers: Backend

Backend responsibilities: services for applicability/discount, public and admin APIs, and integration with cart/checkout and orders.

---

## Services (business logic)

File: `src/lib/offers/offerService.js`

- findActiveOffersForCart(userId, cartItems)

  - Purpose: Load all currently active offers that could affect the given cart.
  - Inputs:
    - userId: string (optional for anonymous carts; usage checks may be skipped or limited)
    - cartItems: [{ productId: string, categoryId?: string, qty: number, price: number }]
  - Behavior:
    - Queries DB for isActive offers within startDate/expirationDate.
    - Narrows to relevant offers by matching productId or categoryId present in cartItems.
  - Output: Offer[] pre-filtered to those that are time-active and target at least one cart item.
  - Errors/Edge cases:
    - Return empty array if no offers or outside window.
    - Handle anonymous user by skipping per-user usage limits here (defer to isOfferApplicable).

- isOfferApplicable({ offer, cartItems, userId })

  - Purpose: Final validation for a specific offer against a specific cart and user.
  - Inputs:
    - offer: Offer
    - cartItems: same as above
    - userId: string | null
  - Checks:
    - isActive = true
    - Date window: now between startDate and expirationDate
    - Targets at least one item in cart (scope = product|category)
    - Cart minimum: sum of targeted items meets minCartAmount (pre-discount)
    - Usage limits: global maxUsageCount and perUserUsageCount via OfferUsage counts
  - Output: { applicable: boolean, reason?: string, targetedItems: [indices or productIds], targetedSubtotal: number }

- calculateCartDiscount({ offers, cartItems, shippingCost, coupon })

  - Purpose: Decide which discounts apply and compute totals according to stacking rules.
  - Inputs:
    - offers: Offer[] (already filtered by findActiveOffersForCart)
    - cartItems: items in cart
    - shippingCost: number
    - coupon: optional coupon result (if user applied one)
  - Rules:
    - Monetary discount: choose the best single monetary discount among: coupon vs applicable offers (percentage/fixed).
    - Free shipping: may stack with exactly one monetary discount (coupon or offer).
    - Max cap: respect offer.maxDiscountAmount when present.
  - Output:
    - {
      appliedMonetary: { kind: 'offer'|'coupon'|null, id?: string, amount: number }
      appliedFreeShipping: { kind: 'offer'|null, id?: string, amount: number }
      discountedItems?: [{ productId, discountPortion }]
      totalDiscount: number
      shippingDiscount: number
      }
  - Errors/Edge cases:
    - If no applicable monetary discounts, return zeroed monetary fields.
    - If shipping already zero, skip free shipping apply.

- incrementUsage({ offerId, userId, orderId })
  - Purpose: Record that an offer was consumed for a given order and user.
  - Inputs: offerId, userId, orderId (all required)
  - Behavior:
    - Inserts OfferUsage row to support global/per-user usage accounting.
    - Idempotency: enforce @@unique(offerId,userId,orderId); on conflict, no-op.
  - Output: void (or inserted usage record)
  - Errors:
    - Validate that referenced offer and order exist; handle FK violations.

Suggested pseudo for calculateCartDiscount:

- Filter offers by isOfferApplicable.
- Split into monetary vs free_shipping.
- Compute best monetary discount across:
  - coupon.monetaryAmount
  - max offer monetary computed on targeted items (respect maxDiscountAmount)
- Compute free shipping: pick one free_shipping offer if shippingCost > 0.
- Return applied selections and totals.

---

## Public Endpoints

- GET `src/app/api/offers/active/route.js`

  - Purpose: Expose currently active offers for client use (e.g., product page badge).
  - Query:
    - productId?: string
    - categoryId?: string
  - Behavior:
    - Validates exactly one of productId or categoryId if provided.
    - Returns active offers matching the filter and date window.
  - Responses:
    - 200: { data: OfferDTO[] }
    - 400: { error } on bad query
  - Auth: Public

- POST `src/app/api/offers/apply/route.js` (optional)
  - Purpose: Validate code-based offers against the current cart.
  - Body:
    - { code: string, cartItems: [...], shippingCost?: number }
  - Behavior:
    - Looks up offer by code, runs isOfferApplicable, then calculateCartDiscount with that single offer considered for monetary and free shipping.
  - Responses:
    - 200: { applicable: boolean, discountSummary }
    - 400/404: invalid code or inapplicable
  - Auth: User optional; per-user usage limits need userId if enforced.

---

## Admin Endpoints (mirror coupon CRUD)

- GET/POST `src/app/api/dashboard/offers/route.js`

  - GET: list offers with filters (status, scope, date range)
  - POST: create offer
    - Validations:
      - Exactly one of productId or categoryId required based on scope
      - If type = free_shipping ⇒ value must be 0
      - Date range valid (startDate < expirationDate)
      - Optional code unique
  - Auth: Admin only

- GET/PUT/DELETE `src/app/api/dashboard/offers/[id]/route.js`

  - GET: fetch single offer by id
  - PUT: update offer fields with same validations as create
  - DELETE: soft-disable by setting isActive = false (recommended) or hard delete if policy allows
  - Auth: Admin only

- PUT `src/app/api/dashboard/offers/[id]/toggle-status/route.js`
  - Purpose: Quick enable/disable
  - Body: { isActive: boolean }
  - Auth: Admin only

---

## Cart/Checkout Integration

- `src/lib/api/shop/cartAPI.js`

  - Role: When computing cart totals, call findActiveOffersForCart → calculateCartDiscount.
  - Output: Include discount lines in the cart summary:
    - applied offer id/title
    - monetary and/or free shipping discount amounts

- `src/app/api/coupons/apply/route.js`

  - Keep as-is; it returns coupon evaluation.
  - Cart totals layer then compares coupon result to offer result per stacking rules.

- `src/app/api/order/route.js`
  - Sequence:
    1. Compute subtotal and shippingCost from items.
    2. If a coupon was applied, compute coupon discount.
    3. Call offers flow and choose best monetary vs coupon; optionally stack free shipping.
    4. Persist Order with final amounts and line-item totals.
    5. Call incrementUsage for each applied offer (monetary and/or free shipping).
  - Errors: If persistence fails after discount calc, rollback order and do not record usage.

---

## Auth/Guards

- Reuse existing SSR/session helpers (e.g., `getUserTokenSSR`) for identifying the user.
- Public endpoints: no auth.
- Admin endpoints: enforce admin role (mirror coupon endpoints).
- Apply per-user usage limits only when user is identified.

---

## Reusable Server Patterns

- Coupon apply flow: `src/app/api/coupons/apply/route.js`
  - Reuse validation patterns (date windows, min cart, status).
- Orders finalize logic: `src/app/api/order/route.js`
  - Reuse subtotal/shipping computation and error handling structure.

---

## Discount Rules (Default)

- Single best monetary discount:
  - Prevents double-dipping and makes pricing predictable.
- Free shipping stacks with exactly one monetary discount:
  - Common UX; preserves shipping promos’ value.
- Enforce minCartAmount pre-discount:
  - Ensures threshold logic remains stable.
- Respect date windows, isActive, and usage limits:
  - Avoids over-redemption and legal mismatches.

---

## Rollout (Backend)

1. Implement offerService with unit tests for edge cases:
   - boundary dates, caps, min cart, per-user/global usage
2. Add public/admin offer endpoints:
   - use DTOs to avoid leaking internal fields (e.g., internal notes)
3. Integrate in cart and order endpoints:
   - ensure totals match UI and are deterministic
4. Validate auth/guards and error handling:
   - return consistent error shapes and status codes
