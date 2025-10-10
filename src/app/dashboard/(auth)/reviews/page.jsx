"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, Check, X, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";
import SearchBox from "@/components/dashbaord/SearchBox";
import { PaginationClient } from "@/components/Pagination";
import { enReasonToArabic } from "@/lib/utils";
import {
  fetchReviewsClient,
  approveReview,
  rejectReview,
  deleteReview,
} from "@/lib/api/dashboard/reviewsAPI.client";

function ReviewsManagementContent() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const statusFilter = filterStatus === "all" ? "" : filterStatus;
        const { reviews, pagination } = await fetchReviewsClient({
          page,
          pageSize,
          status: statusFilter,
        });

        if (reviews) {
          setReviews(reviews);
        }

        if (pagination) {
          setPagination(pagination);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error(
          "فشل في تحميل التقييمات. الرجاء التحقق من اتصال الإنترنت والمحاولة مرة أخرى"
        );
        setReviews([]);
        setPagination({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, pageSize, filterStatus]);

  const handleApprove = async (reviewId) => {
    if (confirm("هل أنت متأكد من قبول هذا التقييم؟")) {
      try {
        await approveReview(reviewId);
        toast.success("تم قبول التقييم بنجاح");
        // Update local state
        setReviews(
          reviews.map((review) =>
            review.id === reviewId ? { ...review, status: "approved" } : review
          )
        );
      } catch (error) {
        console.error("Error approving review:", error);
        toast.error(
          error.message ||
            "حدث خطأ غير متوقع. الرجاء التحقق من اتصال الإنترنت والمحاولة مرة أخرى"
        );
      }
    }
  };

  const handleReject = async (reviewId) => {
    if (confirm("هل أنت متأكد من رفض هذا التقييم؟")) {
      try {
        await rejectReview(reviewId);
        toast.success("تم رفض التقييم بنجاح");
        // Update local state
        setReviews(
          reviews.map((review) =>
            review.id === reviewId ? { ...review, status: "rejected" } : review
          )
        );
      } catch (error) {
        console.error("Error rejecting review:", error);
        toast.error(
          error.message ||
            "حدث خطأ غير متوقع. الرجاء التحقق من اتصال الإنترنت والمحاولة مرة أخرى"
        );
      }
    }
  };

  const handleDelete = async (reviewId) => {
    if (
      confirm(
        "هل أنت متأكد من حذف هذا التقييم نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
      )
    ) {
      try {
        await deleteReview(reviewId);
        toast.success("تم حذف التقييم بنجاح");
        // Remove from local state
        setReviews(reviews.filter((review) => review.id !== reviewId));
      } catch (error) {
        console.error("Error deleting review:", error);
        toast.error(
          error.message ||
            "حدث خطأ غير متوقع. الرجاء التحقق من اتصال الإنترنت والمحاولة مرة أخرى"
        );
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <Check className="h-3 w-3" />
            مقبول
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <X className="h-3 w-3" />
            مرفوض
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <MessageSquare className="h-3 w-3" />
            قيد المراجعة
          </span>
        );
      default:
        return null;
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Star
            key={idx}
            className={`h-4 w-4 ${
              idx < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 container my-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة التقييمات</h1>
          <p className="text-muted-foreground">
            مراجعة وقبول أو رفض تقييمات العملاء
          </p>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filterStatus === "all" ? "default" : "outline"}
          onClick={() => setFilterStatus("all")}
        >
          الكل
        </Button>
        <Button
          variant={filterStatus === "pending" ? "default" : "outline"}
          onClick={() => setFilterStatus("pending")}
        >
          قيد المراجعة
        </Button>
        <Button
          variant={filterStatus === "approved" ? "default" : "outline"}
          onClick={() => setFilterStatus("approved")}
        >
          المقبولة
        </Button>
        <Button
          variant={filterStatus === "rejected" ? "default" : "outline"}
          onClick={() => setFilterStatus("rejected")}
        >
          المرفوضة
        </Button>
      </div>

      {loading ? (
        <ReviewsSkeletonLoader />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2">اسم المنتج</th>
                  <th className="px-4 py-2">اسم المستخدم</th>
                  <th className="px-4 py-2">التقييم</th>
                  <th className="px-4 py-2">التعليق</th>
                  <th className="px-4 py-2">الحالة</th>
                  <th className="px-4 py-2">السبب</th>
                  <th className="px-4 py-2">التاريخ</th>
                  <th className="px-4 py-2">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length === 0 ? (
                  <tr className="border-b">
                    <td
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">لا توجد تقييمات</p>
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <tr
                      key={review.id}
                      className="hover:bg-muted/50 transition border-b align-middle"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {review.productName}
                          </span>
                          {review.product && (
                            <Link
                              href={`/products/${review.product.slug}`}
                              target="_blank"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              عرض المنتج
                            </Link>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">{review.userName}</td>
                      <td className="px-4 py-3">
                        {renderStars(review.rating)}
                      </td>
                      <td className="px-4 py-3 max-w-[300px]">
                        <p className="line-clamp-2 text-sm">{review.comment}</p>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(review.status)}
                      </td>
                      <td className="px-4 py-3">
                        {review.reason ? (
                          <p className="text-sm text-red-600">
                            {enReasonToArabic(review.reason)}
                          </p>
                        ) : (
                          <span className="text-sm text-green-600">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(review.createdAt).toLocaleDateString(
                          "ar-EG",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center items-center gap-2">
                          {review.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(review.id)}
                                title="قبول التقييم"
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(review.id)}
                                title="رفض التقييم"
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {review.status === "approved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(review.id)}
                              title="رفض التقييم"
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          {review.status === "rejected" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(review.id)}
                              title="قبول التقييم"
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(review.id)}
                            title="حذف التقييم"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <PaginationClient
        basePath="/dashboard/reviews"
        currentPage={pagination.page}
        maxPage={pagination.totalPages}
      />
    </div>
  );
}

function ReviewsSkeletonLoader() {
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2">اسم المنتج</th>
            <th className="px-4 py-2">اسم المستخدم</th>
            <th className="px-4 py-2">التقييم</th>
            <th className="px-4 py-2">التعليق</th>
            <th className="px-4 py-2">الحالة</th>
            <th className="px-4 py-2">التاريخ</th>
            <th className="px-4 py-2">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, idx) => (
            <tr key={idx} className="border-b animate-pulse align-middle">
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-32 rounded" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-24 rounded" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-20 rounded" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-48 rounded" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-6 w-24 rounded-full" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-20 rounded" />
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ReviewsManagement() {
  return (
    <Suspense fallback={<ReviewsSkeletonLoader />}>
      <ReviewsManagementContent />
    </Suspense>
  );
}
