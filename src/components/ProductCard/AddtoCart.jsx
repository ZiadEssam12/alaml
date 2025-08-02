"use client";

import React, { useContext, useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cartContext } from "@/Context/Cart";

export default function ProductInfo({ product }) {
  const { addToCart, isInCart } = useContext(cartContext);
  const isIteminCart = isInCart(product.id);
  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, quantityNumber);
    setQuantityNumber(1);
  };
  const [quantityNumber, setQuantityNumber] = useState(1);

  const addQuantity = () => {
    if (
      quantityNumber < product.stockQuantity &&
      quantityNumber <= product.maxQuantityPerUser
    ) {
      setQuantityNumber((prev) => prev + 1);
    }
  };

  const removeQuantity = () => {
    if (quantityNumber > 1) {
      setQuantityNumber((prev) => prev - 1);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full mt-8">
      <div className="flex items-center gap-2 mb-2">
        {product.category && (
          <Badge variant="secondary">{product.category.name}</Badge>
        )}
        <span className="text-2xl font-bold">{product.name}</span>
      </div>
      <div>
        <p className="text-lg font-semibold text-primary">
          السعر: {product.price * quantityNumber} جنيه
        </p>
        <p className="text-muted-foreground">{product.description}</p>
        <p>
          الكمية المتاحة:{" "}
          <span className="font-bold">{product.stockQuantity}</span>
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <label className="block mb-2">الكمية:</label>
            <div className="bg-gray-100 dark:bg-gray-800 flex gap-3  rounded items-stretch">
              <button
                className="selection:bg-transparent p-2 cursor-pointer"
                onClick={removeQuantity}
              >
                -
              </button>
              <span className="flex items-center">{quantityNumber}</span>
              <button
                className="selection:bg-transparent p-2 cursor-pointer"
                onClick={addQuantity}
              >
                +
              </button>
            </div>
          </div>
          <Button disabled={isIteminCart} onClick={handleAddToCart}>
            {isIteminCart ? "في السلة" : "أضف إلى السلة"}
          </Button>
        </div>
      </div>
    </div>
  );
}
