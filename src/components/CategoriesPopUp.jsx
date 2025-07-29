"use client";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Pencil,
  Scissors,
  Calculator,
  PaintBucket,
  Ruler,
  Paperclip,
  FileText,
  Briefcase,
  Palette,
  ChevronDown,
} from "lucide-react";
import { categories } from "./Home/Categories";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CategoriesPopUp() {
  const [open, setOpen] = useState(false);
  const pathName = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathName]);

  const handleClose = () => setOpen(false);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed top-0 left-0 right-0 w-screen h-screen bg-black opacity-10 -z-[1] p-0 m-0"
          // Optionally, you can add onClick={handleClose} to close when clicking overlay
        ></div>
      )}

      <div
        className="relative inline-block z-50 bg-background rounded py-3 px-3"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={handleClose}
      >
        <div className="absolute h-10 right-0 left-0 -bottom-4 w-full rounded-md bg-transparent" />
        {/* Trigger */}
        <div className="flex items-center gap-1 cursor-pointer relative z-30 selection:bg-transparent">
          <p>
            <span className="hidden lg:block">تصفح الأقسام</span>
            <span className="block lg:hidden">الأقسام</span>
          </p>
          <span>
            <ChevronDown
              className={`h-4 w-4 inline-block ml-1 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </span>
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 h-[300px] overflow-auto py-2 mt-4 z-30 bg-background rounded shadow-lg min-w-[180px]">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.id}
                  href={category.href}
                  className="flex items-center gap-2 p-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  <IconComponent className="h-4 w-4" />
                  {category.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
