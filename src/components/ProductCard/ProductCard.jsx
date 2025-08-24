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

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const isOutOfStock = product.stockQuantity <= 0;

  const ImageThumbnail = product.imageUrls[0]
    ? imageService.generateOptimizedUrl(imagePublicId, {
        width: 150,
        height: 150,
      })
    : product.imageUrls[0];

  const ImagePlaceholder =
    imageService.generateBlurredPlaceholder(imagePublicId);

  return (
    <div className="group relative bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={ImageThumbnail}
            alt={product.name}
            fill
            placeholder="blur"
            blurDataURL={ImagePlaceholder}
            className="rounded-lg object-cover"
          />
        </Link>

        {/* Stock Badge */}
        {isOutOfStock && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            نفد المخزون
          </Badge>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3
            className="font-semibold text-lg mb-2 hover:text-primary line-clamp-1"
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            ({product.totalSales})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-primary">
            {product.price} جنيه
          </span>
          {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
            <Badge variant="outline" className="text-orange-600">
              {product.stockQuantity} متبقي
            </Badge>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isItemInCart}
          className="w-full"
          variant={isItemInCart ? "secondary" : "default"}
        >
          <ShoppingCart className="h-4 w-4 ml-2" />
          {isOutOfStock
            ? "نفد المخزون"
            : isItemInCart
            ? "في السلة"
            : "أضف للسلة"}
        </Button>
      </div>
    </div>
  );
}
