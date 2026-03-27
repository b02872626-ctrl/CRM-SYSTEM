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
  userRole?: string | null;
  userName?: string | null;
};

import { useSidebarContext } from "./sidebar-context";

export function Sidebar({ isOpen, onToggle, userEmail, userRole, userName }: SidebarProps) {
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
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-white/5 bg-[#1e1e1e] transition-all duration-300 ease-in-out lg:top-0",
        isOpen ? "w-64" : "w-0 -translate-x-full lg:w-16 lg:translate-x-0"
      )}
    >
      <div className={cn(
        "flex h-full flex-col overflow-hidden px-3 py-4 pt-14",
        !isOpen && "lg:items-center lg:px-2"
      )}>
        {/* Account Section */}
        <div className={cn(
          "mb-6 flex flex-col gap-2 rounded-md bg-white/5 p-2.5 transition-all duration-300 border border-white/5",
          !isOpen && "lg:p-1.5"
        )}>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-white/10 font-bold text-white/70 shadow-sm border border-white/5">
              <User className="h-4 w-4" />
            </div>
            {isOpen && (
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-xs font-semibold text-white/90">
                  {userEmail ?? "No Email"}
                </p>
                <p className="truncate text-[10px] uppercase tracking-wider text-white/30">
                  {userRole ?? "No Role"}
                </p>
              </div>
            )}
          </div>
          {isOpen && (
            <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2">
              <LogoutButton />
            </div>
          )}
        </div>

        {/* Directory Navigation (Breadcrumbs) - Tree structure */}
        {isOpen && breadcrumbs.length > 0 && (
          <div className="mb-6 px-1">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/20">Navigation</p>
            <div className="flex flex-col text-[11px] font-medium text-white/50">
              <Link href="/dashboard" className="flex items-center gap-2 py-1 hover:text-white transition-colors">
                <span className="text-white/10">□</span>
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
                      "flex items-center gap-2 py-1 transition-colors hover:text-white", 
                      i === breadcrumbs.length - 1 ? "text-white font-bold" : "text-white/50"
                    )}
                  >
                    <span className="text-white/10">└</span>
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
            {isOpen && <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-white/20">Main Menu</p>}
            <nav className="space-y-0.5">
              {navigationItems.filter(item => !item.allowedRoles || (userRole && item.allowedRoles.includes(userRole))).map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!isOpen ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-[1px] border transition-all duration-300",
                      isActive 
                        ? "border-white bg-white/10 shadow-[0_0_8px_rgba(255,255,255,0.3)]" 
                        : "border-white/10 bg-transparent"
                    )} />
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Contextual Actions (Edit Campaign) */}
          {isOpen && isCampaignPage && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-500 mt-6 pt-4 border-t border-white/5">
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-white/20">Campaign Actions</p>
              <Link
                href={`/campaigns/${campaignId}/edit`}
                className="group flex items-center gap-2 px-1 py-1 text-sm font-bold text-white transition-all"
              >
                <span className="underline decoration-2 underline-offset-4 decoration-white/10 group-hover:decoration-white/40 transition-colors">Edit Campaign</span>
                <ExternalLink className="h-3.5 w-3.5 text-white/20 group-hover:text-white/60 transition-colors" />
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar Footer / Collapse Toggle */}
        <div className="mt-8 border-t border-white/5 pt-4">
          <button
            onClick={onToggle}
            className={cn(
              "flex w-full items-center justify-center rounded-sm bg-white/5 py-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white/70",
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
