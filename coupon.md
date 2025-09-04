I understand you've selected a portion of the `schema.prisma` file in the Canvas. Based on the provided schema and your role as a senior developer, here are the key tasks and requirements for implementing the coupon code logic.

### Coupon System - Development Requirements

This document outlines the core tasks for the backend and frontend developers to integrate the coupon functionality as defined in the Prisma schema.

#### 1. Backend API Endpoints

The development team must create and secure the following API endpoints to handle all coupon-related actions:

* **`POST /api/coupons/apply`**
    * **Description:** Validates and applies a coupon code to a user's current cart/order.
    * **Request Body:** `{"code": "SUMMER20", "userId": "..."}`
    * **Logic:**
        * **A.** Fetch the coupon from the database using the provided `code`. If not found, return an error.
        * **B.** Validate the coupon based on the following conditions:
            * Is `isActive` set to `true`?
            * Is the current date between `startDate` and `expirationDate`?
            * If `maxUsageCount` is set, check if the total `CouponUsage` count is less than this value.
            * If `perUserUsageCount` is set, count the number of times the current `userId` has used the coupon and ensure it's less than the limit.
            * Check if the user's cart total meets the `minCartValue` (if applicable).
        * **C.** If all validations pass, calculate the discount amount based on the coupon `type` (`percentage`, `fixed`, `free_shipping`) and `value`.
        * **D.** Apply the discount to the user's order record, update the `finalAmount`, and link the `couponCode` and `couponId` to the `Order` model.
        * **E.** Create a new entry in the `CouponUsage` table to log the successful application, linking it to the `couponId`, `userId`, and `orderId`.
* **`POST /api/coupons/remove`**
    * **Description:** Removes a previously applied coupon from a user's order.
    * **Request Body:** `{"orderId": "..."}`
    * **Logic:**
        * **A.** Find the `Order` associated with the `orderId`.
        * **B.** Find the corresponding `CouponUsage` entry and delete it from the database.
        * **C.** Reset the `discount` and recalculate the `finalAmount` on the `Order` record.

#### 2. Frontend User Interface (UI)

The frontend developers should create the following UI components and logic to support the coupon system:

* **A.** A text input field on the cart or checkout page where users can enter a coupon code.
* **B.** A button to trigger the `apply` action.
* **C.** A visual display of the applied coupon, the discount amount, and the new total.
* **D.** Clear and concise error messages for validation failures (e.g., "Invalid coupon code," "This coupon has expired," "Minimum cart value not met").
* **E.** A button or link to remove a currently applied coupon.

#### 3. Data Integrity & Management

* **A.** Implement a method for administrators to create, view, update, and delete coupons (`CRUD` operations). This should include a simple form or dashboard for managing coupon attributes like `code`, `type`, `value`, and usage limits.
* **B.** The `CouponUsage` model should be treated as a historical record. Its primary function is to log usage, so no direct API endpoints for modification are needed for general users.
* **C.** The system should handle concurrent requests gracefully, especially for coupons with a `maxUsageCount` to avoid over-usage.
* **D.** Ensure all database queries are efficient and properly handle potential errors. The chosen ORM (Prisma) simplifies many of these tasks. 