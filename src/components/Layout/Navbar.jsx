import React from "react";
import { ModeToggle } from "../Theme";
import Link from "next/link";

export default function Navbar() {
  return (
    <div className="fixed top-0 right-0  w-screen bg-white dark:bg-slate-800 shadow-md z-50">
      <div className="container h-[60px] flex items-center justify-between">
        <div className="text-lg font-semibold">مكتبة الأمل</div>
        <nav className="space-x-4 flex items-center gap-2">
          <Link href="/products" className="text-gray-800 dark:text-gray-200 ">
            المنتجات
          </Link>
          <Link href="/categories" className="text-gray-800 dark:text-gray-200">
            التصنيفات
          </Link>
        </nav>

        <div>
          {/* cart */}

          {/* Theme */}
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
