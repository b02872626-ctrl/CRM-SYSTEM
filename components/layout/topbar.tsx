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
    <header className="sticky top-0 z-20 h-14 border-b border-slate-200 bg-[#f7f7f5]/80 backdrop-blur-md transition-all duration-300">
      <div className="flex h-full items-center px-4 sm:px-6 lg:px-8">
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="mr-4 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all animate-in fade-in slide-in-from-left-4 duration-300"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex flex-1 items-center justify-between">
          {/* Topbar is now minimal, but can hold secondary actions here */}
          <div />
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Internal CRM
          </div>
        </div>
      </div>
    </header>
  );
}
