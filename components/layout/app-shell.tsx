import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

type AppShellProps = {
  children: ReactNode;
  userEmail?: string | null;
};

export function AppShell({ children, userEmail }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f7f5] text-slate-900">
      <div className="min-h-screen lg:pl-60">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar userEmail={userEmail} />
          <main className="flex-1 px-3 py-2 sm:px-4 lg:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
