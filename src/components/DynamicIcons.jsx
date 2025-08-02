import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

const handleJStext = (text) => {
  let newText = text.split("-");
  newText = newText.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return newText.join("");
};

export default function DynamicIcons({ icon }) {
  const LucideIcon = ({ iconName, ...props }) => {
    const [Icon, setIcon] = useState(null);
    icon = handleJStext(icon);

    useEffect(() => {
      let isMounted = true;
      import("lucide-react").then((mod) => {
        if (isMounted && mod[icon]) setIcon(() => mod[icon]);
      });
      return () => {
        isMounted = false;
      };
    }, [icon]);

    if (!Icon) return <Skeleton className="h-6 w-6" />;
    return <Icon {...props} />;
  };

  return (
    <div className="flex items-center gap-2">
      <LucideIcon iconName={icon} size={24} />
      <span>{handleJStext(icon)}</span>
    </div>
  );
}
