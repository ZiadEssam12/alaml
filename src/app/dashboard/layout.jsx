import { AppSidebar } from "@/components/dashbaord/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

export default function layout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <main className="my-10 w-full px-10">{children}</main>
    </SidebarProvider>
  );
}
