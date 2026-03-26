"use client";

import { useState, ReactNode } from "react";
import { Users, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

type CampaignTabControllerProps = {
  leadsSection: ReactNode;
  aboutSection: ReactNode;
  defaultTab?: "about" | "leads";
};

export function CampaignTabController({ 
  leadsSection, 
  aboutSection, 
  defaultTab = "leads" 
}: CampaignTabControllerProps) {
  const [activeTab, setActiveTab] = useState<"about" | "leads">(defaultTab);

  return (
    <div className="w-full">
      <div className="mb-6 flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("leads")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-all",
            activeTab === "leads"
              ? "border-slate-950 text-slate-950"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          <Users className="h-4 w-4" />
          Leads
        </button>
        <button
          onClick={() => setActiveTab("about")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-all",
            activeTab === "about"
              ? "border-slate-950 text-slate-950"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          About the Campaign
        </button>
      </div>

      <div className="w-full">
        {activeTab === "leads" ? leadsSection : aboutSection}
      </div>
    </div>
  );
}
