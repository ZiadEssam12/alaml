"use client";

import { useState } from "react";
import { Star, Loader2, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useReviewDialog } from "@/Context/ReviewDialogContext";

export default function ReviewDialog() {
  const { isOpen, closeDialog, mode, review, productId, productName } =
    useReviewDialog();

  const [rating, setRating] = useState(
    mode === "update" && review ? review.rating : 0
  );
  const [comment, setComment] = useState(
    mode === "update" && review ? review.comment : ""
  );
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Form validation
  const isValid = rating > 0 && comment.trim().length >= 10;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValid) {
      setError("يرجى إضافة تقييم وتعليق (10 أحرف على الأقل)");
      return;
    }
    setLoading(true);
    setError("");

    const toastId = toast.loading(
      mode === "update" ? "يتم تحديث التقييم" : "يتم مراجعة التقييم"
    );

    try {
      const url =
        mode === "update" ? `/api/reviews/${review.id}` : "/api/reviews";
      const method = mode === "update" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment: comment.trim() }),
      });
      const data = await response.json();
      toast.dismiss(toastId);

      if (response.ok) {
        toast.success(
          data.message ||
            (mode === "update"
              ? "تم تحديث التقييم بنجاح"
              : "تم إرسال التقييم بنجاح")
        );
        setSuccess(true);
        router.refresh();

        // Close dialog after 2 seconds
        setTimeout(() => {
          closeDialog();
          setSuccess(false);
          setRating(0);
          setComment("");
        }, 2000);
      } else {
        toast.error(
          data.error ||
            (mode === "update"
              ? "حدث خطأ أثناء تحديث التقييم"
              : "حدث خطأ أثناء مراجعة التقييم")
        );
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(
        mode === "update"
          ? "حدث خطأ أثناء تحديث التقييم"
          : "حدث خطأ أثناء مراجعة التقييم"
      );
    } finally {
      setLoading(false);
    }
  };

  // Render stars for rating input
  const renderRatingStars = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= (hoveredRating || rating);

        return (
          <button
            key={index}
            type="button"
            onClick={() => setRating(starValue)}
            onMouseEnter={() => setHoveredRating(starValue)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            disabled={loading}
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                isActive
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-300"
              }`}
            />
          </button>
        );
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-right text-gray-900 dark:text-slate-100">
            {mode === "update" ? "تحديث التقييم" : "قيم منتج"}: {productName}
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
              {mode === "update"
                ? "تم تحديث تقييمك بنجاح!"
                : "تم إرسال تقييمك بنجاح!"}
            </h3>
            <p className="text-gray-600 dark:text-slate-400">
              {mode === "update"
                ? "تم حفظ التغييرات"
                : "سيتم مراجعته ونشره قريباً"}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400 text-right">
                {mode === "update"
                  ? "قم بتحديث تقييمك للمنتج"
                  : "تقييمك يساعد العملاء الآخرين في اتخاذ قرار الشراء"}
              </p>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-3 text-right">
                التقييم *
              </label>
              <div className="flex items-center justify-center gap-1 mb-2">
                {renderRatingStars()}
              </div>
              <p className="text-xs text-gray-600 dark:text-slate-400 text-center">
                {rating > 0 && (
                  <span>
                    {rating === 1 && "ضعيف جداً"}
                    {rating === 2 && "ضعيف"}
                    {rating === 3 && "متوسط"}
                    {rating === 4 && "جيد"}
                    {rating === 5 && "ممتاز"}
                  </span>
                )}
              </p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-2 text-right">
                التعليق *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="شارك تجربتك مع المنتج... (10 أحرف على الأقل)"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 resize-none text-right"
                disabled={loading}
                dir="rtl"
              />
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 text-right">
                {comment.length}/500 حرف
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400 text-right">
                  {error}
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
              <Button
                type="submit"
                disabled={!isValid || loading}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === "update" ? "جاري التحديث..." : "جاري الإرسال..."}
                  </>
                ) : mode === "update" ? (
                  "تحديث التقييم"
                ) : (
                  "إرسال التقييم"
                )}
              </Button>

              <Button
                type="button"
                onClick={closeDialog}
                disabled={loading}
                variant="outline"
                className="px-4 py-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                إلغاء
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
