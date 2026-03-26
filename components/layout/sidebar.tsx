"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigationItems } from "@/lib/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { ChevronLeft, ChevronRight, Settings, User, ExternalLink } from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
  userEmail?: string | null;
};

import { useSidebarContext } from "./sidebar-context";

export function Sidebar({ isOpen, onToggle, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const { title } = useSidebarContext();

  const isCampaignPage = pathname.startsWith("/campaigns/") && pathname.split("/").length > 2;
  const campaignId = isCampaignPage ? pathname.split("/")[2] : null;

  // Simple Breadcrumbs logic
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    let label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    
    // If it's a campaign detail page and this is the UUID segment, use the context title
    if (index === 2 && pathSegments[0] === "campaigns" && title) {
      label = title;
    }
    
    return { href, label };
  });

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-slate-200 bg-[#fbfbfa] transition-all duration-300 ease-in-out lg:top-0",
        isOpen ? "w-64" : "w-0 -translate-x-full lg:w-16 lg:translate-x-0"
      )}
    >
      <div className={cn(
        "flex h-full flex-col overflow-hidden px-3 py-4 pt-14",
        !isOpen && "lg:items-center lg:px-2"
      )}>
        {/* Account Section */}
        <div className={cn(
          "mb-6 flex flex-col gap-2 rounded-xl bg-slate-100/50 p-2.5 transition-all duration-300",
          !isOpen && "lg:p-1.5"
        )}>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-sm">
              <User className="h-4 w-4" />
            </div>
            {isOpen && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-900">
                  {userEmail?.split("@")[0] ?? "Admin User"}
                </p>
                <p className="truncate text-[10px] text-slate-500">{userEmail ?? "admin@afriwork.io"}</p>
              </div>
            )}
          </div>
          {isOpen && (
            <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
              <LogoutButton />
            </div>
          )}
        </div>

        {/* Directory Navigation (Breadcrumbs) - Tree structure */}
        {isOpen && breadcrumbs.length > 0 && (
          <div className="mb-6 px-1">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Navigation</p>
            <div className="flex flex-col text-[11px] font-medium text-slate-500">
              <Link href="/dashboard" className="flex items-center gap-2 py-1 hover:text-blue-600 transition-colors">
                <span className="text-slate-300">○</span>
                <span>Home</span>
              </Link>
              {breadcrumbs.map((bc, i) => (
                <div 
                  key={bc.href} 
                  className="flex flex-col"
                  style={{ paddingLeft: `${(i + 1) * 12}px` }}
                >
                  <Link 
                    href={bc.href} 
                    className={cn(
                      "flex items-center gap-2 py-1 transition-colors hover:text-blue-600", 
                      i === breadcrumbs.length - 1 ? "text-slate-900 font-bold" : "text-slate-500"
                    )}
                  >
                    <span className="text-slate-300">└</span>
                    <span className="truncate">{bc.label}</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="flex-1 space-y-4">
          <div>
            {isOpen && <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Main Menu</p>}
            <nav className="space-y-0.5">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!isOpen ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-600 hover:bg-white hover:text-slate-950"
                    )}
                  >
                    <span className={cn(
                      "h-1 w-1 shrink-0 rounded-full",
                      isActive ? "bg-blue-600" : "bg-slate-300"
                    )} />
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Contextual Actions (Edit Campaign) */}
          {isOpen && isCampaignPage && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-500 mt-6 pt-4 border-t border-slate-100">
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Campaign Actions</p>
              <Link
                href={`/campaigns/${campaignId}/edit`}
                className="group flex items-center gap-2 px-1 py-1 text-sm font-bold text-slate-900 transition-all"
              >
                <span className="underline decoration-2 underline-offset-4 decoration-slate-300 group-hover:decoration-blue-600 transition-colors">Edit Campaign</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar Footer / Collapse Toggle */}
        <div className="mt-8 border-t border-slate-200 pt-4">
          <button
            onClick={onToggle}
            className={cn(
              "flex w-full items-center justify-center rounded-lg bg-slate-100 py-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700",
              !isOpen && "lg:px-0"
            )}
          >
            {isOpen ? (
              <div className="flex items-center gap-2 text-xs font-semibold">
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </div>
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
