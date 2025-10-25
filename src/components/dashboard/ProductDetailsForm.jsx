"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/dashbaord/imageUpload";
import toast from "react-hot-toast";

export default function ProductDetailsForm({ product, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stockQuantity: 0,
    maxQuantityPerUser: 1,
    categoryID: "",
    imageUrls: [],
  });

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Load categories and initialize form
  useEffect(() => {
    loadCategories();
    if (product) {
      initializeForm();
    }
  }, [product]);

  const loadCategories = async () => {
    try {
      setIsFetching(true);
      const response = await fetch("/api/dashboard/categories");
      const data = await response.json();
      if (response.ok) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsFetching(false);
    }
  };

  const initializeForm = () => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        stockQuantity: product.stockQuantity || 0,
        maxQuantityPerUser: product.maxQuantityPerUser || 1,
        categoryID: product.categoryID || "",
        imageUrls: product.imageUrls || [],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Product description is required");
      return;
    }

    if (!formData.categoryID) {
      toast.error("Please select a category");
      return;
    }

    if (formData.price < 0) {
      toast.error("Price cannot be negative");
      return;
    }

    if (formData.stockQuantity < 0) {
      toast.error("Stock quantity cannot be negative");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/dashboard/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Product updated successfully");
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(data.error || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Loading form...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">اسم المنتج</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryID">القسم</Label>
          <Select
            value={formData.categoryID}
            onValueChange={(value) =>
              setFormData({ ...formData, categoryID: value })
            }
            disabled={isLoading}
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
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">السعر (جنيه)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) =>
              setFormData({
                ...formData,
                price: Number.parseFloat(e.target.value) || 0,
              })
            }
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stockQuantity">الكمية المتوفرة</Label>
          <Input
            id="stockQuantity"
            type="number"
            min="0"
            value={formData.stockQuantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                stockQuantity: Number.parseInt(e.target.value) || 0,
              })
            }
            required
            disabled={isLoading}
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
          disabled={isLoading}
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

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "جاري التحديث..." : "تحديث المنتج"}
        </Button>
      </div>
    </form>
  );
}
