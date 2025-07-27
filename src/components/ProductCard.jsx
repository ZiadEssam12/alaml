import React from "react";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProductCard({
  title = "عنوان المنتج",
  description = "وصف المنتج",
  slug = "product-slug",
  image = "/placeholder.jpg",
  price = 30,
}) {
  const inInCart = false; // Placeholder for cart logic

  return (
    <Card className="overflow-hidden !pt-0">
      {/* Image at the top */}
      <div className="relative h-48 bg-gray-200">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>

      {/* Title */}
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>

      {/* Description */}
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        <p className="text-lg font-semibold">{price} ر.س</p>
      </CardContent>

      {/* Button at the end */}
      <CardFooter className="pt-0">
        <Button
          className="w-full"
          disabled={inInCart}
          variant={inInCart ? "secondary" : "default"}
        >
          {inInCart ? "في السلة" : "أضف للسلة"}
        </Button>
      </CardFooter>
    </Card>
  );
}
