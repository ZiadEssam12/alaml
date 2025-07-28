"use client";

import FormWrapper from "@/components/custom-order/formWrapper";

// import { CustomOrderForm } from "@/components/forms/custom-order-form";

export default function CustomOrderPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">اطلب منتجك المخصص</h1>
            <p className="text-muted-foreground text-lg">
              لم تجد ما تبحث عنه في متجرنا؟ أخبرنا عن المنتج الذي تريده وسنحاول
              توفيره لك خصيصاً
            </p>
          </div>

          <FormWrapper />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-semibold mb-2">كتب نادرة</h3>
              <p className="text-sm text-muted-foreground">
                نبحث عن الكتب النادرة والمتخصصة من مصادر متعددة
              </p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-3xl mb-3">🎓</div>
              <h3 className="font-semibold mb-2">كتب أكاديمية</h3>
              <p className="text-sm text-muted-foreground">
                مراجع جامعية وكتب تخصصية للطلاب والباحثين
              </p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="text-3xl mb-3">✏️</div>
              <h3 className="font-semibold mb-2">قرطاسية مخصصة</h3>
              <p className="text-sm text-muted-foreground">
                أدوات مكتبية وقرطاسية بمواصفات خاصة
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
