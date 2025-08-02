"use client";

import { cartContext } from "@/Context/Cart";
import React, { useContext } from "react";
import { Badge } from "../ui/badge";

export default function CartItemsCount() {
  const { totalItemInCart } = useContext(cartContext);
  console.log("number :" , totalItemInCart)
  
  return (
    <Badge
      variant="destructive"
      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
    >
      {totalItemInCart || 0}
    </Badge>
  );
}
