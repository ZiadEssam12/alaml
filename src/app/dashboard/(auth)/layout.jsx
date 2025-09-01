import { AppSidebar } from "@/components/dashbaord/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";

export default function layout({ children }) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <main className="w-full">{children}</main>
      </SidebarProvider>
    </SessionProvider>
  );
}
