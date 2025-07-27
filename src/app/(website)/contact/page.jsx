import ContactFormWrapper from "@/components/ContactForm/ContactFormWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";
import React from "react";

export default function page() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">تواصل معنا</h1>
          <p className="text-muted-foreground text-lg">
            نحن هنا لمساعدتك! لا تتردد في التواصل معنا لأي استفسار أو طلب
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ContactFormWrapper />

          {/* معلومات التواصل */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات التواصل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-3 ">
                <Phone className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold">الهاتف</h4>
                  <p className="text-muted-foreground">01096126768</p>
                  <p className="text-sm text-muted-foreground">
                    متاح من 9 صباحاً حتى 9 مساءً
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 ">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold">البريد الإلكتروني</h4>
                  <p className="text-muted-foreground">
                    info@maktabat-alamal.com
                  </p>
                  <p className="text-sm text-muted-foreground">
                    سنرد خلال 24 ساعة
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 ">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold">العنوان</h4>
                  <p className="text-muted-foreground">ابشواي - الفيوم</p>
                  <p className="text-sm text-muted-foreground">مصر</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">أوقات العمل</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>السبت - الخميس</span>
                    <span>9:00 ص - 9:00 م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الجمعة</span>
                    <span>2:00 م - 9:00 م</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">تابعنا على</h4>
                <div className="flex space-x-4 ">
                  <Button variant="outline" size="sm">
                    فيسبوك
                  </Button>
                  <Button variant="outline" size="sm">
                    إنستغرام
                  </Button>
                  <Button variant="outline" size="sm">
                    واتساب
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
