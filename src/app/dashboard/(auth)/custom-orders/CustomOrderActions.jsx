"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CustomOrderActions({ orderId, status: initialStatus }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    productType: "",
    description: "",
    quantity: "",
    budget: "",
    url: "",
    status: initialStatus,
  });

  const handleEdit = async () => {
    // Fetch order details first
    setIsLoading(true);
    try {
      const response = await fetch(`/api/dashboard/custom-orders/${orderId}`);
      const data = await response.json();
      if (response.ok) {
        setFormData(data.data);
        setIsOpen(true);
      } else {
        toast.error("فشل في تحميل تفاصيل الطلب");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/dashboard/custom-orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "فشل في تحديث الطلب");
        return;
      }

      toast.success("تم تحديث الطلب بنجاح");
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("حدث خطأ أثناء التحديث");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("هل تريد حقاً رفض هذا الطلب؟")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/dashboard/custom-orders/${orderId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "فشل في رفض الطلب");
        return;
      }

      toast.success("تم رفض الطلب بنجاح");
      router.refresh();
    } catch (error) {
      toast.error("حدث خطأ أثناء الرفض");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2 mt-4">
        <Button
          onClick={handleEdit}
          disabled={isLoading}
          variant="outline"
          className="flex-1"
        >
          تعديل
        </Button>
        <Button
          onClick={handleDelete}
          disabled={isLoading}
          variant="destructive"
          className="flex-1"
        >
          رفض
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل الطلب</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="mb-2 block">
                  الاسم
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="email" className="mb-2 block">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="mb-2 block">
                  رقم الهاتف
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="productType" className="mb-2 block">
                  نوع المنتج
                </Label>
                <Select
                  value={formData.productType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, productType: value })
                  }
                >
                  <SelectTrigger id="productType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="books">كتب</SelectItem>
                    <SelectItem value="stationery">قرطاسية</SelectItem>
                    <SelectItem value="office-tools">أدوات مكتبية</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="mb-2 block">
                الوصف
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity" className="mb-2 block">
                  الكمية
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="budget" className="mb-2 block">
                  الميزانية
                </Label>
                <Input
                  id="budget"
                  type="number"
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
                الرابط
              </Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="status" className="mb-2 block">
                الحالة
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="done">مكتمل</SelectItem>
                  <SelectItem value="refused">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "جاري التحديث..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
