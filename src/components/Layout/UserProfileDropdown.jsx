"use client";
import React from "react";
import Link from "next/link";
import { useSession, signOut, signIn } from "next-auth/react";
import { User, LogOut, ShoppingCart, List, Box, UserPlus } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

export default function UserProfileDropdown() {
  const { data: session, status } = useSession();
  const [open, setOpen] = React.useState(false);

  const handleToggle = () => setOpen((prev) => !prev);
  const handleLogout = () => signOut();
  const handleLogin = () => signIn();

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <User className="h-5 w-5" />
        <span className="sr-only">الحساب الشخصي</span>
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-card rounded-xl shadow-lg border z-50">
          {status === "authenticated" ? (
            <div className="py-2">
              <div className="px-4 py-2 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-semibold">
                  {session.user.name || "المستخدم"}
                </span>
              </div>
              <Separator className="my-2" />
              <Link
                href="/cart"
                className="px-4 py-2 hover:bg-muted transition-colors flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                عربة التسوق
              </Link>
              <Link
                href="/order"
                className="px-4 py-2 hover:bg-muted transition-colors flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                الطلبات
              </Link>
              <Link
                href="/custom-order"
                className="px-4 py-2 hover:bg-muted transition-colors flex items-center gap-2"
              >
                <Box className="h-4 w-4" />
                اطلب منتجك
              </Link>
              <Separator className="my-2" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400 font-medium rounded-b-xl"
              >
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <div className="py-2 px-4">
              <button
                onClick={handleLogin}
                className="w-full flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors justify-center"
              >
                <UserPlus className="h-4 w-4" />
                تسجيل الدخول
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
