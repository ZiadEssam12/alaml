"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageUpload } from "@/components/dashbaord/imageUpload";
import ProductDetailsForm from "@/components/dashboard/ProductDetailsForm";
import OptionsManager from "@/components/dashboard/OptionsManager";
import VariantsManager from "@/components/dashboard/VariantsManager";
import toast from "react-hot-toast";

function AddingProductForm({
  dialogOpen,
  setDialogOpen,
  formData,
  setFormData,
  editingProduct,
  handleSubmit,
  categories,
}) {
  const [activeTab, setActiveTab] = useState("details");
  const [product, setProduct] = useState(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  const handleClose = () => {
    setDialogOpen(false);
    setActiveTab("details");
  };

  // Load product details when editing
  useEffect(() => {
    if (editingProduct && dialogOpen) {
      loadProduct();
    }
  }, [editingProduct, dialogOpen]);

  const loadProduct = async () => {
    if (!editingProduct?.id) return;
    try {
      setIsLoadingProduct(true);
      const response = await fetch(
        `/api/dashboard/products/${editingProduct.id}`
      );
      const data = await response.json();
      if (response.ok) {
        setProduct(data.data);
      }
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Failed to load product details");
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleProductUpdate = () => {
    loadProduct();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent
        className={`${
          editingProduct && "min-w-4xl"
        } max-h-[95vh] overflow-y-auto`}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
          </DialogTitle>
        </DialogHeader>

        {/* Create/Edit Tabs */}
        {editingProduct ? (
          // Edit mode - Full tabbed interface
          isLoadingProduct ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">جاري تحميل المنتج...</p>
            </div>
          ) : product ? (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">التفاصيل</TabsTrigger>
                <TabsTrigger value="images">الصور</TabsTrigger>
                <TabsTrigger value="options">الخيارات</TabsTrigger>
                <TabsTrigger value="variants">المتغيرات</TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>تفاصيل المنتج</CardTitle>
                    <CardDescription>
                      تعديل معلومات المنتج الأساسية
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProductDetailsForm
                      product={product}
                      onSuccess={handleProductUpdate}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>صور المنتج</CardTitle>
                    <CardDescription>إدارة صور المنتج</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      إدارة الصور متاحة في نموذج تفاصيل المنتج
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Options Tab */}
              <TabsContent value="options" className="space-y-4">
                <OptionsManager productId={editingProduct.id} />
              </TabsContent>

              {/* Variants Tab */}
              <TabsContent value="variants" className="space-y-4">
                <VariantsManager productId={editingProduct.id} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8">
              <p className="text-red-600">فشل تحميل المنتج</p>
            </div>
          )
        ) : (
          // Create mode - Simple form
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المنتج</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryID">القسم</Label>
                <Select
                  value={formData.categoryID}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryID: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">السعر (جنيه)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">الكمية المتوفرة</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stockQuantity: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxQuantityPerUser">
                الحد الأقصى للشراء لكل مستخدم
              </Label>
              <Input
                id="maxQuantityPerUser"
                type="number"
                min="1"
                value={formData.maxQuantityPerUser}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxQuantityPerUser: Number.parseInt(e.target.value) || 1,
                  })
                }
                required
              />
            </div>

            <ImageUpload
              currentImages={formData.imageUrls}
              onImageUploaded={(imageUrl) => {
                setFormData((prev) => ({
                  ...prev,
                  imageUrls: [...prev.imageUrls, imageUrl],
                }));
              }}
              onImageRemoved={(index) => {
                setFormData((prev) => ({
                  ...prev,
                  imageUrls: prev.imageUrls.filter((_, i) => i !== index),
                }));
              }}
              folder="products"
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                إلغاء
              </Button>
              <Button type="submit">
                {editingProduct ? "تحديث المنتج" : "إضافة المنتج"}
              </Button>
            </div>
          </form>
        )}

        {/* Modal Footer - Close Button (only shown for edit mode) */}
        {editingProduct && (
          <div className="flex justify-end space-x-2 border-t pt-4">
            <Button variant="outline" onClick={handleClose}>
              إغلاق
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AddingProductForm;
