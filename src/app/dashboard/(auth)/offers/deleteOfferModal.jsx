"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export default function DeleteOfferModal({
  open,
  onCancel,
  onConfirm,
  offer,
  isProcessing = false,
}) {
  if (!offer) return null;

  const isActive = offer.isActive;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div
              className={`p-2 rounded-full ${
                isActive ? "bg-red-100" : "bg-green-100"
              }`}
            >
              {isActive ? (
                <XCircle className="h-6 w-6 text-red-600" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              )}
            </div>
            <div className="space-y-1">
              <DialogTitle>
                {isActive ? "إلغاء تنشيط العرض" : "تنشيط العرض"}
              </DialogTitle>
              <DialogDescription>
                {isActive
                  ? "هل أنت متأكد من رغبتك في إلغاء تنشيط هذا العرض؟ لن يتمكن المستخدمون من استخدامه."
                  : "هل أنت متأكد من رغبتك في إعادة تنشيط هذا العرض؟ سيصبح متاحاً للمستخدمين."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            إلغاء
          </Button>
          <Button
            variant={isActive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isProcessing}
            className={!isActive ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isProcessing
              ? "جاري التنفيذ..."
              : isActive
              ? "نعم، إلغاء التنشيط"
              : "نعم، تنشيط"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
