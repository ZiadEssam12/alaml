"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

import { Edit, Package, Check, X, EyeOff, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { PaginationClient } from "@/components/Pagination";
import SearchBox from "@/components/dashbaord/SearchBox";
import { useSearchParams } from "next/navigation";

const AddingCouponForm = dynamic(() => import("./AddingCouponForm"), {
  loading: () => <CouponFormSkeleton />,
  ssr: false,
});

function CouponFormSkeleton() {
  return (
    <Button disabled className="animate-pulse">
      <div className="h-4 w-4 ml-2 bg-muted rounded animate-pulse" />
      <span className="bg-muted h-4 w-24 rounded animate-pulse ml-2" />
    </Button>
  );
}

const fetchCoupons = async ({ q, page, pageSize }) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/coupons?page=${page}&pageSize=${pageSize}&q=${q}`
  );
  const data = await response.json();
  return data;
};

function CouponsManagementContent() {
  const handleToggleStatus = async (couponId, currentStatus) => {
    const action = currentStatus ? "إلغاء تنشيط" : "تنشيط";
    if (confirm(`هل أنت متأكد من ${action} هذا الكوبون؟`)) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/coupons/${couponId}/toggle-status`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !currentStatus }),
          }
        );
        if (res.ok) {
          toast.success(`تم ${action} الكوبون بنجاح`);
          // Refresh coupons list
          const { data, pagination } = await fetchCoupons({
            q,
            page,
            pageSize,
          });
          setCoupons(data);
          setPagination(pagination);
        } else {
          const errorMsg = await res.text();
          toast.error(`خطأ في تغيير الحالة: ${errorMsg}`);
        }
      } catch (error) {
        console.error("Error toggling coupon status:", error);
        toast.error("فشل في تغيير حالة الكوبون");
      }
    }
  };
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "",
    value: 0,
    maxUsageCount: 0,
    perUserUsageCount: 0,
    maxDiscountAmount: 0,
    startDate: "",
    expirationDate: "",
  });
  const [pagination, setPagination] = useState({});

  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const q = searchParams.get("q") || "";

  const couponTypes = [
    { value: "percentage", label: "نسبة مئوية" },
    { value: "fixed", label: "قيمة ثابتة" },
    { value: "free_shipping", label: "شحن مجاني" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, pagination } = await fetchCoupons({ q, page, pageSize });
        setCoupons(data);
        setPagination(pagination);
      } catch (error) {
        console.error("Error fetching coupons:", error);
        toast.error("خطأ في جلب البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [q, page, pageSize]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const couponData = {
        code: formData.code,
        description: formData.description,
        type: formData.type,
        value: formData.value,
        maxUsageCount: formData.maxUsageCount,
        perUserUsageCount: formData.perUserUsageCount,
        maxDiscountAmount: formData.maxDiscountAmount,
        startDate: formData.startDate,
        expirationDate: formData.expirationDate,
      };

      let res;
      if (editingCoupon) {
        res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/coupons/${editingCoupon.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(couponData),
          }
        );
        if (res.ok) toast.success("تم تحديث الكوبون بنجاح");
        else {
          const errorMsg = await res.text();
          toast.error(`خطأ في التحديث: ${errorMsg}`);
          throw new Error("Update failed");
        }
      } else {
        res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/coupons`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(couponData),
          }
        );
        if (res.ok) toast.success("تم إضافة الكوبون بنجاح");
        else {
          const errorMsg = await res.text();
          toast.error(`خطأ في الإضافة: ${errorMsg}`);
          throw new Error("Add failed");
        }
      }

      setDialogOpen(false);
      resetForm();
      fetchCoupons({ q, page, pageSize });
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error(error.message || "خطأ في حفظ الكوبون");
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      maxUsageCount: coupon.maxUsageCount,
      perUserUsageCount: coupon.perUserUsageCount || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || 0,
      startDate: coupon.startDate,
      expirationDate: coupon.expirationDate,
    });
    setDialogOpen(true);
  };

  const handleCouponTypeChange = (type) => {
    setFormData((prev) => {
      if (type === "fixed") {
        return {
          ...prev,
          type,
          maxDiscountAmount: prev.value, // Sync maxDiscountAmount with value
        };
      } else if (type === "free_shipping") {
        return {
          ...prev,
          type,
          value: undefined, // Remove value for free_shipping
          maxDiscountAmount: undefined, // Remove maxDiscountAmount for free_shipping
        };
      } else {
        return {
          ...prev,
          type,
        };
      }
    });
  };

  const filteredInputs = () => {
    if (formData.type === "free_shipping") {
      return ["code", "description", "type", "startDate", "expirationDate"];
    } else if (formData.type === "fixed") {
      return [
        "code",
        "description",
        "type",
        "value",
        "startDate",
        "expirationDate",
      ];
    } else {
      return Object.keys(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      type: "",
      value: 0,
      maxUsageCount: 0,
      perUserUsageCount: 0,
      maxDiscountAmount: 0,
      startDate: "",
      expirationDate: "",
    });
    setEditingCoupon(null);
  };

  // Function to format dates in Arabic
  const formatArabicDate = (dateString) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 py-10 container max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الكوبونات</h1>
          <p className="text-muted-foreground">
            إضافة وتعديل وإدارة كوبونات الخصم
          </p>
        </div>

        <AddingCouponForm
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          formData={formData}
          setFormData={setFormData}
          editingCoupon={editingCoupon}
          setEditingCoupon={setEditingCoupon}
          handleSubmit={handleSubmit}
          handleCouponTypeChange={handleCouponTypeChange}
          couponTypes={couponTypes}
          resetForm={resetForm}
        />
      </div>

      <SearchBox placeholder="البحث في الكوبونات..." />

      {loading ? (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2">كود الكوبون</th>
                <th className="px-4 py-2">الوصف</th>
                <th className="px-4 py-2">نوع الكوبون</th>
                <th className="px-4 py-2">قيمة الخصم</th>
                <th className="px-4 py-2">عدد مرات الاستخدام</th>
                <th className="px-4 py-2">الاستخدام الحالي</th>
                <th className="px-4 py-2">الحد الأقصى للخصم</th>
                <th className="px-4 py-2">تاريخ البداية</th>
                <th className="px-4 py-2">تاريخ الانتهاء</th>
                <th className="px-4 py-2">الحالة</th>
                <th className="px-4 py-2">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b animate-pulse">
                  {Array.from({ length: 11 }).map((_, j) => (
                    <td key={j} className="px-4 py-2">
                      <div className="h-5 bg-muted rounded w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2">كود الكوبون</th>
                <th className="px-4 py-2">الوصف</th>
                <th className="px-4 py-2">نوع الكوبون</th>
                <th className="px-4 py-2">قيمة الخصم</th>
                <th className="px-4 py-2">عدد مرات الاستخدام</th>
                <th className="px-4 py-2">الاستخدام الحالي</th>
                <th className="px-4 py-2">الحد الأقصى للخصم</th>
                <th className="px-4 py-2">تاريخ البداية</th>
                <th className="px-4 py-2">تاريخ الانتهاء</th>
                <th className="px-4 py-2">الحالة</th>
                <th className="px-4 py-2">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">لا توجد كوبونات</p>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b">
                    <td className="px-4 py-2">{coupon.code}</td>
                    <td className="px-4 py-2">{coupon.description}</td>
                    <td className="px-4 py-2">{coupon.type}</td>
                    <td className="px-4 py-2">{coupon.value}</td>
                    <td className="px-4 py-2">{coupon.maxUsageCount}</td>
                    <td className="px-4 py-2">{coupon.usages?.length || 0}</td>
                    <td className="px-4 py-2">{coupon.maxDiscountAmount}</td>
                    <td className="px-4 py-2">
                      {formatArabicDate(coupon.startDate)}
                    </td>
                    <td className="px-4 py-2">
                      {formatArabicDate(coupon.expirationDate)}
                    </td>
                    <td className="px-4 py-2 h-full">
                      <div className="flex flex-col items-center gap-1">
                        {coupon.isActive ? (
                          <>
                            <span className="inline-block rounded-full p-2 text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              <Check className="h-4 w-4 text-green-800" />
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="inline-block rounded-full p-2 text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                              <X className="h-4 w-4 text-red-800" />
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(coupon)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleToggleStatus(coupon.id, coupon.isActive)
                          }
                        >
                          {coupon.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <PaginationClient
          basePath="/dashboard/coupons"
          currentPage={pagination.currentPage}
          maxPage={pagination.totalPages}
        />
      )}
    </div>
  );
}

export default function CouponsManagement() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <CouponsManagementContent />
    </Suspense>
  );
}
