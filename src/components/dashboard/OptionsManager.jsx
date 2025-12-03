"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import toast from "react-hot-toast";
import { imageService } from "@/lib/image-service";
import { DialogTrigger } from "@radix-ui/react-dialog";

// OptionValueDialog: Add/Edit value dialog as a separate component
function OptionValueDialog({
  open,
  mode,
  option,
  value,
  valueName,
  setValueName,
  valueHex,
  setValueHex,
  valueImageUrl,
  setValueImageUrl,
  isUpdating,
  onClose,
  onSubmit,
}) {
  const fileInputRef = React.useRef(null);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "تحرير القيمة" : "إضافة قيمة جديدة"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">اسم القيمة</label>
            <Input
              placeholder="مثال: صغير، أحمر"
              value={valueName}
              onChange={(e) => setValueName(e.target.value)}
              className="mt-1"
            />
          </div>
          {option?.presentation === "swatch" && (
            <div>
              <label className="text-sm font-medium">لون Hex (اختياري)</label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={valueHex || "#000000"}
                  onChange={(e) => setValueHex(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  placeholder="#000000"
                  value={valueHex}
                  onChange={(e) => setValueHex(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          )}
          {option?.presentation === "swatch" && (
            <div>
              <label className="text-sm font-medium">
                صورة القيمة (اختياري)
              </label>
              <div className="mt-2 space-y-2">
                {valueImageUrl && (
                  <div className="relative inline-block">
                    <img
                      src={valueImageUrl}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => setValueImageUrl("")}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setValueImageUrl(""); // Reset to show loading state
                        imageService
                          .uploadImage(file, "product-options")
                          .then((url) => {
                            setValueImageUrl(url);
                            toast.success("تم تحميل الصورة بنجاح");
                          })
                          .catch((error) => {
                            toast.error("فشل تحميل الصورة");
                            console.error("Image upload error:", error);
                          });
                      }
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUpdating}
                    className="w-full"
                  >
                    اختر صورة
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button onClick={onSubmit} disabled={isUpdating}>
              {isUpdating
                ? "جاري الحفظ..."
                : mode === "edit"
                ? "تحرير القيمة"
                : "إضافة القيمة"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function OptionsManager({ productId }) {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [optionToDelete, setOptionToDelete] = useState(null);
  const [isUpdatingValue, setIsUpdatingValue] = useState(false);
  const [valueToDelete, setValueToDelete] = useState(null);
  const [valueDialogOpen, setValueDialogOpen] = useState(false);
  const [valueDialogMode, setValueDialogMode] = useState("add");
  const [valueDialogOption, setValueDialogOption] = useState(null);
  const [valueDialogValue, setValueDialogValue] = useState(null);
  const [valueName, setValueName] = useState("");
  const [valueHex, setValueHex] = useState("");
  const [valueImageUrl, setValueImageUrl] = useState("");
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionPresentation, setNewOptionPresentation] = useState("select");

  useEffect(() => {
    loadOptions();
  }, [productId]);

  useEffect(() => {
    if (editingOption) {
      setNewOptionName(editingOption.name || "");
      setNewOptionPresentation(editingOption.presentation || "select");
    }
  }, [editingOption]);

  const loadOptions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/dashboard/products/${productId}/options`
      );
      const data = await response.json();
      if (response.ok) {
        setOptions(data.options || []);
      } else {
        toast.error(data.error || "فشل في تحميل الخيارات");
      }
    } catch (error) {
      console.error("Error loading options:", error);
      toast.error("فشل في تحميل الخيارات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!newOptionName.trim()) {
        toast.error("اسم الخيار مطلوب");
        return;
      }
      const optionData = {
        name: newOptionName,
        presentation: newOptionPresentation,
      };
      let response;
      if (editingOption) {
        // Update existing option
        response = await fetch(
          `/api/dashboard/products/${productId}/options/${editingOption.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(optionData),
          }
        );
      } else {
        // Create new option
        response = await fetch(`/api/dashboard/products/${productId}/options`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(optionData),
        });
      }
      const data = await response.json();
      if (response.ok) {
        toast.success(
          editingOption ? "تم تحرير الخيار بنجاح" : "تم إنشاء الخيار بنجاح"
        );
        setShowAddDialog(false);
        setEditingOption(null);
        resetForm();
        loadOptions();
      } else {
        toast.error(
          data.error ||
            (editingOption ? "فشل في تحرير الخيار" : "فشل في إنشاء الخيار")
        );
      }
    } catch (error) {
      console.error("Error submitting option:", error);
      toast.error(
        editingOption ? "فشل في تحرير الخيار" : "فشل في إنشاء الخيار"
      );
    }
  };

  const handleDeleteValue = async () => {
    try {
      const response = await fetch(
        `/api/dashboard/products/${productId}/options/${valueToDelete.optionId}/values/${valueToDelete.id}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        toast.success("تم حذف القيمة بنجاح");
        setValueToDelete(null);
        loadOptions();
      } else {
        const data = await response.json();
        toast.error(data.error || "فشل في حذف القيمة");
      }
    } catch (error) {
      console.error("Error deleting value:", error);
      toast.error("فشل في حذف القيمة");
    }
  };

  const handleDeleteOption = async () => {
    try {
      const response = await fetch(
        `/api/dashboard/products/${productId}/options/${optionToDelete.id}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        toast.success("تم حذف الخيار بنجاح");
        setOptionToDelete(null);
        loadOptions();
      } else {
        const data = await response.json();
        toast.error(data.error || "فشل في حذف الخيار");
      }
    } catch (error) {
      console.error("Error deleting option:", error);
      toast.error("فشل في حذف الخيار");
    }
  };

  // Remove handleAddValue, all value add/edit is now in handleValueDialogSubmit
  // Unified add/edit value handler
  const handleValueDialogSubmit = async () => {
    if (isUpdatingValue) return;
    if (!valueDialogOption) {
      toast.error("الخيار غير محدد");
      return;
    }
    if (!valueName.trim()) {
      toast.error("اسم القيمة مطلوب");
      return;
    }
    setIsUpdatingValue(true);
    try {
      let response;
      if (valueDialogMode === "edit" && valueDialogValue) {
        // Edit value
        response = await fetch(
          `/api/dashboard/products/${productId}/options/${valueDialogOption.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              valueId: valueDialogValue.id,
              value: valueName,
              hex: valueHex || null,
              imageUrl: valueImageUrl || null,
            }),
          }
        );
      } else {
        // Add value
        response = await fetch(
          `/api/dashboard/products/${productId}/options/${valueDialogOption.id}/values`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              value: valueName,
              hex: valueHex || null,
              imageUrl: valueImageUrl || null,
              position: valueDialogOption.values?.length || 0,
            }),
          }
        );
      }
      const data = await response.json();
      if (response.ok) {
        toast.success(
          valueDialogMode === "edit"
            ? "تم تحرير القيمة بنجاح"
            : "تم إضافة القيمة بنجاح"
        );
        setValueDialogOpen(false);
        resetValueDialog();
        await loadOptions();
      } else {
        toast.error(
          data.error ||
            (valueDialogMode === "edit"
              ? "فشل في تحرير القيمة"
              : "فشل في إضافة القيمة")
        );
      }
    } catch (error) {
      console.error("Error submitting value dialog:", error);
      toast.error(
        valueDialogMode === "edit"
          ? "فشل في تحرير القيمة"
          : "فشل في إضافة القيمة"
      );
    } finally {
      setIsUpdatingValue(false);
    }
  };

  // Reset value dialog state
  const resetValueDialog = () => {
    setValueName("");
    setValueHex("");
    setValueImageUrl("");
    setValueDialogOption(null);
    setValueDialogValue(null);
    setValueDialogMode("add");
    setIsUpdatingValue(false);
  };

  const resetForm = () => {
    setNewOptionName("");
    setNewOptionPresentation("select");
    setEditingOption(null);
  };

  const getPresentationLabel = (presentation) => {
    const labels = {
      swatch: "عينة لون",
      pill: "زر خيار",
      select: "قائمة منسدلة",
    };
    return labels[presentation] || presentation;
  };

  if (!productId) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">معرف المنتج غير موجود</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>خيارات المنتج</CardTitle>
          <CardDescription>
            إدارة الخيارات (الحجم، اللون، إلخ) وقيمها
          </CardDescription>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditingOption(null);
            resetForm();
            setShowAddDialog(true);
          }}
        >
          <Plus className="h-4 w-4" />
          إضافة خيار
        </Button>

        <Dialog
          open={showAddDialog || !!editingOption}
          onOpenChange={(open) => {
            if (!open) {
              setShowAddDialog(false);
              setEditingOption(null);
              resetForm();
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingOption ? "تحرير الخيار" : "إضافة خيار جديد"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">اسم الخيار</label>
                <Input
                  placeholder="مثال: الحجم، اللون"
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">نوع العرض</label>
                <Select
                  value={newOptionPresentation}
                  onValueChange={setNewOptionPresentation}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">قائمة منسدلة</SelectItem>
                    <SelectItem value="pill">زر خيار</SelectItem>
                    <SelectItem value="swatch">عينة لون</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Remove initial value fields from option dialog. Option values are managed via OptionValueDialog. */}

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    setEditingOption(null);
                    resetForm();
                  }}
                >
                  إلغاء
                </Button>
                <Button onClick={handleSubmit}>
                  {editingOption ? "تحرير الخيار" : "إنشاء الخيار"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">جاري تحميل الخيارات...</p>
          </div>
        ) : options.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              لم يتم إنشاء أي خيارات بعد
            </p>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  إنشاء الخيار الأول
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-4">
            {options.map((option, index) => (
              <Card key={option.id} className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <h3 className="font-semibold">{option.name}</h3>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {getPresentationLabel(option.presentation)}
                        </span>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {option.values?.length || 0} قيمة
                        {(option.values?.length || 0) !== 1 ? "" : ""}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {option.values?.map((value) => (
                          <div
                            key={value.id}
                            className="flex items-center gap-2 bg-background px-2 py-1 rounded text-sm border group"
                          >
                            {option.presentation === "swatch" && value.hex && (
                              <div
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: value.hex }}
                              />
                            )}
                            <span>{value.value}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setValueDialogMode("edit");
                                  setValueDialogOption(option);
                                  setValueDialogValue(value);
                                  setValueName(value.value);
                                  setValueHex(value.hex || "");
                                  setValueImageUrl(value.imageUrl || "");
                                  setValueDialogOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-700 p-1"
                                title="تحرير"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() =>
                                  setValueToDelete({
                                    ...value,
                                    optionId: option.id,
                                  })
                                }
                                className="text-red-600 hover:text-red-700 p-1"
                                title="حذف"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setValueDialogMode("add");
                          setValueDialogOption(option);
                          setValueDialogValue(null);
                          setValueName("");
                          setValueHex("");
                          setValueImageUrl("");
                          setValueDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        إضافة قيمة
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingOption(option)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOptionToDelete(option)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog
        open={!!optionToDelete || !!valueToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setOptionToDelete(null);
            setValueToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>
            {optionToDelete ? "حذف الخيار" : "حذف القيمة"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {optionToDelete
              ? `هل أنت متأكد من حذف خيار "${optionToDelete?.name}"؟ سيؤدي ذلك إلى إلغاء تنشيط جميع المتغيرات التي تستخدم هذا الخيار.`
              : `هل أنت متأكد من حذف القيمة "${valueToDelete?.value}"؟ سيؤدي ذلك إلى إلغاء تنشيط المتغيرات التي تستخدم هذه القيمة.`}
          </AlertDialogDescription>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={optionToDelete ? handleDeleteOption : handleDeleteValue}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <OptionValueDialog
        open={valueDialogOpen}
        mode={valueDialogMode}
        option={valueDialogOption}
        value={valueDialogValue}
        valueName={valueName}
        setValueName={setValueName}
        valueHex={valueHex}
        setValueHex={setValueHex}
        valueImageUrl={valueImageUrl}
        setValueImageUrl={setValueImageUrl}
        isUpdating={isUpdatingValue}
        onClose={() => {
          setValueDialogOpen(false);
          resetValueDialog();
        }}
        onSubmit={handleValueDialogSubmit}
      />
    </Card>
  );
}
