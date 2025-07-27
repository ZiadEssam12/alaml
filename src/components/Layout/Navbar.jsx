import React from "react";
import { ModeToggle } from "../Theme";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { MobileMenuToggle } from "./mobile-menu";

export default function Navbar() {
  const cartItemsCount = 0; // Placeholder for cart items count
  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-2">
        <div className="container mx-auto px-4 text-center text-sm">
          مرحباً بكم في مكتبة الأمل - شحن مجاني للطلبات أكثر من 200 جنيه
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 space-x-reverse"
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                م
              </span>
            </div>
            <span className="text-xl font-bold">مكتبة الأمل</span>
          </Link>

          {/* Actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Wishlist */}
            <ModeToggle className="h-5 w-5" />

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartItemsCount}
                  </Badge>
                )}
                <span className="sr-only">عربة التسوق</span>
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <MobileMenuToggle />
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8 space-x-reverse mt-4 pt-4 border-t">
          <Link href="/" className="text-sm font-medium hover:text-primary">
            الرئيسية
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium hover:text-primary"
          >
            المنتجات
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium hover:text-primary"
          >
            الأقسام
          </Link>
          <Link href="/blog" className="text-sm font-medium hover:text-primary">
            المدونة
          </Link>
          <Link
            href="/custom-order"
            className="text-sm font-medium hover:text-primary"
          >
            اطلب منتجك
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium hover:text-primary"
          >
            اتصل بنا
          </Link>
        </nav>
      </div>
    </header>
  );
}
