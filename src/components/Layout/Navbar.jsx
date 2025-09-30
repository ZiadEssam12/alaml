import React from "react";
import { ModeToggle } from "../Theme";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { MobileMenuToggle } from "./mobile-menu";
import CategoriesPopUp from "../CategoriesPopUp";
import CartItemsCount from "./CartItemsCound";
import UserProfileDropdown from "./UserProfileDropdown";
import SearchBar from "../searchbar/searchBar";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-lg  shadow">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-1">
            <Link href="/" className="w-fit flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  م
                </span>
              </div>
              <span className="text-xl font-bold hidden lg:block">
                مكتبة الأمل
              </span>
            </Link>
          </div>

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
            {/* User Profile Dropdown */}
            <UserProfileDropdown />
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
      </div>
    </header>
  );
}
