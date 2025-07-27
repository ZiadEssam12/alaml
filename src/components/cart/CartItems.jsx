"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CartItems({ items }) {
  //   const { items, updateQuantity, removeItem } = useCart();

  const updateQuantity = (id, quantity) => {
    console.log("Id:", id);
    console.log("quantity:", quantity);
  };

  const removeItem = (id) => {
    console.log("Remove item with id:", id);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">سلة التسوق فارغة</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center space-x-4  p-4 border rounded-lg"
        >
          <div className="relative w-20 h-20">
            <Image
              src={item.imageUrl || "/placeholder.svg"}
              alt={item.name}
              fill
              className="object-cover rounded"
            />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-primary font-bold">{item.price} جنيه</p>
          </div>

          <div className="flex items-center space-x-2 ">
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.maxQuantity}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-left">
            <p className="font-bold">
              {(item.price * item.quantity).toFixed(2)} جنيه
            </p>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
