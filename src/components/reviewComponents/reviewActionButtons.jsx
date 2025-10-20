"use client";

import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReviewUpdateButton({ onClick, disabled = false }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="ghost"
      size="sm"
      className="h-8 px-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 transition-colors gap-2"
      title="تعديل التقييم"
    >
      <Edit className="h-4 w-4" />
      <span className="text-xs font-medium">تعديل</span>
    </Button>
  );
}

export function ReviewDeleteButton({
  onClick,
  disabled = false,
  isLoading = false,
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      variant="ghost"
      size="sm"
      className="h-8 px-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-colors gap-2"
      title="حذف التقييم"
    >
      {isLoading ? (
        <span className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      <span className="text-xs font-medium">حذف</span>
    </Button>
  );
}
