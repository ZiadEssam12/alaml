"use client";

import { DynamicIcon } from "lucide-react/dynamic";
import { useState, useEffect } from "react";
import { Skeleton } from "./ui/skeleton";

export default function DynamicIcons({ icon, color, size = 24 }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay for icon rendering
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [icon]);

  return (
    <div
      className="flex items-center justify-center gap-2 relative"
      style={{
        width: size,
        height: size,
      }}
    >
      <Skeleton
        className={`absolute w-full h-full rounded-full transition-opacity duration-300 ${
          isLoading ? "opacity-100" : "opacity-0 absolute pointer-events-none"
        }`}
      />
      <DynamicIcon
        name={icon}
        color={color}
        size={size}
        className={`transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
  