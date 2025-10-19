"use client";

import React from "react";
import AddToCartButton from "./AddToCartButton";

export default function ProductCartControls({ product }) {
  return (
    <AddToCartButton
      product={product}
      quantity={1}
      showQuantityControls={true}
      className="w-full h-12 text-base font-medium relative overflow-hidden group"
      size="lg"
    />
  );
}
