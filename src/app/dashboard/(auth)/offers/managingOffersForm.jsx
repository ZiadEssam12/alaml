"use client";

import React, { useEffect } from "react";
import { useFormik } from "formik";
import { OfferFormSchema } from "@/schema/dashboard/managingOffers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ManagingOffersForm({
  offer = null,
  products = [],
  categories = [],
  variants = [],
  onSubmit,
  onCancel,
  open = false,
}) {
  const initialValues = offer
    ? {
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
        maxUsageCount: offer.maxUsageCount || "",
        perUserUsageCount: offer.perUserUsageCount || "",
        maxDiscountAmount: offer.maxDiscountAmount || "",
        minCartAmount: offer.minCartAmount || "",
        startDate: offer.startDate?.split("T")[0] || "",
        expirationDate: offer.expirationDate?.split("T")[0] || "",
      }
    : {
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
        maxUsageCount: "",
        perUserUsageCount: "",
        maxDiscountAmount: "",
        minCartAmount: "",
        startDate: "",
        expirationDate: "",
      };

  const formik = useFormik({
    initialValues,
    validationSchema: OfferFormSchema(),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error("Form submission error:", error);
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = formik;

  const getErrorMessage = (field) => {
    return touched[field] && errors[field] ? errors[field] : "";
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onCancel();
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{offer ? "تعديل العرض" : "إنشاء عرض جديد"}</DialogTitle>
          <DialogDescription>
            {offer ? "قم بتحديث تفاصيل العرض" : "أضف عرض جديد إلى متجرك"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pr-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">العنوان *</Label>
            <Input
              id="title"
              name="title"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="أدخل عنوان العرض"
              className={getErrorMessage("title") ? "border-red-500" : ""}
            />
            {getErrorMessage("title") && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">الوصف *</Label>
            <textarea
              id="description"
              name="description"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="أدخل وصف العرض"
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                getErrorMessage("description")
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {getErrorMessage("description") && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Scope */}
          <div className="space-y-2">
            <Label htmlFor="scope">النطاق *</Label>
            <select
              id="scope"
              name="scope"
              value={values.scope}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                getErrorMessage("scope") ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="product">منتج</option>
              <option value="category">فئة</option>
              <option value="variant">متغير</option>
            </select>
            {getErrorMessage("scope") && (
              <p className="text-sm text-red-500">{errors.scope}</p>
            )}
          </div>

          {/* Product ID - Conditional */}
          {values.scope === "product" && (
            <div className="space-y-2">
              <Label htmlFor="productId">المنتج *</Label>
              <select
                id="productId"
                name="productId"
                value={values.productId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                  getErrorMessage("productId")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="">اختر منتجًا</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {getErrorMessage("productId") && (
                <p className="text-sm text-red-500">{errors.productId}</p>
              )}
            </div>
          )}

          {/* Category ID - Conditional */}
          {values.scope === "category" && (
            <div className="space-y-2">
              <Label htmlFor="categoryId">الفئة *</Label>
              <select
                id="categoryId"
                name="categoryId"
                value={values.categoryId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                  getErrorMessage("categoryId")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="">اختر فئة</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {getErrorMessage("categoryId") && (
                <p className="text-sm text-red-500">{errors.categoryId}</p>
              )}
            </div>
          )}

          {/* Variant ID - Conditional */}
          {values.scope === "variant" && (
            <div className="space-y-2">
              <Label htmlFor="variantId">المتغير *</Label>
              <select
                id="variantId"
                name="variantId"
                value={values.variantId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                  getErrorMessage("variantId")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="">اختر متغيرًا</option>
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name}
                  </option>
                ))}
              </select>
              {getErrorMessage("variantId") && (
                <p className="text-sm text-red-500">{errors.variantId}</p>
              )}
            </div>
          )}

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">نوع العرض *</Label>
            <select
              id="type"
              name="type"
              value={values.type}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                getErrorMessage("type") ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="percentage">نسبة مئوية</option>
              <option value="fixed">مبلغ ثابت</option>
              <option value="free_shipping">شحن مجاني</option>
            </select>
            {getErrorMessage("type") && (
              <p className="text-sm text-red-500">{errors.type}</p>
            )}
          </div>

          {/* Value */}
          <div className="space-y-2">
            <Label htmlFor="value">القيمة *</Label>
            <Input
              id="value"
              name="value"
              type="number"
              value={values.value}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="أدخل قيمة العرض"
              className={getErrorMessage("value") ? "border-red-500" : ""}
            />
            {getErrorMessage("value") && (
              <p className="text-sm text-red-500">{errors.value}</p>
            )}
          </div>

          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code">رمز القسيمة</Label>
            <Input
              id="code"
              name="code"
              value={values.code}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="أدخل رمز القسيمة (اختياري)"
              className={getErrorMessage("code") ? "border-red-500" : ""}
            />
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">تاريخ البدء *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={values.startDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getErrorMessage("startDate") ? "border-red-500" : ""}
              />
              {getErrorMessage("startDate") && (
                <p className="text-sm text-red-500">{errors.startDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expirationDate">تاريخ الانتهاء *</Label>
              <Input
                id="expirationDate"
                name="expirationDate"
                type="date"
                value={values.expirationDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  getErrorMessage("expirationDate") ? "border-red-500" : ""
                }
              />
              {getErrorMessage("expirationDate") && (
                <p className="text-sm text-red-500">{errors.expirationDate}</p>
              )}
            </div>
          </div>

          {/* Optional Fields Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxUsageCount">الحد الأقصى للاستخدام</Label>
              <Input
                id="maxUsageCount"
                name="maxUsageCount"
                type="number"
                value={values.maxUsageCount}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="غير محدود"
                className={
                  getErrorMessage("maxUsageCount") ? "border-red-500" : ""
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="perUserUsageCount">الحد الأقصى لكل مستخدم</Label>
              <Input
                id="perUserUsageCount"
                name="perUserUsageCount"
                type="number"
                value={values.perUserUsageCount}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="غير محدود"
                className={
                  getErrorMessage("perUserUsageCount") ? "border-red-500" : ""
                }
              />
            </div>
          </div>

          {/* More Optional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxDiscountAmount">أقصى مبلغ خصم</Label>
              <Input
                id="maxDiscountAmount"
                name="maxDiscountAmount"
                type="number"
                value={values.maxDiscountAmount}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="غير محدود"
                className={
                  getErrorMessage("maxDiscountAmount") ? "border-red-500" : ""
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minCartAmount">الحد الأدنى لقيمة السلة</Label>
              <Input
                id="minCartAmount"
                name="minCartAmount"
                type="number"
                value={values.minCartAmount}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0"
                className={
                  getErrorMessage("minCartAmount") ? "border-red-500" : ""
                }
              />
            </div>
          </div>

          {/* Checkboxes Row */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={values.isActive}
                onChange={(e) => setFieldValue("isActive", e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">نشط</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isAutoApply"
                checked={values.isAutoApply}
                onChange={(e) => setFieldValue("isAutoApply", e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">تطبيق تلقائي</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              {offer ? "تحديث العرض" : "إنشاء عرض جديد"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
