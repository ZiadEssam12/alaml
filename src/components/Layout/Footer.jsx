import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function Footer() {
  const settings = {
    storeName: "مكتبة الأمل",
    contactPhone: "+1234567890",
    address: "1234 Elm Street, Springfield, USA",
    facebookUrl: "https://facebook.com/maktabat-alamal",
    instagramUrl: "https://instagram.com/maktabat_alamal",
  };

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Store Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">
              {settings?.storeName || "مكتبة الأمل"}
            </h3>
            <p className="text-muted-foreground mb-4">
              متجرك الموثوق للكتب والقرطاسية والهدايا المميزة
            </p>
            <div className="flex space-x-4">
              {settings?.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings?.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className="text-muted-foreground hover:text-primary"
                >
                  المنتجات
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-muted-foreground hover:text-primary"
                >
                  الأقسام
                </Link>
              </li>
              <li>
                <Link
                  href="/custom-order"
                  className="text-muted-foreground hover:text-primary"
                >
                  اطلب منتجك
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-primary"
                >
                  المدونة
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-lg mb-4">خدمة العملاء</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary"
                >
                  اتصل بنا
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-muted-foreground hover:text-primary"
                >
                  الشحن والتوصيل
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-muted-foreground hover:text-primary"
                >
                  الإرجاع والاستبدال
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary"
                >
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">معلومات التواصل</h3>
            <div className="space-y-3">
              {settings?.contactPhone && (
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {settings.contactPhone}
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-3 space-x-reverse">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  info@maktabat-alamal.com
                </span>
              </div>
              {settings?.address && (
                <div className="flex items-center space-x-3 space-x-reverse">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {settings.address}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 مكتبة الأمل. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
