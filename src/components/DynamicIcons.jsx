"use client";

import { DynamicIcon } from "lucide-react/dynamic";

export default function DynamicIcons({ icon, color, size = 24 }) {
  return (
    <div className="flex items-center gap-2">
      <DynamicIcon name={icon} color={color} size={size} />
    </div>
  );
}
