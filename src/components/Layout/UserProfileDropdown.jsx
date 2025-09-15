"use client";
import React from "react";
import Link from "next/link";
import { useSession, signOut, signIn } from "next-auth/react";
import { User, LogOut, ShoppingCart, List, Box, UserPlus } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

export default function UserProfileDropdown() {
  const { data: session, status } = useSession();
  const [open, setOpen] = React.useState(false);

  const handleToggle = () => setOpen((prev) => !prev);
  const handleLogout = () => signOut();
  const handleLogin = () => signIn();

  if (status === "loading") {
    return <Skeleton className="w-5 h-5" />;
  }

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed top-0 left-0 right-0 w-full h-screen bg-black opacity-10 -z-[1] p-0 m-0"></div>
      )}
      <div
        className="relative inline-block z-50"
        onMouseLeave={() => setOpen(false)}
      >
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
          <div className="absolute inset-0 translate-y-full" />
        </Button>
        {open && (
          <div className="absolute right-0 translate-x-1/2 mt-2 w-56 bg-white dark:bg-card rounded-xl shadow-lg border z-50">
            {/* Hidden top padding for dropdown */}
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
    </>
  );
}
