"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Plus,
  Edit,
  Package,
  Link2,
  Check,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { ProductCardSkeleton } from "@/components/dashbaord/product/skelaton";
import { Skeleton } from "@/components/ui/skeleton";
import { imageService } from "@/lib/image-service";
import { useSearchParams } from "next/navigation";
import SearchBox from "@/components/dashbaord/SearchBox";
import { PaginationClient } from "@/components/Pagination";
import {
  createProduct,
  updateProduct,
  toggleProductStatus,
  fetchProductsDataClient,
} from "@/lib/api/dashboard/productsAPI.client";

// Dynamic import for AddingProductForm with skeleton loader
const AddingProductForm = dynamic(() => import("./AddingProductForm"), {
  loading: () => <ProductFormSkeleton />,
  ssr: false,
});

// ProductFormSkeleton component for loading state
function ProductFormSkeleton() {
  return (
    <div className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
      <div className="mb-6">
        <Skeleton className="h-6 w-48 mb-2" />
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-24 w-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-32 w-full" />
        </div>

        <div className="flex justify-end space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}

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
    maxQuantityPerUser: 1,
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
        const { products, categories, pagination } =
          await fetchProductsDataClient({
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
        maxQuantityPerUser: formData.maxQuantityPerUser,
        categoryID: formData.categoryID,
        imageUrls: formData.imageUrls,
        updatedAt: new Date(),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success("تم تحديث المنتج بنجاح");
      } else {
        await createProduct(productData);
        toast.success("تم إضافة المنتج بنجاح");
      }

      setDialogOpen(false);
      resetForm();

      // Refresh data
      const { products, categories, pagination } =
        await fetchProductsDataClient({
          q,
          page,
          pageSize,
        });
      setProducts(products);
      setCategories(categories);
      setPagination(pagination);
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
      maxQuantityPerUser: product.maxQuantityPerUser || 1,
      categoryID: product.categoryID,
      imageUrls: product.imageUrls,
    });
    setDialogOpen(true);
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    const action = currentStatus ? "إلغاء تنشيط" : "تنشيط";
    const confirmMessage = `هل أنت متأكد من ${action} هذا المنتج؟`;

    if (confirm(confirmMessage)) {
      try {
        await toggleProductStatus(productId, !currentStatus);

        const newStatus = !currentStatus;
        toast.success(`تم ${newStatus ? "تنشيط" : "إلغاء تنشيط"} المنتج بنجاح`);

        // Update the local state immediately for better UX
        setProducts(
          products.map((product) =>
            product.id === productId
              ? { ...product, isActive: newStatus }
              : product
          )
        );
      } catch (error) {
        console.error("Error toggling product status:", error);
        toast.error("خطأ في تغيير حالة المنتج");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      stockQuantity: 0,
      maxQuantityPerUser: 1,
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

        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة منتج جديد
        </Button>

        <AddingProductForm
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          editingProduct={editingProduct}
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
        />
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
                        <div className="flex flex-col items-center gap-1">
                          {product.isActive ? (
                            <>
                              <span className="inline-block rounded-full p-2 text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                <Check className="h-4 w-4 text-green-800" />
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="inline-block rounded-full p-2 text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                <X className="h-4 w-4 text-red-800" />
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <Link href={`/dashboard/products/${product.id}`}>
                            <Button variant="outline" size="sm" title="تعديل">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleStatus(product.id, product.isActive)
                            }
                            title={
                              product.isActive
                                ? "إلغاء تنشيط المنتج"
                                : "تنشيط المنتج"
                            }
                          >
                            {product.isActive ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
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
                <div className="flex flex-col items-center gap-1">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-3 w-12 rounded" />
                </div>
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
