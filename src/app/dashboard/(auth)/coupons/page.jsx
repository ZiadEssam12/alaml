"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Search,
  Check,
  X,
  EyeOff,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import { PaginationClient } from "@/components/Pagination";
import SearchBox from "@/components/dashbaord/SearchBox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSearchParams } from "next/navigation";

const fetchCoupons = async ({ q, page, pageSize }) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/coupons?page=${page}&pageSize=${pageSize}&q=${q}`
  );
  const data = await response.json();
  return data;
};

function CouponsManagementContent() {
  // Toggle coupon status (active/inactive)
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

    // Validate required fields
    if (!formData.code || formData.code.trim() === "") {
      toast.error("كود الكوبون مطلوب");
      return;
    }
    if (!formData.type) {
      toast.error("نوع الكوبون مطلوب");
      return;
    }
    if (!formData.value || isNaN(formData.value)) {
      toast.error("قيمة الخصم مطلوبة");
      return;
    }
    if (!formData.startDate) {
      toast.error("تاريخ البداية مطلوب");
      return;
    }
    if (!formData.expirationDate) {
      toast.error("تاريخ الانتهاء مطلوب");
      return;
    }

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

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      value: 0,
      maxUsageCount: 0,
      expirationDate: "",
      startDate: "",
      expirationDate: "",
    });
    setEditingCoupon(null);
  };

  return (
    <div className="space-y-6 py-10 container">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الكوبونات</h1>
          <p className="text-muted-foreground">
            إضافة وتعديل وإدارة كوبونات الخصم
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة كوبون جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? "تعديل الكوبون" : "إضافة كوبون جديد"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coupon Code */}
                <div className="space-y-2">
                  <Label htmlFor="code">كود الكوبون</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Coupon Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {/* Coupon Type */}
                <div className="space-y-2 w-full">
                  <Label htmlFor="type">نوع الكوبون</Label>
                  <DropdownMenu className="w-full">
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full">
                        {couponTypes.find(
                          (type) => type.value === formData.type
                        )?.label || "اختر نوع الكوبون"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-full">
                      {couponTypes.map((type) => (
                        <DropdownMenuItem
                          key={type.value}
                          className="w-full"
                          onClick={() =>
                            setFormData({ ...formData, type: type.value })
                          }
                        >
                          {type.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Value */}
                <div className="space-y-2">
                  <Label htmlFor="value">قيمة الخصم</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        value: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Max Usage Count */}
                <div className="space-y-2">
                  <Label htmlFor="maxUsageCount">عدد مرات الاستخدام</Label>
                  <Input
                    id="maxUsageCount"
                    type="number"
                    value={formData.maxUsageCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxUsageCount: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>

                {/* Per User Usage Count */}
                <div className="space-y-2">
                  <Label htmlFor="perUserUsageCount">
                    عدد مرات الاستخدام لكل مستخدم
                  </Label>
                  <Input
                    id="perUserUsageCount"
                    type="number"
                    value={formData.perUserUsageCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        perUserUsageCount: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                {/* Max Discount Amount */}
                <div className="space-y-2">
                  <Label htmlFor="maxDiscountAmount">الحد الأقصى للخصم</Label>
                  <Input
                    id="maxDiscountAmount"
                    type="number"
                    step="0.01"
                    value={formData.maxDiscountAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxDiscountAmount:
                          Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="startDate">تاريخ البداية</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                {/* Expiration Date */}
                <div className="space-y-2">
                  <Label htmlFor="expirationDate">تاريخ الانتهاء</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expirationDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingCoupon ? "تحديث الكوبون" : "إضافة الكوبون"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
                <th className="px-4 py-2">الحد الأقصى للخصم</th>
                <th className="px-4 py-2">تاريخ البداية</th>
                <th className="px-4 py-2">تاريخ الانتهاء</th>
                <th className="px-4 py-2">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b animate-pulse">
                  {Array.from({ length: 9 }).map((_, j) => (
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
                <th className="px-4 py-2">الحد الأقصى للخصم</th>
                <th className="px-4 py-2">تاريخ البداية</th>
                <th className="px-4 py-2">تاريخ الانتهاء</th>
                <th className="px-4 py-2">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8">
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
                    <td className="px-4 py-2">{coupon.maxDiscountAmount}</td>
                    <td className="px-4 py-2">{coupon.startDate}</td>
                    <td className="px-4 py-2">{coupon.expirationDate}</td>
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
