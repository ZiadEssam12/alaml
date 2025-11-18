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
  DialogTrigger,
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

export default function OptionsManager({ productId }) {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [optionToDelete, setOptionToDelete] = useState(null);
  const [isUpdatingValue, setIsUpdatingValue] = useState(false);
  const [valueToDelete, setValueToDelete] = useState(null);
  const [editingValue, setEditingValue] = useState(null);
  const [optionForNewValue, setOptionForNewValue] = useState(null);
  const [showAddValueDialog, setShowAddValueDialog] = useState(false);
  const [newValueName, setNewValueName] = useState("");
  const [newValueHex, setNewValueHex] = useState("");
  const [newValueImageUrl, setNewValueImageUrl] = useState("");
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionPresentation, setNewOptionPresentation] = useState("select");

  useEffect(() => {
    loadOptions();
  }, [productId]);

  useEffect(() => {
    if (editingOption) {
      setNewOptionName(editingOption.name || "");
      setNewOptionPresentation(editingOption.presentation || "select");
      // Note: For editing options, we don't pre-fill values as option editing
      // typically only changes name and presentation, not values
      setNewValueName("");
      setNewValueHex("");
      setNewValueImageUrl("");
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
        if (!newValueName.trim()) {
          toast.error("قيمة واحدة على الأقل مطلوبة");
          return;
        }

        response = await fetch(`/api/dashboard/products/${productId}/options`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...optionData,
            value: newValueName,
            hex: newValueHex || null,
            imageUrl: newValueImageUrl || null,
            position: 0,
          }),
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

  const handleUpdateValue = async () => {
    if (isUpdatingValue) return; // Prevent multiple submissions

    try {
      setIsUpdatingValue(true);

      if (!newValueName.trim()) {
        toast.error("اسم القيمة مطلوب");
        return;
      }

      const response = await fetch(
        `/api/dashboard/products/${productId}/options/${editingValue.optionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            valueId: editingValue.id,
            value: newValueName,
            hex: newValueHex || null,
            imageUrl: newValueImageUrl || null,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("تم تحرير القيمة بنجاح");
        setEditingValue(null);
        resetValueForm();
        await loadOptions(); // Await to ensure it completes
      } else {
        toast.error(data.error || "فشل في تحرير القيمة");
      }
    } catch (error) {
      console.error("Error updating value:", error);
      toast.error("فشل في تحرير القيمة");
    } finally {
      setIsUpdatingValue(false);
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

  const handleAddValue = async () => {
    if (!optionForNewValue) {
      toast.error("الخيار غير محدد");
      return;
    }

    try {
      if (!newValueName.trim()) {
        toast.error("اسم القيمة مطلوب");
        return;
      }

      const payload = {
        valueId: undefined,
        value: newValueName,
        hex: newValueHex || null,
        imageUrl: newValueImageUrl || null,
        position: optionForNewValue.values?.length || 0,
      };

      const response = await fetch(
        `/api/dashboard/products/${productId}/options/${optionForNewValue.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("تم إضافة القيمة بنجاح");
        setShowAddValueDialog(false);
        resetValueForm();
        loadOptions();
      } else {
        toast.error(data.error || "فشل في إضافة القيمة");
      }
    } catch (error) {
      console.error("Error adding value:", error);
      toast.error("فشل في إضافة القيمة");
    }
  };

  const resetValueForm = () => {
    setNewValueName("");
    setNewValueHex("");
    setNewValueImageUrl("");
    setOptionForNewValue(null);
    setEditingValue(null);
    setIsUpdatingValue(false);
  };

  const resetForm = () => {
    setNewOptionName("");
    setNewOptionPresentation("select");
    setNewValueName("");
    setNewValueHex("");
    setNewValueImageUrl("");
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

              {!editingOption && (
                <>
                  <div>
                    <label className="text-sm font-medium">القيمة الأولى</label>
                    <Input
                      placeholder="مثال: صغير، أحمر"
                      value={newValueName}
                      onChange={(e) => setNewValueName(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {newOptionPresentation === "swatch" && (
                    <div>
                      <label className="text-sm font-medium">
                        لون Hex (اختياري)
                      </label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="color"
                          value={newValueHex || "#000000"}
                          onChange={(e) => setNewValueHex(e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          placeholder="#000000"
                          value={newValueHex}
                          onChange={(e) => setNewValueHex(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}

                  {newOptionPresentation === "swatch" && (
                    <div>
                      <label className="text-sm font-medium">
                        رابط الصورة (اختياري)
                      </label>
                      <Input
                        placeholder="https://..."
                        value={newValueImageUrl}
                        onChange={(e) => setNewValueImageUrl(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}
                </>
              )}

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

        {/* Add Value Dialog */}
        <Dialog
          open={showAddValueDialog}
          onOpenChange={(open) => {
            if (!open) {
              setShowAddValueDialog(false);
              resetValueForm();
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة قيمة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">اسم القيمة</label>
                <Input
                  placeholder="مثال: صغير، أحمر"
                  value={newValueName}
                  onChange={(e) => setNewValueName(e.target.value)}
                  className="mt-1"
                />
              </div>

              {optionForNewValue?.presentation === "swatch" && (
                <div>
                  <label className="text-sm font-medium">
                    لون Hex (اختياري)
                  </label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={newValueHex || "#000000"}
                      onChange={(e) => setNewValueHex(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      placeholder="#000000"
                      value={newValueHex}
                      onChange={(e) => setNewValueHex(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}

              {optionForNewValue?.presentation === "swatch" && (
                <div>
                  <label className="text-sm font-medium">
                    رابط الصورة (اختياري)
                  </label>
                  <Input
                    placeholder="https://..."
                    value={newValueImageUrl}
                    onChange={(e) => setNewValueImageUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddValueDialog(false);
                    resetValueForm();
                  }}
                >
                  إلغاء
                </Button>
                <Button onClick={handleAddValue}>إضافة القيمة</Button>
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
                                  setEditingValue({
                                    ...value,
                                    optionId: option.id,
                                    option,
                                  });
                                  setNewValueName(value.value);
                                  setNewValueHex(value.hex || "");
                                  setNewValueImageUrl(value.imageUrl || "");
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
                          setOptionForNewValue(option);
                          setShowAddValueDialog(true);
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

      {/* Edit Value Dialog */}
      <Dialog
        open={!!editingValue}
        onOpenChange={(open) => {
          if (!open) {
            setEditingValue(null);
            resetValueForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تحرير القيمة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">اسم القيمة</label>
              <Input
                value={newValueName}
                onChange={(e) => setNewValueName(e.target.value)}
                className="mt-1"
              />
            </div>

            {editingValue?.option?.presentation === "swatch" && (
              <div>
                <label className="text-sm font-medium">لون Hex (اختياري)</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={newValueHex || "#000000"}
                    onChange={(e) => setNewValueHex(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    placeholder="#000000"
                    value={newValueHex}
                    onChange={(e) => setNewValueHex(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            {editingValue?.option?.presentation === "swatch" && (
              <div>
                <label className="text-sm font-medium">
                  رابط الصورة (اختياري)
                </label>
                <Input
                  placeholder="https://..."
                  value={newValueImageUrl}
                  onChange={(e) => setNewValueImageUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingValue(null);
                  resetValueForm();
                }}
              >
                إلغاء
              </Button>
              <Button onClick={handleUpdateValue} disabled={isUpdatingValue}>
                {isUpdatingValue ? "جاري التحرير..." : "تحرير القيمة"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
