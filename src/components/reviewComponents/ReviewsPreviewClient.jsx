"use client";

import { useState } from "react";
import ReviewsPreview from "./ReviewsPreview";
import ReviewsModal from "./ReviewsModal";
import ReviewDialog from "./ReviewDialog";

// Client Component wrapper for Reviews Preview with Modal functionality
export default function ReviewsPreviewClient({
  initialReviews,
  totalReviews,
  productId,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [updateMode, setUpdateMode] = useState(false);

  const handleReviewUpdated = (updatedReview) => {
    setUpdateMode(true);
    setExistingReview(updatedReview);
  };

  return (
    <>
      <ReviewsPreview
        reviews={initialReviews}
        totalReviews={totalReviews}
        onShowMore={() => setIsModalOpen(true)}
        handleReviewUpdated={handleReviewUpdated}
      />

      <ReviewsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={productId}
        initialReviews={initialReviews}
        totalReviews={totalReviews}
      />

      <ReviewDialog
        productId={productId}
        userReview={existingReview}
        updateMode={true}
        onReviewSubmitted={handleReviewUpdated}
      />
    </>
  );
}
