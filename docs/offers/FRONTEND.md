# Offers: Frontend

Frontend responsibilities: admin management UI, product/category display, and cart/checkout totals that reflect offers.

## Admin UI (Dashboard)

- New pages: `src/app/dashboard/(auth)/offers/page.jsx`, `AddingOfferForm.jsx`
  - Fields: title, description, scope (product/category), product/category selector, type, value, minCartAmount, maxDiscountAmount, start/end dates, isAutoApply, code (if not auto)
  - API client: `src/lib/api/dashboard/offersAPI.js` (mirror `couponsAPI.js`)
  - Reuse: `SearchBox`, and `components/ui/*` (Button, Input, Select, Dialog, Table, Badge)

## Product & Category Pages

- Product card: `src/components/ProductCard/ProductCard.jsx`
  - Show offer badge; if monetary offer, show strike-through + discounted price
- Category page: `src/app/(website)/categories/[slug]/page.jsx`
  - Render a banner for active category-level offers (type/value)

## Cart & Checkout

- Cart summary: `src/components/cart/CartSummary.jsx`
  - Display auto-applied offer discount lines alongside coupon results
  - Keep coupon input; show best outcome according to rules
- Checkout: `src/app/(website)/checkout/page.jsx`, `src/components/checkout/CheckoutForm.jsx`
  - Accept offers info similarly to coupon; totals must match backend calculation

## Optional Client Helpers

- `src/hooks/useOffers.js`: fetch active offers for product/category contexts on the client when needed

## Reusable UI & Flows

- Coupons admin/list patterns: `src/app/dashboard/(auth)/coupons/*`
- Coupon API client: `src/lib/api/dashboard/couponsAPI.js`
- Product listing/display: `src/components/Home/productsList.jsx`, `ProductCard`
- Cart aggregation: `src/lib/api/shop/cartAPI.js`

## Rollout (Frontend)

1. Build dashboard offers pages and API client
2. Update product/category UI to indicate offers and show discounted prices
3. Update cart/checkout to show offers in totals and line items
4. QA price parity with backend and edge cases (dates, min cart, stacking)
