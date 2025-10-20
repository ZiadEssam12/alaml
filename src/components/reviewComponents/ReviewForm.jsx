"use client";

import { AlertCircle, X, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import ReviewDialog from "./ReviewDialog";

export default function ReviewForm({
  productId,
  productName,
  onReviewSubmitted,
  userHasPurchased = false,
  userHasReviewed = false,
  userReview = null,
}) {
  const { data: session, status } = useSession();

  // Show login prompt
  if (status === "loading") {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    );
  }

  if (!session) {
    return;
  }

  // Show purchase requirement
  if (!userHasPurchased) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-amber-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">
            قيم المنتج بعد الشراء
          </h3>
          <p className="text-gray-600 dark:text-slate-400">
            يمكنك إضافة تقييم بعد شراء هذا المنتج
          </p>
        </div>
      </div>
    );
  }

  // Show already reviewed message
  if (userHasReviewed) {
    return null;
  }

  if (userReview) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
        <div className="text-center">
          <X className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-700" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">
            تقييم قيد المراجعة
          </h3>
          <p className="text-gray-600 dark:text-slate-400">
            لقد قمت بإرسال تقييم لهذا المنتج وهو قيد المراجعة حالياً.
          </p>
        </div>
      </div>
    );
  }

  // Show review modal trigger
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800">
      <div className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">
            شارك تجربتك مع المنتج
          </h3>
          <p className="text-gray-600 dark:text-slate-400 mb-4">
            ساعد العملاء الآخرين باختيار المنتج المناسب
          </p>

          <ReviewDialog
            productId={productId}
            productName={productName}
            onReviewSubmitted={onReviewSubmitted}
            triggerLabel="كتابة تقييم"
            triggerClassName="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
