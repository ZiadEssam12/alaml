"use client";

import { PaginationClient } from "@/components/Pagination";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCcw,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

// // Dynamic import for AddingOfferForm with skeleton loader
// const AddingOfferForm = dynamic(() => import("./AddingOfferForm"), {
//   loading: () => <OfferFormSkeleton />,
//   ssr: false,
// });
const AddingOfferForm = () => {};

// OfferFormSkeleton component for loading state
function OfferFormSkeleton() {
  return (
    <div className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
      <div className="mb-6">
        <Skeleton className="h-6 w-48 mb-2" />
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-24 w-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-32 w-full" />
        </div>

        <div className="flex justify-end space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}

function OffersManagementContent() {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scope: "product", // product, category, variant
    productId: "",
    categoryId: "",
    variantId: "",
    type: "percentage", // percentage, fixed, free_shipping
    value: 0,
    code: "",
    isActive: true,
    isAutoApply: true,
    maxUsageCount: null,
    perUserUsageCount: null,
    maxDiscountAmount: null,
    minCartAmount: 0,
    startDate: "",
    expirationDate: "",
  });
  const [pagination, setPagination] = useState({});

  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const q = searchParams.get("q") || "";

  useEffect(() => {
    const fetchDataWrapper = async () => {
      try {
        setLoading(true);
        // TODO: Implement fetchOffersDataClient function
        // const { offers, products, categories, pagination } =
        //   await fetchOffersDataClient({
        //     q,
        //     page,
        //     pageSize,
        //   });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("خطأ في جلب البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchDataWrapper();
  }, [q, page, pageSize]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implement offer creation/update logic
      toast.success("تم حفظ العرض بنجاح");
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving offer:", error);
      toast.error("خطأ في حفظ العرض");
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      scope: offer.scope,
      productId: offer.productId || "",
      categoryId: offer.categoryId || "",
      variantId: offer.variantId || "",
      type: offer.type,
      value: offer.value,
      code: offer.code || "",
      isActive: offer.isActive,
      isAutoApply: offer.isAutoApply,
      maxUsageCount: offer.maxUsageCount,
      perUserUsageCount: offer.perUserUsageCount,
      maxDiscountAmount: offer.maxDiscountAmount,
      minCartAmount: offer.minCartAmount,
      startDate: offer.startDate,
      expirationDate: offer.expirationDate,
    });
    setDialogOpen(true);
  };

  const handleToggleStatus = async (offerId, currentStatus) => {
    const action = currentStatus ? "إلغاء تنشيط" : "تنشيط";
    const confirmMessage = `هل أنت متأكد من ${action} هذا العرض؟`;

    if (confirm(confirmMessage)) {
      try {
        // TODO: Implement toggle offer status logic
        toast.success(
          `تم ${!currentStatus ? "تنشيط" : "إلغاء تنشيط"} العرض بنجاح`
        );

        setOffers(
          offers.map((offer) =>
            offer.id === offerId
              ? { ...offer, isActive: !currentStatus }
              : offer
          )
        );
      } catch (error) {
        console.error("Error toggling offer status:", error);
        toast.error("خطأ في تغيير حالة العرض");
      }
    }
  };

  const handleDelete = async (offerId) => {
    if (confirm("هل أنت متأكد من حذف هذا العرض؟")) {
      try {
        // TODO: Implement delete offer logic
        toast.success("تم حذف العرض بنجاح");
      } catch (error) {
        console.error("Error deleting offer:", error);
        toast.error("خطأ في حذف العرض");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      scope: "product",
      productId: "",
      categoryId: "",
      variantId: "",
      type: "percentage",
      value: 0,
      code: "",
      isActive: true,
      isAutoApply: true,
      maxUsageCount: null,
      perUserUsageCount: null,
      maxDiscountAmount: null,
      minCartAmount: 0,
      startDate: "",
      expirationDate: "",
    });
    setEditingOffer(null);
  };

  return (
    <div className="space-y-6 container my-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة العروض والخصومات</h1>
          <p className="text-muted-foreground">
            إضافة وتعديل وإدارة عروض وخصومات المتجر
          </p>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة عرض جديد
        </Button>

        <AddingOfferForm
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          editingOffer={editingOffer}
          formData={formData}
          setFormData={setFormData}
          products={products}
          categories={categories}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
        />
      </div>

      {loading ? (
        <>
          <OffersSkeletonLoader />
        </>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2">عنوان العرض</th>
                  <th className="px-4 py-2">الوصف</th>
                  <th className="px-4 py-2">النوع</th>
                  <th className="px-4 py-2">القيمة</th>
                  <th className="px-4 py-2">النطاق</th>
                  <th className="px-4 py-2">تطبيق تلقائي</th>
                  <th className="px-4 py-2">تاريخ البداية</th>
                  <th className="px-4 py-2">تاريخ الانتهاء</th>
                  <th className="px-4 py-2">الحالة</th>
                  <th className="px-4 py-2">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {offers.length === 0 ? (
                  <tr className="border-b">
                    <td
                      colSpan={10}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        لا توجد عروض متاحة
                      </p>
                    </td>
                  </tr>
                ) : (
                  offers.map((offer) => (
                    <tr
                      key={offer.id}
                      className="hover:bg-muted/50 transition border-b h-16 align-middle"
                    >
                      <td className="px-4 py-2 font-semibold">{offer.title}</td>
                      <td className="px-4 py-2 truncate max-w-[200px]">
                        {offer.description || "-"}
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {offer.type === "percentage"
                            ? "نسبة مئوية"
                            : offer.type === "fixed"
                            ? "مبلغ ثابت"
                            : "شحن مجاني"}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {offer.value}
                        {offer.type === "percentage" ? "%" : " ج.م"}
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                          {offer.scope === "product"
                            ? "منتج"
                            : offer.scope === "category"
                            ? "فئة"
                            : "متغير"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        {offer.isAutoApply ? (
                          <Check className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-red-600 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {new Date(offer.startDate).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {new Date(offer.expirationDate).toLocaleDateString(
                          "ar-EG"
                        )}
                      </td>
                      <td className="px-4 py-2 h-full">
                        <div className="flex flex-col items-center gap-1">
                          {offer.isActive ? (
                            <span className="inline-block rounded-full p-2 text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              <Check className="h-4 w-4 text-green-800" />
                            </span>
                          ) : (
                            <span className="inline-block rounded-full p-2 text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                              <X className="h-4 w-4 text-red-800" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(offer)}
                            title="تعديل"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleStatus(offer.id, offer.isActive)
                            }
                            title={
                              offer.isActive
                                ? "إلغاء تنشيط العرض"
                                : "تنشيط العرض"
                            }
                          >
                            {offer.isActive ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(offer.id)}
                            title="حذف"
                            className="hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
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
        basePath="/dashboard/offers"
        currentPage={pagination.currentPage}
        maxPage={pagination.totalPages}
      />
    </div>
  );
}

function OffersSkeletonLoader() {
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2">عنوان العرض</th>
            <th className="px-4 py-2">الوصف</th>
            <th className="px-4 py-2">النوع</th>
            <th className="px-4 py-2">القيمة</th>
            <th className="px-4 py-2">النطاق</th>
            <th className="px-4 py-2">تطبيق تلقائي</th>
            <th className="px-4 py-2">تاريخ البداية</th>
            <th className="px-4 py-2">تاريخ الانتهاء</th>
            <th className="px-4 py-2">الحالة</th>
            <th className="px-4 py-2">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, idx) => (
            <tr key={idx} className="border-b animate-pulse h-16 align-middle">
              <td className="px-4 py-2">
                <Skeleton className="h-4 w-32 rounded" />
              </td>
              <td className="px-4 py-2">
                <Skeleton className="h-4 w-40 rounded" />
              </td>
              <td className="px-4 py-2">
                <Skeleton className="h-6 w-16 rounded" />
              </td>
              <td className="px-4 py-2">
                <Skeleton className="h-4 w-12 rounded" />
              </td>
              <td className="px-4 py-2">
                <Skeleton className="h-6 w-16 rounded" />
              </td>
              <td className="px-4 py-2 text-center">
                <Skeleton className="h-4 w-4 mx-auto rounded" />
              </td>
              <td className="px-4 py-2">
                <Skeleton className="h-4 w-20 rounded" />
              </td>
              <td className="px-4 py-2">
                <Skeleton className="h-4 w-20 rounded" />
              </td>
              <td className="px-4 py-2">
                <Skeleton className="h-8 w-8 rounded-full mx-auto" />
              </td>
              <td className="px-4 py-2 text-center">
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

export default function OffersManagement() {
  return (
    <React.Suspense fallback={<OfferFormSkeleton />}>
      <OffersManagementContent />
    </React.Suspense>
  );
}
