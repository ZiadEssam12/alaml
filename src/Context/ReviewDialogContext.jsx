"use client";

import { createContext, useContext, useState } from "react";

const ReviewDialogContext = createContext();

export function ReviewDialogProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("create"); // 'create' or 'update'
  const [review, setReview] = useState(null);
  const [productId, setProductId] = useState(null);
  const [productName, setProductName] = useState("");

  const openDialog = (reviewData = null) => {
    if (reviewData) {
      setMode("update");
      setReview(reviewData);
    } else {
      setMode("create");
      setReview(null);
    }
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setTimeout(() => {
      setReview(null);
      setMode("create");
    }, 300);
  };

  const setProductInfo = (id, name) => {
    setProductId(id);
    setProductName(name);
  };

  return (
    <ReviewDialogContext.Provider
      value={{
        isOpen,
        setIsOpen,
        mode,
        review,
        productId,
        productName,
        setProductInfo,
        openDialog,
        closeDialog,
      }}
    >
      {children}
    </ReviewDialogContext.Provider>
  );
}

export function useReviewDialog() {
  const context = useContext(ReviewDialogContext);
  if (!context) {
    throw new Error("useReviewDialog must be used within ReviewDialogProvider");
  }
  return context;
}
