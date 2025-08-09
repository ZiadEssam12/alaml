"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Folder, FolderOpen } from "lucide-react";
import toast from "react-hot-toast";
import DynamicIcons from "@/components/DynamicIcons";

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    color: "#cccccc",
    parentCategoryID: "",
    status: "active",
    seoTitle: "",
    seoDescription: "",
    order: 0,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      let categoriesData = await res.json();
      if (!Array.isArray(categoriesData)) {
        categoriesData = [];
      }
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("خطأ في جلب الأقسام");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const categoryData = {
        ...formData,
        parentCategoryID: formData.parentCategoryID || null,
        updatedAt: new Date(),
      };

      let res;
      if (editingCategory) {
        res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryData),
        });
        if (res.ok) toast.success("تم تحديث القسم بنجاح");
        else throw new Error("Update failed");
      } else {
        res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...categoryData, createdAt: new Date() }),
        });
        if (res.ok) toast.success("تم إضافة القسم بنجاح");
        else throw new Error("Add failed");
      }

      setDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("خطأ في حفظ القسم");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
      parentCategoryID: category.parentCategoryID || "",
      status: category.status,
      seoTitle: category.seoTitle,
      seoDescription: category.seoDescription,
      order: category.order,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (categoryId) => {
    if (confirm("هل أنت متأكد من حذف هذا القسم؟")) {
      try {
        const res = await fetch(`/api/categories/${categoryId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          toast.success("تم حذف القسم بنجاح");
          fetchCategories();
        } else {
          throw new Error("Delete failed");
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("خطأ في حذف القسم");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      icon: "",
      color: "#cccccc",
      parentCategoryID: "",
      status: "active",
      seoTitle: "",
      seoDescription: "",
      order: 0,
    });
    setEditingCategory(null);
  };

  const getParentCategories = () => {
    return categories.filter((cat) => !cat.parentCategoryID);
  };

  const getSubCategories = (parentId) => {
    return categories.filter((cat) => cat.parentCategoryID === parentId);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "";
  };

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الأقسام</h1>
          <p className="text-muted-foreground">إدارة أقسام وتصنيفات المنتجات</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة قسم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "تعديل القسم" : "إضافة قسم جديد"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم القسم</Label>
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
                  <Label htmlFor="order">ترتيب العرض</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentCategory">القسم الأب (اختياري)</Label>
                <Select
                  value={formData.parentCategoryID}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parentCategoryID: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القسم الأب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون قسم أب</SelectItem>
                    {getParentCategories().map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">أيقونة القسم (اسم أيقونة Lucide)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  placeholder="مثال: FolderOpen"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">لون الأيقونة</Label>
                <Input
                  id="color"
                  type="text"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-start items-center gap-3 my-2">
                <p>عرض الأيقونة</p>

                <div>
                  <DynamicIcons
                    icon={formData.icon}
                    color={formData.color}
                    size={24}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoTitle">عنوان SEO</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, seoTitle: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">وصف SEO</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, seoDescription: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2 ">
                <Switch
                  id="status"
                  checked={formData.status === "active"}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      status: checked ? "active" : "inactive",
                    })
                  }
                />
                <Label htmlFor="status">تفعيل القسم</Label>
              </div>

              <div className="flex justify-end space-x-2 ">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading
                    ? "جاري الحفظ..."
                    : editingCategory
                    ? "تحديث"
                    : "إضافة"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!categories ||
        (categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              لا توجد أقسام في قاعدة البيانات
            </h2>
            <p className="text-muted-foreground mb-4">
              ابدأ بإضافة قسم جديد لتنظيم منتجاتك.
            </p>
            <Button
              onClick={() => {
                resetForm();
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة قسم جديد
            </Button>
          </div>
        ))}

      {/* Categories Tree View */}
      <div className="space-y-4">
        {getParentCategories().map((parentCategory) => (
          <Card key={parentCategory.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 ">
                  {/* Render category icon dynamically if possible, fallback to FolderOpen */}
                  <span style={{ color: parentCategory.color }}>
                    {parentCategory.icon ? (
                      parentCategory.icon
                    ) : (
                      <FolderOpen className="h-5 w-5" />
                    )}
                  </span>
                  <div>
                    <CardTitle className="text-lg">
                      {parentCategory.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2  mt-1">
                      <Badge
                        variant={
                          parentCategory.status === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {parentCategory.status === "active" ? "نشط" : "غير نشط"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ترتيب: {parentCategory.order}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 ">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(parentCategory)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(parentCategory.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Sub Categories */}
            {getSubCategories(parentCategory.id).length > 0 && (
              <CardContent>
                <div className="space-y-2 mr-6">
                  {getSubCategories(parentCategory.id).map((subCategory) => (
                    <div
                      key={subCategory.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3 ">
                        <span style={{ color: subCategory.color }}>
                          {subCategory.icon ? (
                            subCategory.icon
                          ) : (
                            <Folder className="h-4 w-4" />
                          )}
                        </span>
                        <div>
                          <span className="font-medium">
                            {subCategory.name}
                          </span>
                          <div className="flex items-center space-x-2  mt-1">
                            <Badge
                              variant={
                                subCategory.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {subCategory.status === "active"
                                ? "نشط"
                                : "غير نشط"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              ترتيب: {subCategory.order}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(subCategory)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(subCategory.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
