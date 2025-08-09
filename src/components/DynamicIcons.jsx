"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import toast from "react-hot-toast";

export default function DynamicIcons({ icon, color, size = 24 }) {
  const handleJStext = (text) => {
    let newText = text.split("-");
    newText = newText.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    );
    return newText.join("");
  };

  const LucideIcon = ({ iconName, ...props }) => {
    const [Icon, setIcon] = useState(null);
    icon = handleJStext(icon);

    useEffect(() => {
      let isMounted = true;
      try {
        import("lucide-react").then((mod) => {
          if (isMounted && mod[icon]) setIcon(() => mod[icon]);
        });
      } catch (error) {
        toast.error("خطأ في تحميل الايقونة");
      }

      return () => {
        isMounted = false;
      };
    }, [icon]);

    if (!Icon) return <Skeleton className="h-6 w-6" />;
    return <Icon {...props} color={color} />;
  };

  return (
    <div className="flex items-center gap-2">
      <LucideIcon iconName={icon} color={color} size={size} />
    </div>
  );
}
