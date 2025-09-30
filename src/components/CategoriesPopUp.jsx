"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DynamicIcons from "./DynamicIcons";

export default function CategoriesPopUp({ title, data, children }) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const pathName = usePathname();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const getCategories = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/categories`);
      const categoriesList = await res.json();
      setCategories(categoriesList.data);
    };

    getCategories();
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathName]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
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

  useEffect(() => {
    const handleScroll = () => {
      if (open) {
        setOpen(false);
      }
    };

    if (open) {
      window.addEventListener("scroll", handleScroll, true);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleClose = () => setOpen(false);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed top-0 left-0 right-0 w-full h-screen bg-black/30 z-40 p-0 m-0"
          onClick={handleClose}
          aria-hidden="true"
        ></div>
      )}

      <div
        ref={dropdownRef}
        className="relative inline-block z-50 bg-background/65 rounded-full py-3 px-3"
      >
        {open && (
          <div className="absolute h-10 right-0 left-0 -bottom-4 w-full rounded-md bg-transparent" />
        )}
        {/* Trigger */}
        <div
          className="flex items-center gap-1 cursor-pointer relative z-30 selection:bg-transparent"
          onClick={() => setOpen(!open)}
        >
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
          <div className="absolute right-0 h-fit max-h-[300px] overflow-auto py-2 mt-4 z-30 bg-background rounded shadow-lg min-w-[180px]">
            {categories.map((category) => {
              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.seoTitle}`}
                  className="flex items-center gap-2 p-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  <DynamicIcons icon={category.icon} />
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
