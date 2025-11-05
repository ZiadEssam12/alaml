"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  generateServiceSchema,
  generateOrganizationSchema,
} from "@/lib/schemas/productSchemas";

export async function generateMetadata() {
  return {
    title: "طلب مخصص | مكتبة الأمل",
    description:
      "اطلب منتجات مخصصة حسب احتياجاتك من مكتبة الأمل. نقدم خدمة الطلبات المخصصة للأدوات المكتبية والقرطاسية بجودة عالية.",
    keywords:
      "طلب مخصص, منتجات مخصصة, أدوات مكتبية مخصصة, قرطاسية مخصصة, مكتبة الأمل",
    openGraph: {
      title: "طلب مخصص | مكتبة الأمل",
      description: "اطلب منتجات مخصصة حسب احتياجاتك من مكتبة الأمل",
      url: "https://alaml-theta.vercel.app/custom-order",
      siteName: "مكتبة الأمل",
      locale: "ar_EG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "طلب مخصص | مكتبة الأمل",
      description: "اطلب منتجات مخصصة حسب احتياجاتك من مكتبة الأمل",
    },
    alternates: {
      canonical: "https://alaml-theta.vercel.app/custom-order",
    },
  };
}

export default function CustomOrderPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    productType: "",
    description: "",
    quantity: "",
    budget: "",
  });

  const serviceSchema = generateServiceSchema();
  const organizationSchema = generateOrganizationSchema();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">طلب مخصص</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            لديك فكرة محددة للمنتج الذي تريده؟ نحن نقدم خدمة الطلبات المخصصة
            لتلبية احتياجاتك الخاصة
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
      </main>
    </div>
  );
}
