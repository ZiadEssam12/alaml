"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import ProductDetailsForm from "@/components/dashboard/ProductDetailsForm";
import OptionsManager from "@/components/dashboard/OptionsManager";
import VariantsManager from "@/components/dashboard/VariantsManager";

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.productId;
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dashboard/products/${productId}`);
      const data = await response.json();
      if (response.ok) {
        setProduct(data.data);
      } else {
        toast.error(data.error || "Failed to load product");
        router.push("/dashboard/products");
      }
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Failed to load product");
      router.push("/dashboard/products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductUpdate = () => {
    loadProduct();
    toast.success("Product updated successfully");
  };

  if (!productId) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Product ID not found</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Product not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">{product.name}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Edit basic product information</CardDescription>
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
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Manage product images</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Image management is available in the product details form
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
      </Tabs>
    </div>
  );
}
