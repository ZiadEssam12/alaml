"use client";

import { useState } from "react";
import ReviewsPreview from "./ReviewsPreview";
import ReviewsModal from "./ReviewsModal";

// Client Component wrapper for Reviews Preview with Modal functionality
export default function ReviewsPreviewClient({
  initialReviews,
  totalReviews,
  productId,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <ReviewsPreview
        reviews={initialReviews}
        totalReviews={totalReviews}
        onShowMore={() => setIsModalOpen(true)}
        setOpenModal={setIsModalOpen}
        modalState={isModalOpen}
      />

      <ReviewsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={productId}
        initialReviews={initialReviews}
        totalReviews={totalReviews}
      />
    </>
  );
}
