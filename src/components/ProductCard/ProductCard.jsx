"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useContext } from "react";
import { cartContext } from "@/Context/Cart";
import { imageService } from "@/lib/image-service";

export default function ProductCard({ product }) {
  const { addToCart, isInCart } = useContext(cartContext);

  const isItemInCart = isInCart(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const isOutOfStock = product.stockQuantity <= 0;

  const imagePublicId = imageService.extractPublicId(product.imageUrls[0]);

  const ImageThumbnail = product.imageUrls[0]
    ? imageService.generateOptimizedUrl(imagePublicId, {
        width: 300,
        height: 300,
      })
    : product.imageUrls[0];

  const ImagePlaceholder =
    imageService.generateBlurredPlaceholder(imagePublicId);

  return (
    <div
      className={`group relative bg-card rounded-lg p-1 ${
        !isOutOfStock ? "order-1" : "order-2"
      }`}
    >
      {/* Product Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative h-48 flex items-center justify-center bg-accent overflow-hidden rounded-lg group">
          <Image
            src={ImageThumbnail}
            alt={product.name}
            width={150}
            height={150}
            placeholder="blur"
            blurDataURL={ImagePlaceholder}
            className="group-hover:scale-105 transition-transform duration-200"
          />
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isItemInCart}
            className="w-full bottom-0 translate-y-[103%] disabled:pointer-events-auto disabled:bg-primary disabled:opacity-90 disabled:text-accent disabled:cursor-not-allowed group-hover:translate-y-0 transition-transform absolute rounded-none"
            variant={isItemInCart ? "secondary" : "default"}
          >
            <ShoppingCart className="h-4 w-4 ml-2" />
            {isOutOfStock
              ? "نفد المخزون"
              : isItemInCart
              ? "في السلة"
              : "أضف للسلة"}
          </Button>

          {/* Stock Badge */}
          {isOutOfStock && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              نفد المخزون
            </Badge>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3
            className="font-semibold text-base mb-2 hover:text-primary line-clamp-1"
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        <div className="flex flex-col justify-start gap-1">
          {/* Price */}
          <div className="flex items-center justify-between order-1">
            <span className="text-xl font-bold text-primary">
              {product.price} جنيه
            </span>
            {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
              <Badge variant="outline" className="text-orange-600">
                {product.stockQuantity} متبقي
              </Badge>
            )}
          </div>
          {/* Rating */}
          <div className="flex items-center gap-2 order-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              {product.averageRating
                ? Number(product.averageRating).toFixed(1)
                : 0}
            </span>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-muted-foreground dark:text-slate-400">
              ({product.totalSales || 0})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
