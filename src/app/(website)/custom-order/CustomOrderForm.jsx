"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CustomOrderForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    productType: "",
    description: "",
    quantity: "",
    budget: "",
    url: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/custom-orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("يجب تسجيل الدخول أولاً");
          router.push("/login");
          return;
        }
        toast.error(data.error || "فشل في إرسال الطلب");
        return;
      }

      toast.success(data.message || "تم إرسال الطلب بنجاح!");

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        productType: "",
        description: "",
        quantity: "",
        budget: "",
        url: "",
      });

      // Close modal and refresh page
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="mb-8">
          + إضافة طلب مخصص جديد
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle>نموذج الطلب المخصص</DialogTitle>
          <DialogDescription>
            املأ النموذج أدناه لإرسال طلب مخصص جديد
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="mb-2 block">
                الاسم *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="أدخل اسمك"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="mb-2 block">
                البريد الإلكتروني *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="mb-2 block">
                رقم الهاتف *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="أدخل رقم هاتفك"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="productType" className="mb-2 block">
                نوع المنتج *
              </Label>
              <Select
                value={formData.productType}
                onValueChange={(value) =>
                  setFormData({ ...formData, productType: value })
                }
              >
                <SelectTrigger id="productType">
                  <SelectValue placeholder="اختر نوع المنتج" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="books">كتب</SelectItem>
                  <SelectItem value="stationery">أدوات مكتبية</SelectItem>
                  <SelectItem value="office-tools">أدوات مكتبية</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block">
              وصف المنتج المطلوب *
            </Label>
            <Textarea
              id="description"
              placeholder="اشرح المنتج الذي تريده بالتفصيل"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity" className="mb-2 block">
                الكمية المطلوبة
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="أدخل الكمية"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="budget" className="mb-2 block">
                الميزانية المتاحة (جنيه مصري)
              </Label>
              <Input
                id="budget"
                type="number"
                placeholder="أدخل الميزانية تقريبياً"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                min="0"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="url" className="mb-2 block">
              رابط المنتج (اختياري)
            </Label>
            <Input
              id="url"
              type="url"
              placeholder="أدخل رابط المنتج أو صفحة مرجعية (اختياري)"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "جاري الإرسال..." : "إرسال الطلب"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
