## **1. Backend: Apply Coupon Flow**

This is the critical piece. Implementation should be **atomic** (transaction-based) to prevent race conditions and double usage.

### **Endpoint:** `POST /api/coupons/apply`

**Input:** `{ orderId: string, couponCode: string, userId: string }`
**Output:** `{ success: true, discount: number, finalAmount: number, message?: string }`

---

### **Step-by-Step Logic**

#### **1. Start DB Transaction**

- Begin a transaction to ensure atomic updates on `Coupon`, `Order`, and `CouponUsage`.

---

#### **2. Fetch and lock the coupon row**

- `SELECT * FROM Coupon WHERE code = $couponCode FOR UPDATE`
- If coupon doesn’t exist → return error `"Invalid coupon code"`.

---

#### **3. Validate coupon status**

- **isActive:** Must be `true`.
- **Date Range:** If `startDate`/`expirationDate` exist, ensure:

  ```ts
  startDate <= now <= expirationDate;
  ```

- If invalid → return `"Coupon expired or inactive"`.

---

#### **4. Check usage limits**

- **Global usage:**
  If `maxUsageCount` exists → ensure `usageCount < maxUsageCount`.
  Otherwise → return `"Coupon usage limit reached"`.
- **Per-user usage:**
  Count `CouponUsage` rows for `(couponId, userId)` → ensure `< perUserUsageCount` if defined.
  Otherwise → return `"You have reached the limit for this coupon"`.

---

#### **5. Validate order**

- Fetch `Order` by `orderId`.
- If not found or not owned by `userId` → return `"Invalid order"`.
- Check `order.status` must be `pending` (not processed or paid yet).
- Check `order.subtotal >= coupon.minCartValue` if defined.

---

#### **6. Calculate discount**

- Based on `coupon.type`:

  ```ts
  let discount = 0;

  if (type === "percentage") {
    discount = round(subtotal * (value / 100), 2);
  }
  if (type === "fixed") {
    discount = Math.min(value, subtotal); // don't exceed subtotal
  }
  if (type === "free_shipping") {
    discount = order.shippingCost;
    order.shippingCost = 0; // free shipping
  }
  ```

- **Ensure final amount ≥ 0:**

  ```ts
  finalAmount = Math.max(subtotal + shippingCost - discount, 0);
  ```

---

#### **7. Update order**

- Update `Order` record:

  - `discount = discount`
  - `finalAmount = finalAmount`
  - `couponId = coupon.id`
  - `couponCode = coupon.code` (denormalized snapshot)

---

#### **8. Insert coupon usage row**

- Create `CouponUsage` with `{ couponId, userId, orderId }`
- Add unique constraint `@@unique([couponId, userId, orderId])` to prevent duplicates.

---

#### **9. Increment coupon usage counter**

- `UPDATE Coupon SET usageCount = usageCount + 1 WHERE id = $couponId`

---

#### **10. Commit transaction**

- If any validation fails, rollback and return proper error message.

---

#### **11. Return success response**

- `{ success: true, discount, finalAmount }`

---

## **2. Backend: Remove Coupon Flow**

### **Endpoint:** `POST /api/coupons/remove`

**Input:** `{ orderId: string, userId: string }`
**Output:** `{ success: true, finalAmount: number }`

---

### **Logic**

1. Fetch `Order` by `orderId` where `userId = currentUser`.
2. If no coupon applied → return `"No coupon applied"`.
3. Delete `CouponUsage` row for `(couponId, userId, orderId)`.
4. Reset `discount = 0`, `finalAmount = subtotal + shippingCost`.
5. Set `couponId = null`, `couponCode = null`.
6. Commit transaction.
7. Return success with new totals.

---

## **3. Frontend Logic**

### **Checkout Page:**

- **Apply Coupon:**

  - Text input for coupon code.
  - On submit → call `POST /api/coupons/apply`.
  - Show loader until response returns.
  - If success → show discount line item, new final amount.
  - If error → show message in red under input.

- **Remove Coupon:**

  - “Remove” link/button → call `POST /api/coupons/remove`.
  - Reset totals.

- **Edge Cases:**

  - Disabled apply button while pending.
  - Prevent reapplying same coupon if already used.

---

## **4. Admin Panel Logic**

- **CRUD Coupons:**

  - Create form with `code`, `type`, `value`, `maxUsageCount`, `perUserUsageCount`, `minCartValue`, `startDate`, `expirationDate`.
  - Validate:

    - `expirationDate > startDate`
    - `value >= 0`
    - `percentage <= 100`

- **List Coupons:**

  - Show usage stats: total redemptions, per-user usage, status.

- **Soft delete / deactivate:**

  - Toggle `isActive` instead of hard delete.
  - Allow archiving coupons.

---

## **5. Extra Safety Checks**

- **Idempotency:** If same coupon applied twice to same order → return success without duplicating `CouponUsage`.
- **Rate limiting:** Prevent brute force coupon guessing.
- **Logging:** Log coupon applications for analytics & debugging.

---

## **6. Suggested Developer Flow**

1. **DB Migration:** Add missing fields & constraints from schema recommendations.
2. **Backend:**

   - Implement `applyCoupon` and `removeCoupon` inside Prisma transactions.
   - Write unit tests for all validation cases.

3. **Frontend:**

   - Integrate `apply/remove` endpoints with clear UI feedback.
   - Handle success/error gracefully.

4. **Admin:**

   - Build CRUD for coupons + stats view.

5. **QA Tests:**

   - Concurrency test with `maxUsageCount = 1`.
   - Expired coupon scenario.
   - Per-user limit scenario.
   - Free shipping scenario.

---

If you want, I can write a **TypeScript `applyCoupon()` function** using Prisma with all these validations and transaction safety built in.

Do you want me to do that? It will give your devs production-ready code.
