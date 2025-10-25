"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ProductDetailsForm from "@/components/dashboard/ProductDetailsForm";
import OptionsManager from "@/components/dashboard/OptionsManager";
import VariantsManager from "@/components/dashboard/VariantsManager";
import { loadProduct } from "@/lib/api/dashboard/productLoader";
import toast from "react-hot-toast";

function EditProductForm({ productId, handleClose }) {
  const [activeTab, setActiveTab] = useState("details");
  const [product, setProduct] = useState(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  // Load product details on component mount
  useEffect(() => {
    if (productId) {
      handleLoadProduct();
    }
  }, [productId]);

  const handleLoadProduct = async () => {
    if (!productId) return;
    try {
      setIsLoadingProduct(true);
      const data = await loadProduct(productId);
      setProduct(data);
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("فشل تحميل تفاصيل المنتج");
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleProductUpdate = () => {
    handleLoadProduct();
  };

  if (isLoadingProduct) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">جاري تحميل المنتج...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">فشل تحميل المنتج</p>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
            <CardDescription>تعديل معلومات المنتج الأساسية</CardDescription>
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
        <OptionsManager productId={productId} />
      </TabsContent>

      {/* Variants Tab */}
      <TabsContent value="variants" className="space-y-4">
        <VariantsManager productId={productId} />
      </TabsContent>

      {/* Modal Footer */}
      <div className="flex justify-end space-x-2 border-t pt-4">
        <Button variant="outline" onClick={handleClose}>
          إغلاق
        </Button>
      </div>
    </Tabs>
  );
}

export default EditProductForm;
