"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  userEmail?: string | null;
};

import { SidebarProvider } from "./sidebar-context";

export function AppShell({ children, userEmail }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#f7f7f5] text-slate-900">
        <div className={cn(
          "min-h-screen transition-all duration-300 ease-in-out",
          isSidebarOpen ? "lg:pl-64" : "lg:pl-0"
        )}>
          <Sidebar 
            isOpen={isSidebarOpen} 
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
            userEmail={userEmail}
          />
          <div className="flex min-h-screen flex-1 flex-col">
            <Topbar 
              userEmail={userEmail} 
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <main className="flex-1 px-3 py-4 sm:px-4 lg:px-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
