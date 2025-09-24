To build a comprehensive review system with a dashboard for administrators, you'll need to expand the backend API and create dedicated frontend components for the admin interface. This allows for moderation and management of reviews.

---

### 1\. Backend Tasks for Admin Dashboard 👮‍♂️

The dashboard endpoints will be protected and accessible only to users with the `admin` role.

#### **API Endpoints**

- **`GET /api/admin/reviews`**: Fetches all reviews, regardless of status.
  - **Function Name**: `handleGetAllReviews`
  - **Description**: This is a **protected, admin-only route**. It retrieves all reviews from the database, including those with `pending`, `approved`, and `rejected` statuses. This is crucial for the moderation queue.
- **`GET /api/admin/reviews/pending`**: Fetches all reviews awaiting moderation.
  - **Function Name**: `handleGetPendingReviews`
  - **Description**: A specialized **protected, admin-only route** that returns only reviews with a `pending` status. This allows the admin to quickly see what needs attention.
- **`PUT /api/admin/reviews/:reviewId/approve`**: Approves a review.
  - **Function Name**: `handleApproveReview`
  - **Description**: This **admin-only endpoint** changes a review's `status` from `pending` to `approved`. The `reviewId` is passed as a URL parameter.
- **`PUT /api/admin/reviews/:reviewId/reject`**: Rejects a review.
  - **Function Name**: `handleRejectReview`
  - **Description**: This **admin-only endpoint** changes a review's `status` from `pending` to `rejected`. The `reviewId` is passed as a URL parameter.
- **`DELETE /api/admin/reviews/:reviewId`**: Deletes a review.
  - **Function Name**: `handleDeleteReview`
  - **Description**: This **admin-only endpoint** permanently removes a review from the database.

#### **Core Logic & Performance**

- **Admin Middleware**: Implement a middleware function that specifically checks if the authenticated user has `role: 'admin'`. Any request to an `/api/admin` endpoint must pass this check.

- **Efficient Queries**: For fetching all reviews, use Prisma's `findMany` method. Consider pagination for large datasets to prevent performance bottlenecks.

  ```prisma
  // Example with pagination
  const reviews = await prisma.review.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: 'desc' }
  });
  ```

---

### 2\. Frontend Tasks for Admin Dashboard 💻

The admin dashboard will be a dedicated section of the application, accessible only to admins.

#### **Components & Pages**

- **`AdminReviewsDashboard` Page**: The main page for review management.
  - **Description**: This page should be a **protected route** using Next.js middleware or `getServerSideProps` to check for the user's `admin` role before rendering.
  - **Data Fetching**: Use a hook or a server-side function to call `GET /api/admin/reviews/pending` (for a quick-view queue) and `GET /api/admin/reviews` (for a full list). Use **React Query** or **SWR** for efficient data fetching and caching, especially for a real-time moderation queue.
- **`ReviewModerationCard` Component**: Displays a single review with moderation options.
  - **Description**: This reusable component receives a review object as a prop.
  - **UI**: It displays the `productName`, `userName`, `rating`, and `comment`. It also includes two buttons: "Approve" and "Reject."
  - **Actions**:
    - Clicking "Approve" calls the `PUT /api/admin/reviews/:reviewId/approve` endpoint.
    - Clicking "Reject" calls the `PUT /api/admin/reviews/:reviewId/reject` endpoint.
  - **User Experience**: After a successful API call, use the state management library (like React Query's `mutate` function) to automatically update the UI and remove the moderated review from the list without a full page reload.

#### **Conditional UI Logic & Performance**

- **Role-Based Routing**: Use a redirect in `middleware.ts` or `getServerSideProps` to send non-admin users away from the `/admin` routes.
- **Data Table**: For a large number of reviews, use a component like `react-table` to build a sortable and filterable table. This enhances usability and performance by allowing admins to quickly find reviews by product, user, or status.
- **Real-time Updates**: The `pending` reviews list is a perfect use case for automatic refetching. Set an interval on your data fetching hook to periodically check for new pending reviews, ensuring the admin is always working with the most current data.
