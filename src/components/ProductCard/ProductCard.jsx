"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Heart, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useContext } from "react";
import { cartContext } from "@/Context/Cart";
import { imageService } from "@/lib/image-service";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product }) {
  const { isInCart } = useContext(cartContext);

  const isItemInCart = isInCart(product.id);

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

  // Check if product has an active offer
  const hasOffer = product.offer && product.offer.discountedPrice !== null;
  const discountPercent = hasOffer
    ? Math.round(
        ((product.offer.originalPrice - product.offer.discountedPrice) /
          product.offer.originalPrice) *
          100
      )
    : 0;

  return (
    <div
      className={`group relative bg-card rounded-lg p-1 ${
        !isOutOfStock ? "order-1" : "order-2"
      }`}
    >
      {/* Product Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative h-72 flex items-center justify-center bg-accent overflow-hidden rounded-lg group">
          <Image
            src={ImageThumbnail}
            alt={product.name}
            width={250}
            height={250}
            placeholder="blur"
            blurDataURL={ImagePlaceholder}
            className="group-hover:scale-105 transition-transform duration-200"
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 w-full translate-y-[103%] group-hover:translate-y-0 transition-transform"
          >
            <AddToCartButton
              product={product}
              quantity={1}
              disabled={isOutOfStock}
              className="w-full h-10 text-sm font-medium rounded-none"
              variant={isItemInCart ? "secondary" : "default"}
            />
          </div>

          {/* Offer Badge */}
          {hasOffer && (
            <Badge className="absolute top-2 left-2 bg-green-600 text-white border-green-700 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {discountPercent}% خصم
            </Badge>
          )}

          {/* Stock Badge */}
          {isOutOfStock && (
            <Badge
              variant="destructive"
              className="absolute top-2 right-2 bg-red-700 text-white border-red-800"
            >
              نفد المخزون
            </Badge>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3
            className="font-semibold text-xl mb-2 hover:text-primary line-clamp-1"
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        <div className="flex flex-col justify-start gap-1">
          {/* Price */}
          <div className="flex items-center justify-between order-1">
            {hasOffer ? (
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-primary">
                  {product.offer.discountedPrice.toLocaleString()} جنيه
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {product.offer.originalPrice.toLocaleString()} جنيه
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-primary">
                {product.price} جنيه
              </span>
            )}
            {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
              <Badge
                variant="outline"
                className="text-orange-700 border-orange-600"
              >
                {product.stockQuantity} متبقي
              </Badge>
            )}
          </div>
          {/* Rating */}
          <div className="flex items-center gap-1 order-2">
            <span className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              {product.averageRating
                ? Number(product.averageRating).toFixed(1)
                : 0}
            </span>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-muted-foreground dark:text-slate-400">
              ({product.ratingCount || product.totalSales || 0})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
