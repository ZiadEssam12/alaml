"use client";

import React, { useContext, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, LogIn, Minus, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { cartContext } from "@/Context/Cart";

/**
 * Standalone Add to Cart Button Component
 * Handles auth checks, cart logic, and loading states
 * Used in ProductCard and ProductCartControls
 *
 * Props:
 * - product: Product object with id, name, stockQuantity, maxQuantityPerUser, price
 * - quantity: Initial quantity (default: 1)
 * - disabled: Disable button (default: false)
 * - showQuantityControls: Show +/- quantity controls (default: false)
 * - className: Custom styling
 * - size: Button size (default: "lg")
 * - variant: Button variant (default: "default")
 * - onAddSuccess: Callback after successful add
 */
export default function AddToCartButton({
  product,
  quantity = 1,
  disabled = false,
  showQuantityControls = false,
  className = "w-full h-12 text-base font-medium relative overflow-hidden group",
  size = "lg",
  variant = "default",
  onAddSuccess,
}) {
  const { data: session, status } = useSession();
  const { addToCart, isInCart } = useContext(cartContext);
  const [quantityNumber, setQuantityNumber] = useState(quantity);
  const [isAdding, setIsAdding] = useState(false);

  const isItemInCart = isInCart(product.id);
  const isInStock = product.stockQuantity > 0;
  const maxReached = quantityNumber >= product.maxQuantityPerUser;
  const stockLimitReached = quantityNumber >= product.stockQuantity;

  // Quantity controls
  const addQuantity = () => {
    if (
      product.stockQuantity > 0 &&
      quantityNumber < product.stockQuantity &&
      quantityNumber < product.maxQuantityPerUser
    ) {
      setQuantityNumber((prev) => prev + 1);
    }
  };

  const removeQuantity = () => {
    if (quantityNumber > 1) {
      setQuantityNumber((prev) => prev - 1);
    }
  };

  // Handle add to cart click
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is authenticated
    if (status === "unauthenticated") {
      signIn();
      return;
    }

    if (!isInStock) {
      toast.error("المنتج غير متوفر");
      return;
    }

    setIsAdding(true);

    try {
      await addToCart(product, quantityNumber);
      setQuantityNumber(1);
      if (onAddSuccess) {
        onAddSuccess();
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء إضافة المنتج");
    } finally {
      setIsAdding(false);
    }
  };

  // Determine button state and text
  const getButtonContent = () => {
    // If user not authenticated
    if (status === "unauthenticated") {
      return (
        <>
          <LogIn className="h-5 w-5 group-hover:scale-110 transition-transform" />
          سجل دخول للشراء
        </>
      );
    }

    // If loading
    if (isAdding) {
      return (
        <>
          <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          جاري الإضافة
        </>
      );
    }

    // If already in cart
    if (isItemInCart) {
      return (
        <>
          <Check className="h-5 w-5" />
          في السلة
        </>
      );
    }

    // Default - add to cart
    return (
      <>
        <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
        أضف إلى السلة
      </>
    );
  };

  // Determine if button should be disabled
  const isButtonDisabled =
    disabled || !isInStock || isItemInCart || isAdding || status === "loading";

  // If showing quantity controls, return the full ProductCartControls style component
  if (showQuantityControls) {
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
          disabled={isButtonDisabled}
          className={className}
          size={size}
          variant={variant}
        >
          <div className="flex items-center justify-center gap-3">
            {getButtonContent()}
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

  // Simple button version (for ProductCard)
  return (
    <Button
      onClick={handleAddToCart}
      disabled={isButtonDisabled}
      className={className}
      size={size}
      variant={variant}
    >
      <div className="flex items-center justify-center gap-3">
        {getButtonContent()}
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Button>
  );
}
