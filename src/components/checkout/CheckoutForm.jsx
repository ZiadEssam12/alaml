"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getCookie } from "@/lib/getCookies";

export function CheckoutForm({ items, total }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const clearCart = () => {
    console.log("cart cleared");
  };

  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
    paymentMethod: "cash", // Only COD
  });

  const [errors, setErrors] = useState({});

  const shippingCost = total >= 200 ? 0 : 30;
  const finalTotal = total + shippingCost;

  const validateForm = () => {
    const orderData = {
      customerInfo: formData,
      items: items.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
      })),
      subtotal: total,
      shippingCost,
      finalTotal,
      paymentMethod: formData.paymentMethod,
    };

    const errors = {};
    if (!orderData.customerInfo.name) {
      errors["customerInfo.name"] = "الاسم مطلوب";
    }

    if (
      orderData.customerInfo.email &&
      !/\S+@\S+\.\S+/.test(orderData.customerInfo.email)
    ) {
      errors["customerInfo.email"] = "البريد الإلكتروني غير صالح";
    }

    if (!orderData.customerInfo.phone) {
      errors["customerInfo.phone"] = "رقم الهاتف مطلوب";
    }

    if (!orderData.customerInfo.address) {
      errors["customerInfo.address"] = "العنوان مطلوب";
    }

    if (!orderData.customerInfo.city) {
      errors["customerInfo.city"] = "المدينة مطلوبة";
    }

    if (!orderData.paymentMethod) {
      errors["paymentMethod"] = "طريقة الدفع مطلوبة";
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    if (items.length === 0) {
      toast.error("السلة فارغة");
      return;
    }

    setLoading(true);

    try {
      // Prepare only required customer info for backend
      const orderData = {
        customerName: formData.customerName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingStreet: formData.address,
        shippingCity: formData.city,
        shippingZipCode: "", // Add if needed
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };

      const res = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userid: getCookie("userid"),
        },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          data.error || "حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى"
        );
        setLoading(false);
        return;
      }
      toast.success("تم إرسال طلبك بنجاح! سنتواصل معك قريباً");
      clearCart();
      router.push(`/order-success?orderId=${data.data.id}`);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات العميل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="customerName">الاسم الكامل</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                required
                className={
                  errors["customerInfo.customerName"] ? "border-red-500" : ""
                }
              />
              {errors["customerInfo.customerName"] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors["customerInfo.customerName"]}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="01xxxxxxxxx"
                required
                className={errors["customerInfo.phone"] ? "border-red-500" : ""}
              />
              {errors["customerInfo.phone"] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors["customerInfo.phone"]}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className={errors["customerInfo.email"] ? "border-red-500" : ""}
            />
            {errors["customerInfo.email"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["customerInfo.email"]}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="address">العنوان التفصيلي</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="الشارع، رقم المبنى، الحي..."
              required
              className={errors["customerInfo.address"] ? "border-red-500" : ""}
            />
            {errors["customerInfo.address"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["customerInfo.address"]}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="city">المدينة</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              required
              className={errors["customerInfo.city"] ? "border-red-500" : ""}
            />
            {errors["customerInfo.city"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["customerInfo.city"]}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="أي ملاحظات خاصة بالطلب..."
              className={errors["customerInfo.notes"] ? "border-red-500" : ""}
            />
            {errors["customerInfo.notes"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["customerInfo.notes"]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>طريقة الدفع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 ">
            <Label htmlFor="cash">الدفع عند الاستلام فقط</Label>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>ملخص الطلب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>المجموع الفرعي</span>
            <span>{total.toFixed(2)} جنيه</span>
          </div>
          <div className="flex justify-between">
            <span>الشحن</span>
            <span>{shippingCost === 0 ? "مجاني" : `${shippingCost} جنيه`}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>المجموع الكلي</span>
            <span>{finalTotal.toFixed(2)} جنيه</span>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full"
        disabled={loading || items.length === 0}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
            جاري إرسال الطلب...
          </>
        ) : (
          "تأكيد الطلب"
        )}
      </Button>
    </form>
  );
}
