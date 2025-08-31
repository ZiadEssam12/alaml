import React from "react";
import { ModeToggle } from "../Theme";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { MobileMenuToggle } from "./mobile-menu";
import CategoriesPopUp from "../CategoriesPopUp";
import CartItemsCount from "./CartItemsCound";
import SearchBar from "../searchbar/searchBar";

export default function Navbar() {
  const cartItemsCount = 0; // Placeholder for cart items count
  return (
    <header className="sticky top-0 z-50 bg-background shadow">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-2 hidden">
        <div className="container mx-auto px-4 text-center text-sm">
          مرحباً بكم في مكتبة الأمل - شحن مجاني للطلبات أكثر من 200 جنيه
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-1 flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                م
              </span>
            </div>
            <span className="text-xl font-bold hidden lg:block">
              مكتبة الأمل
            </span>
          </Link>

          <div className="flex-1">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex-1 flex items-center justify-end space-x-0 lg:space-x-4 ">
            <div className="block">
              <CategoriesPopUp />
            </div>
            <div className="hidden lg:block">
              <ModeToggle className="h-5 w-5" />
            </div>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <CartItemsCount />
                <span className="sr-only">عربة التسوق</span>
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <MobileMenuToggle />
          </div>
        </div>

        <div className="flex-1  w-full hidden mt-4 pt-2 ">
          {/* Navigation */}
          <nav className="hidden md:flex items-center justify-center space-x-8">
            <Link href="/">الرئيسية</Link>
            <Link
              href="/order"
              className="text-sm font-medium hover:text-primary"
            >
              الطلبات
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium hover:text-primary"
            >
              المنتجات
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
      </div>
    </header>
  );
}
