"use client";

import { cartContext } from "@/Context/Cart";
import React, { useContext } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ShoppingCart } from "lucide-react";
import { loadingContext } from "@/Context/LoadinContext";
import { Skeleton } from "../ui/skeleton";

export default function CartItemsCount() {
  const { totalItemInCart } = useContext(cartContext);
  const { loading, setLoading } = useContext(loadingContext);

  if (loading) {
    return (
      <>
        <div className="">
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </>
    );
  }

  return (
    <Button variant="ghost" size="icon" className="relative">
      <ShoppingCart className="h-5 w-5" />
      <Badge
        variant="destructive"
        className="absolute -top-2 -right-2 z-50 h-5 w-5 flex items-center justify-center p-0 text-xs"
      >
        {totalItemInCart || 0}
      </Badge>
      <span className="sr-only">عربة التسوق</span>
    </Button>
  );
}
