"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

function AddingCouponForm({
  dialogOpen,
  setDialogOpen,
  formData,
  setFormData,
  editingCoupon,
  setEditingCoupon,
  handleSubmit,
  handleCouponTypeChange,
  couponTypes,
  resetForm,
}) {
  return (
    <>
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
                      {couponTypes.find((type) => type.value === formData.type)
                        ?.label || "اختر نوع الكوبون"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-full">
                    {couponTypes.map((type) => (
                      <DropdownMenuItem
                        key={type.value}
                        className="w-full"
                        onClick={() => handleCouponTypeChange(type.value)}
                      >
                        {type.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Value */}
              {formData.type !== "free_shipping" && (
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
                    required={
                      formData.type === "percentage" ||
                      formData.type === "fixed"
                    }
                  />
                </div>
              )}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Min Cart Amount */}
              <div className="space-y-2">
                <Label htmlFor="minCartAmount">الحد الأدنى للسلة</Label>
                <Input
                  id="minCartAmount"
                  type="number"
                  step="0.01"
                  value={formData.minCartAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minCartAmount: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                />
              </div>

              {/* Max Discount Amount for Percentage */}
              {formData.type === "percentage" && (
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
              )}
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
    </>
  );
}

export default AddingCouponForm;
