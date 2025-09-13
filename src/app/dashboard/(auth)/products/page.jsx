"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
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
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Search,
  Link2,
  Check,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { ProductCardSkeleton } from "@/components/dashbaord/product/skelaton";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/dashbaord/imageUpload";
import { imageService } from "@/lib/image-service";
import { useSearchParams } from "next/navigation";
import SearchBox from "@/components/dashbaord/SearchBox";
import { PaginationClient } from "@/components/Pagination";

// Fetch products and categories from Next.js API
const fetchData = async ({ q, page, pageSize }) => {
  const productsRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/products?page=${page}&pageSize=${pageSize}&q=${q}`
  );
  const data = await productsRes.json();

  const { products, categories } = data.data;
  const { pagination } = data;

  return { products, categories, pagination };
};

function ProductsManagementContent() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stockQuantity: 0,
    categoryID: "",
    imageUrls: [],
  });
  const [pagination, setPagination] = useState({});

  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);

  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const q = searchParams.get("q") || "";

  useEffect(() => {
    const fetchDataWrapper = async () => {
      try {
        setLoading(true);
        const { products, categories, pagination } = await fetchData({
          q,
          page,
          pageSize,
        });

        if (products) {
          setProducts(products);
        }

        if (categories) {
          setCategories(categories);
        }

        if (pagination) {
          setPagination(pagination);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("خطأ في جلب البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchDataWrapper();
  }, [q, page, pageSize]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.imageUrls.length === 0) {
      toast.error("يجب إضافة صورة واحدة على الأقل");
      return;
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stockQuantity: formData.stockQuantity,
        categoryID: formData.categoryID,
        imageUrls: formData.imageUrls,
        updatedAt: new Date(),
      };

      let res;
      if (editingProduct) {
        res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/products/${editingProduct.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
          }
        );
        if (res.ok) toast.success("تم تحديث المنتج بنجاح");
        else throw new Error("Update failed");
      } else {
        res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/products`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...productData, createdAt: new Date() }),
          }
        );
        if (res.ok) toast.success("تم إضافة المنتج بنجاح");
        else throw new Error("Add failed");
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("خطأ في حفظ المنتج");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryID: product.categoryID,
      imageUrls: product.imageUrls,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (productId) => {
    if (confirm("هل أنت متأكد من إلغاء تنشيط هذا المنتج؟")) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/products/${productId}`,
          {
            method: "DELETE",
          }
        );
        if (res.ok) {
          toast.success("تم الغاء تنشيط المنتج");
          fetchData();
        } else {
          throw new Error("Delete failed");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("خطأ في الغاء تنشيط المنتج");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      stockQuantity: 0,
      categoryID: "",
      imageUrls: [],
    });
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6 container my-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
          <p className="text-muted-foreground">
            إضافة وتعديل وإدارة منتجات المتجر
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة منتج جديد
            </Button>
          </DialogTrigger>
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
      </div>

      <SearchBox placeholder="البحث في المنتجات..." />

      {loading ? (
        <>
          <ProductsSkeletonLoader />
        </>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2">الصورة</th>
                  <th className="px-4 py-2">اسم المنتج</th>
                  <th className="px-4 py-2">الوصف</th>
                  <th className="px-4 py-2">السعر</th>
                  <th className="px-4 py-2">المخزون</th>
                  <th className="px-4 py-2">القسم</th>
                  <th className="px-4 py-2">الحالة</th>
                  <th className="px-4 py-2">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr className="border-b">
                    <td
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        لا توجد منتجات تطابق البحث
                      </p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-muted/50 transition border-b h-16 align-middle"
                    >
                      <td className="px-4 py-2 text-center">
                        {product.imageUrls.length > 0 ? (
                          <img
                            src={imageService.generateOptimizedUrl(
                              imageService.extractPublicId(
                                product.imageUrls[0]
                              ),
                              { width: 80, height: 60 }
                            )}
                            alt={product.name}
                            className="w-20 h-16 object-cover rounded mx-auto"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            بدون صورة
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 font-semibold">
                        {product.name}
                      </td>
                      <td className="px-4 py-2 truncate max-w-[200px]">
                        {product.description}
                      </td>
                      <td className="px-4 py-2">{product.price} جنيه</td>
                      <td className="px-4 py-2">{product.stockQuantity}</td>
                      <td className="px-4 py-2">{product.category.name}</td>
                      <td className="px-4 py-2 h-full">
                        {product.isActive ? (
                          <span className="inline-block rounded-full p-2 text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <Check className="h-4 w-4 text-green-800" />
                          </span>
                        ) : (
                          <span className="inline-block rounded-full p-2 text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            <X className="h-4 w-4 text-red-800" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            title="تعديل"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                          >
                            <Button size="sm" title="عرض المنتج">
                              <Link2 className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <PaginationClient
        basePath="/dashboard/products"
        currentPage={pagination.currentPage}
        maxPage={pagination.totalPages}
      />
    </div>
  );
}

function ProductsSkeletonLoader() {
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2">الصورة</th>
            <th className="px-4 py-2">اسم المنتج</th>
            <th className="px-4 py-2">الوصف</th>
            <th className="px-4 py-2">السعر</th>
            <th className="px-4 py-2">المخزون</th>
            <th className="px-4 py-2">القسم</th>
            <th className="px-4 py-2">الحالة</th>
            <th className="px-4 py-2">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, idx) => (
            <tr key={idx} className="border-b animate-pulse h-16 align-middle">
              <td className="px-4 py-2 text-center">
                <Skeleton className="h-16 w-20 mx-auto rounded" />
              </td>
              <td className="px-4 py-2">
                <Skeleton className="h-4 w-24 rounded" />
              </td>
              <td className="px-4 py-2">
                <Skeleton className="h-4 w-32 rounded" />
              </td>
              <td className="px-4 py-2">
                <Skeleton className="h-4 w-16 rounded" />
              </td>
              <td className="px-4 py-2">
                <Skeleton className="h-4 w-12 rounded" />
              </td>
              <td className="px-4 py-2">
                <Skeleton className="h-4 w-20 rounded" />
              </td>
              <td className="px-4 py-2">
                <Skeleton className="h-8 w-8 rounded-full" />
              </td>
              <td className="px-4 py-2 text-center">
                <div className="flex justify-center items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ProductsManagement() {
  return (
    <Suspense fallback={<ProductCardSkeleton />}>
      <ProductsManagementContent />
    </Suspense>
  );
}
