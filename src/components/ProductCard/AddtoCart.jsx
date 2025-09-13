"use client";

import React, { useContext, useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cartContext } from "@/Context/Cart";
import { Minus, Plus, ShoppingCart, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductInfo({ product }) {
  const { addToCart, isInCart } = useContext(cartContext);
  const isIteminCart = isInCart(product.id);
  const [quantityNumber, setQuantityNumber] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();

    if (!isInStock) {
      toast.error("المنتج غير متوفر");
      return;
    }

    setIsAdding(true);

    try {
      await addToCart(product, quantityNumber);
      toast.success(`تم إضافة ${product.name} إلى السلة`);
      setQuantityNumber(1);
    } catch (error) {
      toast.error("حدث خطأ أثناء إضافة المنتج");
    } finally {
      setIsAdding(false);
    }
  };

  const addQuantity = () => {
    if (
      product.stockQuantity > 0 &&
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

  const isInStock = product.stockQuantity > 0;
  const maxReached = quantityNumber >= product.maxQuantityPerUser;
  const stockLimitReached = quantityNumber >= product.stockQuantity;

  return (
    <div className="space-y-6">
      {/* Quantity Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          الكمية المطلوبة
        </label>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-input rounded-lg bg-background">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeQuantity}
              disabled={quantityNumber <= 1}
              className="h-10 w-10 rounded-none border-r hover:bg-muted disabled:opacity-50"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <div className="flex items-center justify-center w-16 h-10 text-center font-medium">
              {quantityNumber}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addQuantity}
              disabled={!isInStock || maxReached || stockLimitReached}
              className="h-10 w-10 rounded-none border-l hover:bg-muted disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Quantity Limits Info */}
          <div className="text-xs text-muted-foreground">
            {maxReached && (
              <div className="text-orange-600 dark:text-orange-400">
                الحد الأقصى لكل عميل: {product.maxQuantityPerUser}
              </div>
            )}
            {stockLimitReached && !maxReached && (
              <div className="text-orange-600 dark:text-orange-400">
                متوفر: {product.stockQuantity} قطعة فقط
              </div>
            )}
            {!maxReached && !stockLimitReached && quantityNumber > 1 && (
              <div className="text-green-600 dark:text-green-400">
                المجموع: {(product.price * quantityNumber).toLocaleString()}{" "}
                جنيه
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={!isInStock || isIteminCart || isAdding}
        className="w-full h-12 text-base font-medium relative overflow-hidden group"
        size="lg"
      >
        <div className="flex items-center justify-center gap-3">
          {isAdding ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جاري الإضافة...
            </>
          ) : isIteminCart ? (
            <>
              <Check className="h-5 w-5" />
              في السلة
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
              أضف إلى السلة
            </>
          )}
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Button>

      {/* Additional Info */}
      {!isInStock && (
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            هذا المنتج غير متوفر حالياً
          </p>
        </div>
      )}

      {isInStock && (
        <div className="text-center text-sm text-muted-foreground">
          <p>شحن مجاني على الطلبات فوق 500 جنيه</p>
        </div>
      )}
    </div>
  );
}
