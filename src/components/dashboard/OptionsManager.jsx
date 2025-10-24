"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import toast from "react-hot-toast";

export default function OptionsManager({ productId }) {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [optionToDelete, setOptionToDelete] = useState(null);
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionPresentation, setNewOptionPresentation] = useState("select");
  const [newValueName, setNewValueName] = useState("");
  const [newValueHex, setNewValueHex] = useState("");
  const [newValueImageUrl, setNewValueImageUrl] = useState("");

  useEffect(() => {
    loadOptions();
  }, [productId]);

  const loadOptions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/dashboard/products/${productId}/options`
      );
      const data = await response.json();
      if (response.ok) {
        setOptions(data.options || []);
      } else {
        toast.error(data.error || "Failed to load options");
      }
    } catch (error) {
      console.error("Error loading options:", error);
      toast.error("Failed to load options");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOption = async () => {
    try {
      if (!newOptionName.trim()) {
        toast.error("Option name is required");
        return;
      }

      if (!newValueName.trim()) {
        toast.error("At least one value is required");
        return;
      }

      const response = await fetch(
        `/api/dashboard/products/${productId}/options`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newOptionName,
            presentation: newOptionPresentation,
            value: newValueName,
            hex: newValueHex || null,
            imageUrl: newValueImageUrl || null,
            position: 0,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Option created successfully");
        setShowAddDialog(false);
        resetForm();
        loadOptions();
      } else {
        toast.error(data.error || "Failed to create option");
      }
    } catch (error) {
      console.error("Error creating option:", error);
      toast.error("Failed to create option");
    }
  };

  const handleDeleteOption = async () => {
    try {
      const response = await fetch(
        `/api/dashboard/products/${productId}/options/${optionToDelete.id}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        toast.success("Option deleted successfully");
        setOptionToDelete(null);
        loadOptions();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete option");
      }
    } catch (error) {
      console.error("Error deleting option:", error);
      toast.error("Failed to delete option");
    }
  };

  const resetForm = () => {
    setNewOptionName("");
    setNewOptionPresentation("select");
    setNewValueName("");
    setNewValueHex("");
    setNewValueImageUrl("");
  };

  const getPresentationLabel = (presentation) => {
    const labels = {
      swatch: "Color Swatch",
      pill: "Pill Button",
      select: "Select Dropdown",
    };
    return labels[presentation] || presentation;
  };

  if (!productId) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Product ID not found</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Product Options</CardTitle>
          <CardDescription>
            Manage options (Size, Color, etc.) and their values
          </CardDescription>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Option
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Option</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Option Name</label>
                <Input
                  placeholder="e.g., Size, Color"
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Presentation Type</label>
                <Select
                  value={newOptionPresentation}
                  onValueChange={setNewOptionPresentation}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">Select Dropdown</SelectItem>
                    <SelectItem value="pill">Pill Button</SelectItem>
                    <SelectItem value="swatch">Color Swatch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">First Value</label>
                <Input
                  placeholder="e.g., Small, Red"
                  value={newValueName}
                  onChange={(e) => setNewValueName(e.target.value)}
                  className="mt-1"
                />
              </div>

              {newOptionPresentation === "swatch" && (
                <div>
                  <label className="text-sm font-medium">
                    Color Hex (Optional)
                  </label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={newValueHex || "#000000"}
                      onChange={(e) => setNewValueHex(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      placeholder="#000000"
                      value={newValueHex}
                      onChange={(e) => setNewValueHex(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}

              {newOptionPresentation === "swatch" && (
                <div>
                  <label className="text-sm font-medium">
                    Image URL (Optional)
                  </label>
                  <Input
                    placeholder="https://..."
                    value={newValueImageUrl}
                    onChange={(e) => setNewValueImageUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddOption}>Create Option</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading options...</p>
          </div>
        ) : options.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No options created yet</p>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Option
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-4">
            {options.map((option, index) => (
              <Card key={option.id} className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <h3 className="font-semibold">{option.name}</h3>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {getPresentationLabel(option.presentation)}
                        </span>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {option.values?.length || 0} value
                        {(option.values?.length || 0) !== 1 ? "s" : ""}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {option.values?.map((value) => (
                          <div
                            key={value.id}
                            className="flex items-center gap-2 bg-background px-2 py-1 rounded text-sm border"
                          >
                            {option.presentation === "swatch" && value.hex && (
                              <div
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: value.hex }}
                              />
                            )}
                            <span>{value.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOptionToDelete(option)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!optionToDelete}
        onOpenChange={(open) => !open && setOptionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Delete Option</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the "{optionToDelete?.name}" option?
            This will deactivate all variants using this option.
          </AlertDialogDescription>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOption}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
