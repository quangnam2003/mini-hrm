"use client";
import React, { useEffect } from "react";
import { SidebarInset, SidebarProvider } from "./ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import Header from "./Header";
import { useSidebarControl } from "@/hooks/use-sidebar";
import { toast } from "sonner";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isPinned, setIsPinned } = useSidebarControl();

  useEffect(() => {
    const showLoginToast = sessionStorage.getItem("showLoginSuccessToast");
    if (showLoginToast === "true") {
      sessionStorage.removeItem("showLoginSuccessToast");
      // Small delay to ensure page is fully rendered
      requestAnimationFrame(() => {
        toast.success("Đăng nhập thành công!");
      });
    }
  }, []);


  return (
    <SidebarProvider
      open={isPinned}
      onOpenChange={setIsPinned}
      style={
        {
          "--sidebar-width": isPinned ? "290px" : "80px",
          "--sidebar-width-icon": "80px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />

      <SidebarInset className="min-w-0 flex flex-col h-screen overflow-hidden bg-page text-base">
        <Header />
        <main className="w-full flex-1 min-w-0 p-4 md:p-6 lg:p-8 overflow-y-auto scroll-smooth">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
