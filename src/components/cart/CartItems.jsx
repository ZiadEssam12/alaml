"use client";

import Image from "next/image";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cartContext } from "@/Context/Cart";
import { useState, useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export function CartItems() {
  const { cart, updateCartItem, emptyCart, removeCartItem } =
    useContext(cartContext);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* Button to empty cart */}
      <div className="flex justify-end mb-4">
        <Button variant="destructive" onClick={() => setShowModal(true)}>
          <Trash2 className="h-4 w-4 ml-2" />
          حذف جميع المنتجات
        </Button>
      </div>

      {/* Modal confirmation */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تنبيه</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p>سيتم حذف جميع المنتجات من السلة. هل أنت متأكد؟</p>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                router.refresh();
                emptyCart();
                setShowModal(false);
              }}
            >
              حذف الكل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {cart.map((item) => (
        <div
          key={item.id}
          className="flex flex-col lg:flex-row items-center lg:space-x-4 space-y-4 lg:space-y-0 p-4 border rounded-lg"
        >
          <div className="relative">
            <img
              src={item.imageUrl || "/placeholder.svg"}
              alt={item.name}
              className="object-contain rounded  w-20 h-20  "
            />
          </div>

          <div className="flex-1 text-center lg:text-right">
            <h3 className="font-semibold">{item.name}</h3>
            {item.variantOptions && (
              <p className="text-sm mt-1 font-medium">{item.variantOptions}</p>
            )}
            <p className="text-primary font-bold">{item.price} جنيه</p>
          </div>

          <div className="flex items-center justify-center lg:justify-start space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateCartItem(item.id, -1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateCartItem(item.id, 1)}
              disabled={item.quantity >= item.maxQuantity}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center lg:text-left">
            <p className="font-bold">
              {(item.price * item.quantity).toFixed(2)} جنيه
            </p>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => removeCartItem(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
