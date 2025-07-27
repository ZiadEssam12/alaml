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

export default function CategoriesPopUp() {
  return (
    <div className="relative inline-block group z-20">
      {/* Trigger */}
      <div className="flex items-center gap-1 cursor-pointer z-30">
        <p>تصفح الأقسام</p>
        <span>
          <ChevronDown className="h-4 w-4 inline-block ml-1 transition-transform duration-200 group-hover:rotate-180" />
        </span>
      </div>

      {/* Overlay */}
      <div className="hidden group-hover:block group-hover:opacity-10 fixed inset-0 bg-black  z-10"></div>

      {/* Dropdown */}
      <div className="hidden group-hover:block absolute py-2 z-30 mt-2 bg-white rounded shadow-lg min-w-[180px]">
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
    </div>
  );
}
