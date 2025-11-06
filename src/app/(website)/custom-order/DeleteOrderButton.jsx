"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

export default function DeleteOrderButton({ orderId, status }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Don't show delete button if order is completed or refused
  const isCompleted = status === "done" || status === "refused";

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/custom-orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "refused" }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "فشل في حذف الطلب");
        return;
      }

      toast.success(data.message || "تم إلغاء الطلب بنجاح!");
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("حدث خطأ أثناء إلغاء الطلب");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompleted) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="gap-2 mt-4 w-full"
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4" />
          حذف الطلب
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>تأكيد حذف الطلب</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من رغبتك في حذف هذا الطلب؟ لا يمكن التراجع عن هذا
            الإجراء.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "جاري الحذف..." : "تأكيد الحذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
