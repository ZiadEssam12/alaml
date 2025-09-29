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
  const dropdownRef = React.useRef(null);

  const handleToggle = () => setOpen((prev) => !prev);
  const handleLogout = () => signOut();
  const handleLogin = () => signIn();
  const closeDropdown = () => setOpen(false);

  // Handle click outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  // Handle scroll
  React.useEffect(() => {
    const handleScroll = () => {
      if (open) {
        closeDropdown();
      }
    };

    if (open) {
      window.addEventListener("scroll", handleScroll, true);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && open) {
        closeDropdown();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (status === "loading") {
    return <Skeleton className="w-5 h-5" />;
  }

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed top-0 left-0 right-0 w-full h-screen bg-black opacity-10 -z-[1] p-0 m-0"></div>
      )}

      <div ref={dropdownRef} className="relative inline-block z-50">
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
          <div className="absolute right-0 translate-x-1/2 mt-2 w-56 bg-white dark:bg-card rounded-xl shadow-lg border z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
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
                  onClick={closeDropdown}
                >
                  <ShoppingCart className="h-4 w-4" />
                  عربة التسوق
                </Link>
                <Link
                  href="/order"
                  className="px-4 py-2 hover:bg-muted transition-colors flex items-center gap-2"
                  onClick={closeDropdown}
                >
                  <List className="h-4 w-4" />
                  الطلبات
                </Link>
                <Link
                  href="/custom-order"
                  className="px-4 py-2 hover:bg-muted transition-colors flex items-center gap-2"
                  onClick={closeDropdown}
                >
                  <Box className="h-4 w-4" />
                  اطلب منتجك
                </Link>
                <Separator className="my-2" />
                <button
                  onClick={() => {
                    handleLogout();
                    closeDropdown();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400 font-medium rounded-b-xl"
                >
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <div className="py-2 px-4">
                <button
                  onClick={() => {
                    handleLogin();
                    closeDropdown();
                  }}
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
