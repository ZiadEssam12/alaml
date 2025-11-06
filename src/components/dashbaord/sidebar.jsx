import {
  Calendar,
  Home,
  Inbox,
  LogOut,
  Package,
  Users,
  MessageSquare,
  ShoppingCart,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { signOut } from "@/auth/auth";

const items = [
  {
    title: "الرئيسية",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "المستخدمين",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "الطلبات",
    url: "/dashboard/orders",
    icon: Inbox,
  },
  {
    title: "الطلبات المخصصة",
    url: "/dashboard/custom-orders",
    icon: ShoppingCart,
  },
  {
    title: "التنصيفات",
    url: "/dashboard/categories",
    icon: Inbox,
  },
  {
    title: "المنتجات",
    url: "/dashboard/products",
    icon: Calendar,
  },
  {
    title: "الكوبونات",
    url: "/dashboard/coupons",
    icon: Package,
  },
  {
    title: "التقييمات",
    url: "/dashboard/reviews",
    icon: MessageSquare,
  },
];

export function AppSidebar() {
  return (
    <Sidebar side="right">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>لوحة التحكم</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton variant="outline" size="lg" asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button className="cursor-pointer flex items-center justify-center text-white rounded-lg gap-2 w-full bg-red-500 p-2">
            <LogOut />
            <span>تسجيل الخروج</span>
          </button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
