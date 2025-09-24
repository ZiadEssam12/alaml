To build a robust review system, you'll need to create a secure backend API and a performant frontend interface. The system will enforce business rules, like ensuring users are authenticated and have purchased the product before leaving a review, and that they can only submit one review per product.

---

### 1\. Backend Tasks 📦

The backend will handle all data logic, validation, and interaction with the database. We'll use Next.js API Routes for this.

#### **API Endpoints**

- **`POST /api/reviews`**: Creates a new product review.
  - **Function Name**: `handleCreateReview`
  - **Description**: This is a **protected route** requiring user authentication. It validates the request body, checks if the user has a completed order for the specified product, and verifies if the user has already submitted a review for that product. If all checks pass, it creates a new review with a `pending` status.
- **`GET /api/reviews/:productId`**: Fetches all **approved** reviews for a specific product.
  - **Function Name**: `handleGetProductReviews`
  - **Description**: This is a **public route** and should be highly performant. It retrieves all reviews for a given product ID where the `status` is `approved`.
- **`GET /api/reviews/user/:userId`**: Fetches all reviews submitted by a specific user.
  - **Function Name**: `handleGetUserReviews`
  - **Description**: This is a **protected route**. It fetches all reviews associated with the authenticated user, allowing them to view their submission history.
- **`PUT /api/reviews/:reviewId`**: Updates a review (e.g., for moderation).
  - **Function Name**: `handleUpdateReview`
  - **Description**: This is an **admin-only** route. It updates a specific review's status (e.g., from `pending` to `approved` or `rejected`).
- **`DELETE /api/reviews/:reviewId`**: Deletes a review.
  - **Function Name**: `handleDeleteReview`
  - **Description**: This is an **admin-only** or user-specific route. It allows for the permanent removal of a review.

#### **Core Logic & Performance**

- **Middleware for Authentication & Authorization**: Use a robust authentication solution like **NextAuth.js** to protect API routes. Create middleware that checks for a valid session and user role (`admin` vs. `user`).
- **Data Validation**: Use a schema validation library like **Zod** to validate incoming request bodies (e.g., `rating` is an integer between 1-5, `comment` is a string).
- **Enforcing Business Rules**:

  1.  **Authenticated User**: The API route must check for a valid user session.

  2.  **Purchased Product**: Before creating a review, query the database to confirm the user has a `delivered` or `shipped` `Order` that includes the `productId` in its `OrderItem`s. Use a Prisma query to efficiently check this:

      ```prisma
      const hasPurchased = await prisma.order.findFirst({
        where: {
          userId: userId,
          status: { in: ['shipped', 'delivered'] },
          items: { some: { productId: productId } }
        }
      });
      ```

  3.  **One Review per User/Product**: Before creating a review, query the database to ensure a review doesn't already exist for the `userId` and `productId` combination.

      ```prisma
      const existingReview = await prisma.review.findFirst({
        where: {
          userId: userId,
          productId: productId
        }
      });
      ```

- **Performance Optimization (Next.js)**:
  - **Edge Functions**: Deploy API routes as Edge Functions for low latency, as they run closer to the user.
  - **Prisma Client**: Prisma is highly performant. Ensure queries are optimized with proper `WHERE` clauses and `@@index` declarations as you've done in your schema.

---

### 2\. Frontend Tasks 🎨

The frontend will be built with **React** and **Next.js** to provide a fast, user-friendly experience.

#### **Components & Pages**

- **`ProductReviewsList` Component**: Displays the list of approved reviews.

  - **Description**: This component is a **Server Component** (or uses `getServerSideProps`) to fetch the reviews for a specific product ID on the server. This improves SEO and initial page load performance, as the reviews are part of the initial HTML.
  - **Data Fetching**: Use a function like `fetchApprovedReviews(productId)` that calls the `GET /api/reviews/:productId` endpoint.
  - **UI**: Each review will display the `userName`, `rating` (e.g., star icons), and `comment`.

- **`ReviewForm` Component**: Allows authenticated users to submit a new review.

  - **Description**: This should be a **Client Component**. It handles form state, validation, and submission. It is conditionally rendered:
    - Show the form only if the user is authenticated.
    - Show a button to "Write a Review" if the user has purchased the product but hasn't reviewed it yet.
    - Show a message like "You have already reviewed this product" if they've submitted one.
  - **Form Fields**: A `rating` input (e.g., a star rating component) and a `comment` textarea.
  - **Submission**: On form submission, call the `POST /api/reviews` endpoint. Use **React Hook Form** with **Zod** for client-side form validation.
  - **State Management**: Use **SWR** or **React Query** for client-side data fetching and state management. When a new review is successfully submitted, these libraries can automatically re-validate and re-fetch the review data for a seamless UI update.

#### **Conditional UI Logic & Performance**

- **User Session Check**: Use **NextAuth.js**'s `useSession` hook to determine if a user is logged in.
- **Purchased Product Check**: On the product page, the server-side logic (or a dedicated client-side hook) will check if the logged-in user has purchased the product. This can be done by a single server-side check that combines the purchase and review existence queries.
- **Performance Optimization**:
  - **Server-Side Rendering (SSR)**: The main product page with the review list should be rendered on the server to make it lightning fast for the user and search engines.
  - **Lazy Loading**: For products with hundreds of reviews, implement pagination or infinite scrolling to avoid loading all reviews at once.
  - **Client-Side Hydration**: Ensure the `ReviewForm` component is a client component (`'use client'`) to handle interactive form logic.
  - **Image Optimization**: If you add user avatars, use Next.js's `next/image` component for lazy loading and format optimization.
