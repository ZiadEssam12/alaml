"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Folder, FolderOpen } from "lucide-react";
import toast from "react-hot-toast";
import DynamicIcons from "@/components/DynamicIcons";
import { Skeleton } from "@/components/ui/skeleton";
import SearchBox from "@/components/dashbaord/SearchBox";
import { useSearchParams } from "next/navigation";
import { PaginationClient } from "@/components/Pagination";

const fetchCategories = async ({ page = 1, pageSize = 10, q = "" }) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/categories?page=${page}&pageSize=${pageSize}&q=${q}`
  );
  let categoriesData = await res.json();
  if (!Array.isArray(categoriesData.data)) {
    return [];
  }
  return categoriesData;
};

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    color: "#cccccc",
    status: "active",
    seoTitle: "",
    seoDescription: "",
  });
  const [pagination, setPagination] = useState({});

  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);

  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const q = searchParams.get("q") || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { pagination, data } = await fetchCategories({
          page,
          pageSize,
          q,
        });

        if (data) {
          setCategories(data);
        }

        setPagination(pagination);
        console.log("Pagination Data:", pagination);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("خطأ في جلب الأقسام");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, pageSize, q]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const categoryData = {
        ...formData,
      };

      let res;
      if (editingCategory) {
        res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/categories/${editingCategory.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(categoryData),
          }
        );
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
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
      status: category.status,
      seoTitle: category.seoTitle,
      seoDescription: category.seoDescription,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (categoryId) => {
    if (confirm("هل أنت متأكد من حذف هذا القسم؟")) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/categories/${categoryId}`,
          {
            method: "DELETE",
          }
        );
        if (res.ok) {
          toast.success("تم حذف القسم بنجاح");
          fetchCategories();
        } else {
          throw new Error("خطأ في حذف القسم");
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
      status: "active",
      seoTitle: "",
      seoDescription: "",
    });
    setEditingCategory(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Header Skeletons */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2 rounded-md" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>

        {/* Category Card Skeletons (Mimics the layout of an actual category card) */}
        {Array.from({ length: 3 }).map((_, index) => (
          <Card
            key={index}
            className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />{" "}
                  {/* Icon skeleton */}
                  <div>
                    <Skeleton className="h-6 w-32 mb-1 rounded-md" />{" "}
                    {/* Title skeleton */}
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-5 w-20 rounded-full" />{" "}
                      {/* Badge skeleton */}
                      <Skeleton className="h-4 w-24 rounded-md" />{" "}
                      {/* Order text skeleton */}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />{" "}
                  {/* Edit button skeleton */}
                  <Skeleton className="h-8 w-8 rounded-lg" />{" "}
                  {/* Delete button skeleton */}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
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

              <div className="flex justify-start items-center gap-3">
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
                <Button type="submit" disabled={loading}>
                  {loading
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

      <SearchBox placeholder={"ابحث باسم التنصيف"} />
      {/* Categories Tree View */}
      <div className="gap-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 items-stretch">
        {categories.map((parentCategory) => (
          <Card
            key={parentCategory.id}
            className="flex flex-col justify-between p-4 shadow-md border border-gray-200"
          >
            <div className="flex items-center space-x-4 mb-4">
              {/* Render category icon dynamically if possible, fallback to FolderOpen */}
              <span
                className="flex items-center justify-center w-12 h-12 rounded-full"
                style={{ color: parentCategory.color }}
              >
                {parentCategory.icon ? (
                  <DynamicIcons icon={parentCategory.icon} size={24} />
                ) : (
                  <FolderOpen className="h-6 w-6 text-white" />
                )}
              </span>
              <div>
                <CardTitle className="text-lg font-semibold">
                  {parentCategory.name}
                </CardTitle>
                <Badge
                  variant={
                    parentCategory.status === "active" ? "default" : "secondary"
                  }
                  className="mt-1"
                >
                  {parentCategory.status === "active" ? "نشط" : "غير نشط"}
                </Badge>
              </div>
            </div>
            <div className="flex justify-between mt-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(parentCategory)}
                className="flex items-center space-x-1"
              >
                <Edit className="h-4 w-4" />
                <span>تعديل</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(parentCategory.id)}
                className="flex items-center space-x-1"
              >
                <Trash2 className="h-4 w-4" />
                <span>حذف</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <PaginationClient
        basePath={"/dashboard/categories"}
        currentPage={pagination.page || 1}
        maxPage={pagination.totalPages || 1}
      />
    </div>
  );
}
