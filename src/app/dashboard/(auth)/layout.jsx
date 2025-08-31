import { AppSidebar } from "@/components/dashbaord/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

export default function layout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <main>{children}</main>
    </SidebarProvider>
  );
}
