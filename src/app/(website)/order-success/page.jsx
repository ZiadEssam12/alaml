"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Clock, Phone } from "lucide-react";

export default function OrderSuccessPage() {
  const router = useRouter();
  const [orderNumber] = useState(() =>
    Math.random().toString(36).substr(2, 9).toUpperCase()
  );

  useEffect(() => {
    // Redirect to home after 30 seconds if user doesn't navigate away
    const timer = setTimeout(() => {
      router.push("/");
    }, 30000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              تم إرسال طلبك بنجاح!
            </h1>
            <p className="text-muted-foreground">
              شكراً لك على ثقتك في مكتبة الأمل
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>تفاصيل الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">رقم الطلب:</span>
                <span className="font-bold">#{orderNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">حالة الطلب:</span>
                <span className="text-orange-600 font-medium">
                  قيد المراجعة
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">طريقة الدفع:</span>
                <span>الدفع عند الاستلام</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="text-center p-6">
                <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">المراجعة</h3>
                <p className="text-sm text-muted-foreground">
                  سنراجع طلبك خلال ساعات قليلة
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center p-6">
                <Package className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">التحضير والشحن</h3>
                <p className="text-sm text-muted-foreground">
                  سيتم تحضير طلبك وشحنه خلال 1-2 يوم عمل
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center p-6">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">التسليم</h3>
                <p className="text-sm text-muted-foreground">
                  سيصلك الطلب خلال 3-5 أيام عمل
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-2 space-x-reverse mb-4">
                <Phone className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">سنتواصل معك قريباً</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                سيتصل بك فريق خدمة العملاء خلال الساعات القادمة لتأكيد تفاصيل
                الطلب والعنوان
              </p>
              <div className="text-sm text-muted-foreground">
                <p>للاستفسارات: 01012345678</p>
                <p>البريد الإلكتروني: info@maktabat-alamal.com</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Button
              onClick={() => router.push("/products")}
              className="w-full md:w-auto"
            >
              تصفح المزيد من المنتجات
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full md:w-auto md:mr-4"
            >
              العودة للرئيسية
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
