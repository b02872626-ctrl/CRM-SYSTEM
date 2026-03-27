"use client";

import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

type TopbarProps = {
  userEmail?: string | null;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export function Topbar({ isSidebarOpen, onToggleSidebar }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 h-14 border-b border-white/5 bg-[#1a1a1a]/80 backdrop-blur-md transition-all duration-300">
      <div className="flex h-full items-center px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center justify-between">
          <div />
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
            Internal CRM
          </div>
        </div>
      </div>
    </header>
  );
}
