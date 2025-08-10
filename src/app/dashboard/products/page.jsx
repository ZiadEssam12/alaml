"use client";

import { useState, useEffect } from "react";
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
import { Plus, Edit, Trash2, Package, Search, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { ProductCardSkeleton } from "@/components/dashbaord/product/skelaton";
import { ImageUpload } from "@/components/dashbaord/imageUpload";
import { imageService } from "@/lib/image-service";

export default function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stockQuantity: 0,
    categoryID: "",
    imageUrls: [],
  });

  useEffect(() => {
    // Fetch products and categories from Next.js API
    const fetchData = async () => {
      try {
        // Fetch products
        const productsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/product`
        );
        const { data: productsData } = await productsRes.json();

        // Fetch categories
        const categoriesRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/categories`
        );
        const { data: categoriesData } = await categoriesRes.json();
        const productsWithCategories = productsData.map((product) => ({
          ...product,
          categoryName:
            categoriesData.find((cat) => cat.id === product.categoryID)?.name ||
            "غير محدد",
        }));

        console.log("prod data:", productsWithCategories);
        console.log("cate data : ", categoriesData);

        setProducts(productsWithCategories || []);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("خطأ في جلب البيانات");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
        res = await fetch(`/api/product/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
        if (res.ok) toast.success("تم تحديث المنتج بنجاح");
        else throw new Error("Update failed");
      } else {
        res = await fetch("/api/product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...productData, createdAt: new Date() }),
        });
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
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      try {
        const res = await fetch(`/api/product/${productId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          toast.success("تم حذف المنتج بنجاح");
          fetchData();
        } else {
          throw new Error("Delete failed");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("خطأ في حذف المنتج");
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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <ProductCardSkeleton />;
  }

  return (
    <div className="space-y-6">
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

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في المنتجات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">
                    {product.name}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.imageUrls.length > 0 && (
                <img
                  src={imageService.generateOptimizedUrl(
                    imageService.extractPublicId(product.imageUrls[0]),
                    {
                      width: 300,
                      height: 200 || "/placeholder.svg",
                    }
                  )}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded"
                />
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">السعر</p>
                  <p className="font-semibold">{product.price} جنيه</p>
                </div>
                <div>
                  <p className="text-muted-foreground">المخزون</p>
                  <p className="font-semibold">{product.stockQuantity}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">القسم</p>
                  <p className="font-semibold">{product.categoryName}</p>
                </div>
              </div>

              <div className="flex justify-end items-center space-x-2 ">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(product)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {/* Link to product  */}
                <div>
                  <Link
                    href={`/products/${product.slug}`}
                    className="text-blue-500"
                    target="_blank"
                  >
                    <Link2 />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد منتجات تطابق البحث</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
