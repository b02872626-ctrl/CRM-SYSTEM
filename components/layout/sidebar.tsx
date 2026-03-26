"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigationItems } from "@/lib/navigation";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-slate-200 bg-[#fbfbfa] lg:block">
      <div className="flex h-full flex-col px-3 py-3">
        <div className="mb-4 border-b border-slate-200 pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Afriwork BPO
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-900">Internal CRM</h2>
        </div>

        <nav className="space-y-0.5">
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center border-l-2 px-2.5 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-slate-900 bg-white text-slate-950"
                    : "border-transparent text-slate-700 hover:bg-white hover:text-slate-950"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
