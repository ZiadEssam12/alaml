"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, Send, CheckCircle, AlertCircle } from "lucide-react";
import { submitCustomOrderForm } from "@/lib/formspree-service";

export default function CustomOrderForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    productName: "",
    description: "",
    quantity: 1,
    budget: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await submitCustomOrderForm(formData);
      console.log("result:", result);
      if (result.ok) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          productName: "",
          description: "",
          quantity: 1,
          budget: "",
        });
      } else {
        setError(result.errors?.[0]?.message || "حدث خطأ في إرسال الطلب");
      }
    } catch (error) {
      setError("حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess(false);
  };

  if (success) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            تم إرسال طلبك المخصص بنجاح!
          </h3>
          <p className="text-muted-foreground mb-4">
            شكراً لك! سنقوم بدراسة طلبك والتواصل معك خلال 24-48 ساعة لمناقشة
            التفاصيل والأسعار.
          </p>
          <Button onClick={() => setSuccess(false)} variant="outline">
            طلب منتج آخر
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>اطلب منتجك المخصص</span>
          </CardTitle>
          <p className="text-muted-foreground">
            لم تجد ما تبحث عنه؟ أخبرنا عن المنتج الذي تريده وسنحاول توفيره لك
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* معلومات التواصل */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">معلومات التواصل</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="name">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone">
                    رقم الهاتف <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="01012345678"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="example@email.com"
                />
              </div>
            </div>

            {/* تفاصيل المنتج */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">تفاصيل المنتج المطلوب</h3>

              <div className="space-y-3">
                <Label htmlFor="productName">
                  اسم المنتج <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) =>
                    handleInputChange("productName", e.target.value)
                  }
                  placeholder="مثال: كتاب تعلم البرمجة للمبتدئين"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="description">
                  وصف تفصيلي للمنتج <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="اكتب وصفاً مفصلاً للمنتج المطلوب، المؤلف، دار النشر، اللغة، أو أي تفاصيل أخرى مهمة..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="quantity">
                    الكمية المطلوبة <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      handleInputChange(
                        "quantity",
                        Number.parseInt(e.target.value) || 1
                      )
                    }
                    aria-labelledby="quantity"
                    aria-label="الكمية المطلوبة"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="budget">الميزانية المتوقعة (اختياري)</Label>
                  <Input
                    id="budget"
                    value={formData.budget}
                    onChange={(e) =>
                      handleInputChange("budget", e.target.value)
                    }
                    placeholder="مثال: 100-200 جنيه"
                  />
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">ملاحظة مهمة:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• سنقوم بالبحث عن المنتج المطلوب من مصادرنا المختلفة</li>
                <li>• سنتواصل معك خلال 24-48 ساعة لتأكيد التوفر والسعر</li>
                <li>• قد تختلف الأسعار حسب التوفر ومصدر المنتج</li>
                <li>• لا نتقاضى أي رسوم إضافية على الطلبات المخصصة</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" />
                  جاري إرسال الطلب...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 ml-2" />
                  إرسال الطلب المخصص
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
