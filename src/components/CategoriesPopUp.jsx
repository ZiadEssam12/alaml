"use client";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DynamicIcons from "./DynamicIcons";

export default function CategoriesPopUp({ title, data, children }) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const pathName = usePathname();

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

  const handleClose = () => setOpen(false);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed top-0 left-0 right-0 w-screen h-screen bg-black opacity-10 -z-[1] p-0 m-0"></div>
      )}

      <div
        className="relative inline-block z-50 bg-background rounded py-3 px-3"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={handleClose}
      >
        {open && (
          <div className="absolute h-10 right-0 left-0 -bottom-4 w-full rounded-md bg-transparent" />
        )}
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
