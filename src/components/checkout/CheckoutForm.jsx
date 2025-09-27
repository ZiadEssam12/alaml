"use client";

import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cartContext } from "@/Context/Cart";

export function CheckoutForm({ items, total, coupon }) {
  console.log("🔄 CheckoutForm Props Received:", {
    itemsCount: items?.length,
    total,
    coupon,
    couponType: coupon?.type,
    couponCode: coupon?.code,
  });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    notes: "",
    paymentMethod: "cash", // Only COD
    couponCode: null,
  });

  const [errors, setErrors] = useState({});

  const calculateShippingCost = () => {
    const couponType = coupon?.coupon.type;
    return total < 200 && couponType === "free_shipping" ? 0 : 30;
  };

  const shippingCost = calculateShippingCost();
  const finalTotal = total + shippingCost;

  const router = useRouter();
  const { setCart } = useContext(cartContext);

  async function onSubmitOrder(orderData) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify(orderData),
      });
      const result = await res.json();
      console.log("result :", result);
      if (res.ok) {
        setCart([]);
        toast.success("سيتم توصيل طلبك قريبًا.");
        router.push(`/order-success?orderNumber=${result.orderId}`);
      } else {
        toast.error(result.error || "يرجى المحاولة مرة أخرى");
      }
    } catch (err) {
      toast.error("حدث خطأ أثناء إرسال الطلب");
    }
  }

  const validateForm = () => {
    const errors = {};
    if (!formData.customerName) {
      errors["customerName"] = "الاسم مطلوب";
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors["email"] = "البريد الإلكتروني غير صالح";
    }
    if (!formData.phone) {
      errors["phone"] = "رقم الهاتف مطلوب";
    }
    if (!formData.address) {
      errors["address"] = "العنوان مطلوب";
    }
    if (!formData.city) {
      errors["city"] = "المدينة مطلوبة";
    }
    if (!formData.paymentMethod) {
      errors["paymentMethod"] = "طريقة الدفع مطلوبة";
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
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
    // Prepare order data for backend
    const orderData = {
      customerName: formData.customerName,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      shippingStreet: formData.address,
      shippingCity: formData.city,
      shippingZipCode: formData.zipCode,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
      couponCode: coupon?.coupon?.code || null,
    };

    try {
      await onSubmitOrder(orderData);
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
                className={errors["customerName"] ? "border-red-500" : ""}
              />
              {errors["customerName"] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors["customerName"]}
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
                className={errors["phone"] ? "border-red-500" : ""}
              />
              {errors["phone"] && (
                <p className="text-red-500 text-sm mt-1">{errors["phone"]}</p>
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
              className={errors["email"] ? "border-red-500" : ""}
            />
            {errors["email"] && (
              <p className="text-red-500 text-sm mt-1">{errors["email"]}</p>
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
              className={errors["address"] ? "border-red-500" : ""}
            />
            {errors["address"] && (
              <p className="text-red-500 text-sm mt-1">{errors["address"]}</p>
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
              className={errors["city"] ? "border-red-500" : ""}
            />
            {errors["city"] && (
              <p className="text-red-500 text-sm mt-1">{errors["city"]}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="zipCode">الرمز البريدي (اختياري)</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) =>
                setFormData({ ...formData, zipCode: e.target.value })
              }
              className={errors["zipCode"] ? "border-red-500" : ""}
            />
            {errors["zipCode"] && (
              <p className="text-red-500 text-sm mt-1">{errors["zipCode"]}</p>
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
              className={errors["notes"] ? "border-red-500" : ""}
            />
            {errors["notes"] && (
              <p className="text-red-500 text-sm mt-1">{errors["notes"]}</p>
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
          {/* Coupon Status */}
          {coupon ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center justify-between">
                <span className="text-green-800 font-medium">
                  كوبون مطبق: {coupon.coupon.code}
                </span>
                <span className="text-green-600 text-sm">
                  (
                  {coupon.coupon.type === "free_shipping" ? "شحن مجاني" : "خصم"}
                  )
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <span className="text-gray-600 text-sm">لا يوجد كوبون مطبق</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>المجموع الفرعي</span>
            <span>{total.toFixed(2)} جنيه</span>
          </div>
          <div className="flex justify-between">
            <span>الشحن</span>
            <div className="text-left">
              <span
                className={
                  shippingCost === 0 ? "text-green-600 font-medium" : ""
                }
              >
                {shippingCost === 0 ? "مجاني" : `${shippingCost} جنيه`}
              </span>
              {shippingCost === 0 && (
                <div className="text-xs text-green-600">
                  (تطبيق كوبون الشحن المجاني)
                </div>
              )}
              {total >= 200 && coupon?.type === "free_shipping" && (
                <div className="text-xs text-orange-600">
                  (كوبون الشحن المجاني ينطبق على الطلبات أقل من 200 جنيه)
                </div>
              )}
            </div>
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
