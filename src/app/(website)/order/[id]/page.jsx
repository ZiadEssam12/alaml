import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { getUserTokenFromHeaders } from "@/lib/auth-helpers";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getOrderDetails } from "@/lib/api/shop/orderAPI";
import {
  generateOrderSchema,
  generateOrganizationSchema,
} from "@/lib/schemas/productSchemas";

export async function generateMetadata({ params }) {
  const orderId = (await params).id;

  return {
    title: `تفاصيل الطلب رقم ${orderId} | مكتبة الأمل`,
    description: `عرض تفاصيل الطلب رقم ${orderId} في مكتبة الأمل. تحقق من حالة الطلب والمنتجات والشحن.`,
    robots: "noindex, nofollow", // Don't index user-specific order details
    openGraph: {
      title: `تفاصيل الطلب رقم ${orderId} | مكتبة الأمل`,
      description: `عرض تفاصيل الطلب رقم ${orderId} في مكتبة الأمل`,
      url: `https://alaml-theta.vercel.app/order/${orderId}`,
      siteName: "مكتبة الأمل",
      locale: "ar_EG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `تفاصيل الطلب رقم ${orderId} | مكتبة الأمل`,
      description: `عرض تفاصيل الطلب رقم ${orderId} في مكتبة الأمل`,
    },
    alternates: {
      canonical: `https://alaml-theta.vercel.app/order/${orderId}`,
    },
  };
}

export default async function OrderDetailsPage({ params }) {
  const orderId = (await params).id;
  const order = await getOrderDetails(orderId);
  const organizationSchema = generateOrganizationSchema();

  if (!order) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        dir="rtl"
      >
        {/* JSON-LD Schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />

        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2 text-muted-foreground">
              لم يتم العثور على الطلب
            </h2>
            <p className="text-muted-foreground">
              الطلب غير موجود أو لا تملك صلاحية الوصول إليه.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orderSchema = generateOrderSchema(order);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(orderSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      {/* ...existing code... */}
    </div>
  );
}
