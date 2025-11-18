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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Zap, Edit, Trash2, Loader } from "lucide-react";
import toast from "react-hot-toast";
import VariantForm from "@/components/dashbaord/VariantForm";
import {
  loadVariants as fetchVariants,
  loadOptions as fetchOptions,
  generateVariants,
  createVariant,
  updateVariant,
  deleteVariant,
} from "@/lib/api/dashboard/variantsAPI";

export default function VariantsManager({ productId }) {
  const [variants, setVariants] = useState([]);
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantToDelete, setVariantToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    handleLoadVariants();
    handleLoadOptions();
  }, [productId]);

  const handleLoadVariants = async () => {
    try {
      setIsLoading(true);
      const data = await fetchVariants(productId);
      setVariants(data);
    } catch (error) {
      console.error("Error loading variants:", error);
      toast.error(error.message || "فشل في تحميل المتغيرات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadOptions = async () => {
    try {
      const data = await fetchOptions(productId);
      setOptions(data);
    } catch (error) {
      console.error("Error loading options:", error);
      toast.error(error.message || "فشل في تحميل الخيارات");
    }
  };

  const handleGenerateVariants = async () => {
    try {
      setIsGenerating(true);
      const generated = await generateVariants(productId);
      toast.success(`تم إنشاء ${generated.new} متغير جديد`);
      handleLoadVariants();
    } catch (error) {
      console.error("Error generating variants:", error);
      toast.error(error.message || "فشل في إنشاء المتغيرات");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateVariant = async (variantData) => {
    try {
      await createVariant(productId, variantData);
      toast.success("تم إنشاء المتغير بنجاح");
      setShowForm(false);
      handleLoadVariants();
    } catch (error) {
      console.error("Error creating variant:", error);
      toast.error(error.message || "فشل في إنشاء المتغير");
    }
  };

  const handleUpdateVariant = async (variantData) => {
    try {
      await updateVariant(productId, editingVariant.id, variantData);
      toast.success("تم تحديث المتغير بنجاح");
      setEditingVariant(null);
      handleLoadVariants();
    } catch (error) {
      console.error("Error updating variant:", error);
      toast.error(error.message || "فشل في تحديث المتغير");
    }
  };

  const handleDeleteVariant = async () => {
    try {
      setIsDeleting(true);
      await deleteVariant(productId, variantToDelete.id);
      toast.success("تم حذف المتغير بنجاح");
      setVariantToDelete(null);
      handleLoadVariants();
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error(error.message || "فشل في حذف المتغير");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderOptions = (variant) => {
    return variant.options
      ?.map((opt) => `${opt.option.name}: ${opt.value.value}`)
      .join(" | ");
  };

  if (!productId) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">معرّف المنتج غير موجود</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-2">
        <Button
          onClick={handleGenerateVariants}
          disabled={isGenerating || options.length === 0}
          variant="outline"
          className="gap-2"
        >
          {isGenerating ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          إنشاء من الخيارات
        </Button>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة متغير
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingVariant ? "تعديل المتغير" : "إضافة متغير جديد"}
              </DialogTitle>
            </DialogHeader>
            <VariantForm
              productId={productId}
              productOptions={options}
              initialVariant={editingVariant}
              onSubmit={
                editingVariant ? handleUpdateVariant : handleCreateVariant
              }
              onCancel={() => {
                setShowForm(false);
                setEditingVariant(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Variants Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>المتغيرات</CardTitle>
            <CardDescription>
              {variants.length} متغير تم العثور عليه
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">جاري تحميل المتغيرات...</p>
            </div>
          ) : variants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                لم يتم إنشاء أي متغيرات حتى الآن. ابدأ بإضافة واحدة أو أنشئها من
                الخيارات!
              </p>
              {options.length > 0 && (
                <Button
                  onClick={handleGenerateVariants}
                  disabled={isGenerating}
                  variant="outline"
                  className="gap-2"
                >
                  {isGenerating ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                  إنشاء من الخيارات
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الخيارات</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>المخزون</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell className="max-w-xs">
                        <div className="text-sm">
                          {renderOptions(variant) || "بدون خيارات"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {variant.sku ? (
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {variant.sku}
                          </code>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {Number(variant.price).toLocaleString()} جنيه
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{variant.stockQuantity}</span>
                          {variant.stockQuantity === 0 && (
                            <Badge variant="destructive">نفد المخزون</Badge>
                          )}
                          {variant.stockQuantity > 0 &&
                            variant.stockQuantity <= 5 && (
                              <Badge variant="outline">مخزون منخفض</Badge>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {variant.isActive ? (
                          <Badge variant="default">مفعل</Badge>
                        ) : (
                          <Badge variant="secondary">معطل</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              console.log("Editing variant:", variant);
                              setEditingVariant(variant);
                              setShowForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setVariantToDelete(variant)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!variantToDelete}
        onOpenChange={(open) => !open && setVariantToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogTitle>حذف المتغير</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من أنك تريد حذف هذا المتغير؟ لا يمكن التراجع عن هذا
            الإجراء.
          </AlertDialogDescription>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVariant}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
