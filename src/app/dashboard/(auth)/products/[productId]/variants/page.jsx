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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import VariantForm from "@/components/dashbaord/VariantForm";
import { Edit, Trash2, Plus, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function VariantsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.productId;

  const [variants, setVariants] = useState([]);
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantToDelete, setVariantToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadVariants();
    loadOptions();
  }, [productId]);

  const loadVariants = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/dashboard/products/${productId}/variants`
      );
      const data = await response.json();
      if (response.ok) {
        setVariants(data.data || []);
      } else {
        toast.error(data.error || "Failed to load variants");
      }
    } catch (error) {
      console.error("Error loading variants:", error);
      toast.error("Failed to load variants");
    } finally {
      setIsLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const response = await fetch(
        `/api/dashboard/products/${productId}/options`
      );
      const data = await response.json();
      if (response.ok) {
        setOptions(data.options || data || []);
      }
    } catch (error) {
      console.error("Error loading options:", error);
    }
  };

  const handleCreateVariant = async (variantData) => {
    try {
      const response = await fetch(
        `/api/dashboard/products/${productId}/variants`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(variantData),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Variant created successfully");
        setShowForm(false);
        loadVariants();
      } else {
        toast.error(data.error || "Failed to create variant");
      }
    } catch (error) {
      console.error("Error creating variant:", error);
      toast.error("Failed to create variant");
    }
  };

  const handleUpdateVariant = async (variantData) => {
    try {
      const response = await fetch(
        `/api/dashboard/products/${productId}/variants/${editingVariant.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(variantData),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Variant updated successfully");
        setEditingVariant(null);
        loadVariants();
      } else {
        toast.error(data.error || "Failed to update variant");
      }
    } catch (error) {
      console.error("Error updating variant:", error);
      toast.error("Failed to update variant");
    }
  };

  const handleDeleteVariant = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(
        `/api/dashboard/products/${productId}/variants/${variantToDelete.id}`,
        { method: "DELETE" }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Variant deleted successfully");
        setVariantToDelete(null);
        loadVariants();
      } else {
        toast.error(data.error || "Failed to delete variant");
      }
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error("Failed to delete variant");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderOptions = (variant) => {
    return variant.options
      ?.map((opt) => `${opt.option.name}: ${opt.value.value}`)
      .join(", ");
  };

  if (!productId) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Product ID not found</p>
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
          <h1 className="text-3xl font-bold">Product Variants</h1>
          <p className="text-muted-foreground">
            Manage variants for this product
          </p>
        </div>
      </div>

      {/* Form Section */}
      {showForm || editingVariant ? (
        <VariantForm
          productId={productId}
          productOptions={options}
          initialVariant={editingVariant}
          onSubmit={editingVariant ? handleUpdateVariant : handleCreateVariant}
          onCancel={() => {
            setShowForm(false);
            setEditingVariant(null);
          }}
          isLoading={isLoading}
        />
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Variants</CardTitle>
              <CardDescription>
                {variants.length} variant{variants.length !== 1 ? "s" : ""}{" "}
                found
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Variant
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading variants...</p>
              </div>
            ) : variants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No variants created yet. Start by adding one!
                </p>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Variant
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Options</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variants.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell className="max-w-xs">
                          <div className="text-sm">
                            {renderOptions(variant) || "No options"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {variant.sku ? (
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {variant.sku}
                            </code>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {Number(variant.price).toLocaleString()} جنيه
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{variant.stockQuantity}</span>
                            {variant.stockQuantity === 0 && (
                              <Badge variant="destructive">Out of Stock</Badge>
                            )}
                            {variant.stockQuantity > 0 &&
                              variant.stockQuantity <= 5 && (
                                <Badge variant="outline">Low Stock</Badge>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {variant.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingVariant(variant)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setVariantToDelete(variant)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!variantToDelete}
        onOpenChange={(open) => !open && setVariantToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Delete Variant</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this variant? This action cannot be
            undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVariant}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
