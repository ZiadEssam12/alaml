"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { imageService } from "@/lib/image-service";

export function ImageUpload({
  onImageUploaded,
  onImageRemoved,
  currentImages = [],
  maxImages = 5,
  folder = "products",
}) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    if (currentImages.length + files.length > maxImages) {
      toast.error(`يمكنك رفع ${maxImages} صور كحد أقصى`);
      return;
    }

    setUploading(true);

    try {
      // Collect all valid files first
      const validFiles = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // التحقق من نوع الملف
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} ليس ملف صورة صالح`);
          continue;
        }

        // التحقق من حجم الملف (5MB كحد أقصى)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} كبير جداً. الحد الأقصى 5MB`);
          continue;
        }

        validFiles.push(file);
      }

      // Upload all files in parallel and collect URLs
      const uploadPromises = validFiles.map((file) =>
        imageService
          .uploadImage(file, folder)
          .then((url) => ({
            url,
            name: file.name,
            success: true,
          }))
          .catch((error) => ({
            name: file.name,
            success: false,
            error,
          }))
      );

      const results = await Promise.all(uploadPromises);

      // Process results and call onImageUploaded for each successful upload
      for (const result of results) {
        if (result.success) {
          onImageUploaded(result.url);
          toast.success(`تم رفع ${result.name} بنجاح`);
        } else {
          toast.error(`فشل رفع ${result.name}`);
        }
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("حدث خطأ أثناء رفع الصور");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      <Label>
        صور المنتج ({currentImages.length}/{maxImages})
      </Label>

      {/* منطقة رفع الصور */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center p-6">
          <ImageIcon className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4 text-center">
            اسحب الصور هنا أو انقر لاختيار الملفات
          </p>
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="image-upload"
            disabled={uploading || currentImages.length >= maxImages}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("image-upload")?.click()}
            disabled={uploading || currentImages.length >= maxImages}
          >
            <Upload className="h-4 w-4 ml-2" />
            {uploading ? "جاري الرفع..." : "اختر الصور"}
          </Button>
        </CardContent>
      </Card>

      {/* معاينة الصور المرفوعة */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentImages.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageService.generateOptimizedUrl(
                  imageService.extractPublicId(imageUrl),
                  {
                    width: 200,
                    height: 200 || "/placeholder.svg",
                  }
                )}
                alt={`صورة ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  if (onImageRemoved) {
                    onImageRemoved(index);
                  }
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <p>• أنواع الملفات المدعومة: JPG, PNG, WebP</p>
        <p>• الحد الأقصى لحجم الملف: 5MB</p>
        <p>• سيتم تحسين الصور تلقائياً للحصول على أفضل أداء</p>
      </div>
    </div>
  );
}
