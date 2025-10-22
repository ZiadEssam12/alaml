"use client";

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
import { ImageUpload } from "@/components/dashbaord/imageUpload";

function AddingProductForm({
  dialogOpen,
  setDialogOpen,
  formData,
  setFormData,
  editingProduct,
  handleSubmit,
  categories,
}) {
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
          </DialogTitle>
        </DialogHeader>

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
              setFormData({
                ...formData,
                imageUrls: [...formData.imageUrls, imageUrl],
              });
            }}
            folder="products"
          />

          <div className="flex justify-end space-x-2 ">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button type="submit">
              {editingProduct ? "تحديث المنتج" : "إضافة المنتج"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddingProductForm;
