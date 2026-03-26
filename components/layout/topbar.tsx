"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { getNavigationItem, navigationItems } from "@/lib/navigation";

type TopbarProps = {
  userEmail?: string | null;
};

export function Topbar({ userEmail }: TopbarProps) {
  const pathname = usePathname();
  const currentItem = getNavigationItem(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-[#f7f7f5]/95 backdrop-blur">
      <div className="flex flex-col gap-2 px-3 py-2 sm:px-4 lg:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">Workspace</p>
            <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950">{currentItem.title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm text-slate-700 sm:flex">
              {userEmail ?? "Admin User"}
            </div>
            <LogoutButton />
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex h-8 w-full max-w-sm items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-500">
            <Search className="h-4 w-4" />
            <span>Search placeholder</span>
          </label>
          <nav className="flex gap-1.5 overflow-x-auto lg:hidden">
            {navigationItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    isActive
                      ? "rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm font-medium text-slate-950"
                      : "rounded-md border border-transparent px-2.5 py-1 text-sm font-medium text-slate-600"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
