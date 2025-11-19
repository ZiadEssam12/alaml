"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { imageService } from "@/lib/image-service";

/**
 * VariantForm Component
 * Create or edit product variants with options and prices
 */
export default function VariantForm({
  productId,
  productOptions = [],
  onSubmit,
  onCancel,
  initialVariant = null,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    sku: "",
    price: "",
    stockQuantity: "",
    isActive: true,
    imageUrls: [],
    options: {},
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialVariant) {
      const optionsMap =
        initialVariant.options?.reduce((acc, opt) => {
          acc[opt.optionId] = opt.valueId;
          return acc;
        }, {}) || {};

      console.log("Setting form data with options:", optionsMap);

      setFormData({
        sku: initialVariant.sku || "",
        price: initialVariant.price || "",
        stockQuantity: initialVariant.stockQuantity || "",
        isActive: initialVariant.isActive !== false,
        imageUrls: initialVariant.imageUrls || [],
        options: optionsMap,
      });
    } else {
      // Reset form for creating new variant
      setFormData({
        sku: "",
        price: "",
        stockQuantity: "",
        isActive: true,
        imageUrls: [],
        options: {},
      });
    }
    setImageFiles([]);
    setErrors({});
  }, [initialVariant]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "يجب أن يكون السعر أكبر من 0";
    }

    if (typeof formData.stockQuantity !== "number" && !formData.stockQuantity) {
      newErrors.stockQuantity = "كمية المخزون مطلوبة";
    }

    if (parseInt(formData.stockQuantity) < 0) {
      newErrors.stockQuantity = "لا يمكن أن تكون كمية المخزون سالبة";
    }

    // Check all options are selected
    const missingOptions = productOptions.filter(
      (opt) => !formData.options[opt.id]
    );

    if (missingOptions.length > 0) {
      newErrors.options = `يرجى اختيار: ${missingOptions
        .map((o) => o.name)
        .join(", ")}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOptionChange = (optionId, valueId) => {
    setFormData((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        [optionId]: valueId,
      },
    }));
    // Clear option error when user selects
    if (errors.options) {
      setErrors((prev) => ({ ...prev, options: "" }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    if (index < formData.imageUrls.length) {
      // Removing existing image URL
      setFormData((prev) => ({
        ...prev,
        imageUrls: prev.imageUrls.filter((_, i) => i !== index),
      }));
    } else {
      // Removing new image file
      const fileIndex = index - formData.imageUrls.length;
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("يرجى إصلاح الأخطاء في النموذج");
      return;
    }

    try {
      // Upload new images if any
      let uploadedUrls = [...formData.imageUrls];
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map((file) => {
          return imageService.uploadImage(file, "variants");
        });

        try {
          const uploadedImages = await Promise.all(uploadPromises);
          uploadedUrls = uploadedUrls.concat(uploadedImages);
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          toast.error("فشل في رفع بعض الصور");
          return;
        }
      }

      const variantData = {
        sku: formData.sku || undefined,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        isActive: formData.isActive,
        imageUrls: uploadedUrls,
        options: Object.entries(formData.options).map(
          ([optionId, valueId]) => ({
            optionId,
            valueId,
          })
        ),
      };

      await onSubmit(variantData);
    } catch (error) {
      toast.error("فشل في إرسال المتغير");
      console.error("Variant submit error:", error);
    }
  };

  const allImagesCount = formData.imageUrls.length + imageFiles.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {initialVariant ? "تحرير المتغير" : "إنشاء متغير جديد"}
        </CardTitle>
        <CardDescription>
          تكوين خيارات المتغير والتسعير والمخزون
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Options Selection */}
          {productOptions.length > 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">اختر الخيارات</h3>
                <div className="space-y-3">
                  {productOptions.map((option) => (
                    <div key={option.id} className="space-y-2">
                      <Label
                        htmlFor={`option-${option.id}`}
                        className="text-sm"
                      >
                        {option.name}
                      </Label>
                      {console.log(
                        "Rendering option:",
                        option,
                        "with selected value:",
                        formData.options[option.id]
                      )}
                      <Select
                        value={String(
                          initialVariant?.options?.find(
                            (opt) => opt.optionId === option.id
                          )?.valueId || ""
                        )}
                        onValueChange={(value) =>
                          handleOptionChange(option.id, value)
                        }
                      >
                        <SelectTrigger id={`option-${option.id}`}>
                          <SelectValue placeholder={`اختر ${option.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {option.values?.map((value) => (
                            <SelectItem key={value.id} value={String(value.id)}>
                              {value.value}
                              {value.hex && (
                                <span
                                  className="inline-block w-3 h-3 rounded ml-2 border"
                                  style={{ backgroundColor: value.hex }}
                                />
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                {errors.options && (
                  <p className="text-sm text-red-600 mt-2">{errors.options}</p>
                )}
              </div>
            </div>
          )}

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">السعر (جنيه مصري)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="250.00"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">كمية المخزون</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                placeholder="10"
                value={formData.stockQuantity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    stockQuantity: e.target.value,
                  }))
                }
                className={errors.stockQuantity ? "border-red-500" : ""}
              />
              {errors.stockQuantity && (
                <p className="text-sm text-red-600">{errors.stockQuantity}</p>
              )}
            </div>
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <Label htmlFor="sku">رمز المنتج (اختياري)</Label>
            <Input
              id="sku"
              type="text"
              placeholder="مثال: TS-RED-S"
              value={formData.sku}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sku: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              اتركه فارغاً لإنشاء رمز تلقائي
            </p>
          </div>

          {/* Images */}
          <div className="space-y-3">
            <Label>صور المتغير</Label>

            {/* Existing Images */}
            {formData.imageUrls.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">الصور الموجودة</p>
                <div className="grid grid-cols-4 gap-3">
                  {formData.imageUrls.map((url, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <img
                        src={url}
                        alt={`متغير ${index}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Files */}
            {imageFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">الصور الجديدة</p>
                <div className="grid grid-cols-4 gap-3">
                  {imageFiles.map((file, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`جديد ${index}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          removeImage(formData.imageUrls.length + index)
                        }
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="border-2 border-dashed rounded-lg p-4">
              <label className="cursor-pointer flex items-center justify-center gap-2">
                <Upload className="h-4 w-4" />
                <span className="text-sm">انقر لرفع المزيد من الصور</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              {allImagesCount} صورة محددة
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              نشط (متاح للشراء)
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading
                ? "جاري الحفظ..."
                : initialVariant
                ? "تحديث المتغير"
                : "إنشاء متغير"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
