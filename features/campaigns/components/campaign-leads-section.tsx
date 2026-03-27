"use client";

import { useState, ReactNode, useEffect, useRef } from "react";
import { LeadsTable } from "./leads-table";
import { LeadInteractions } from "./lead-interactions";
import { BulkActionsBar } from "./bulk-actions-bar";
import { PaginationControls } from "@/components/shared/pagination-controls";

type Lead = {
  id: string;
  company_id: string;
  campaign_status: string | null;
  interest_level: string | null;
  added_at: string | null;
  notes: string | null;
  company: {
    id: string;
    name: string;
    industry: string | null;
    company_size: string | null;
    location: string | null;
    source: string | null;
    priority: string | null;
    status: string;
    website: string | null;
    notes: string | null;
    hiring_signal: string | null;
    contacts: Array<{
      id: string;
      full_name: string;
      role_title: string | null;
      email: string | null;
      phone: string | null;
    }>;
  } | null;
  primary_contact: {
    full_name: string;
    role_title: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  deal_count: number;
};

type CampaignLeadsSectionProps = {
  campaignId: string;
  linkedCompanies: Lead[];
  linkedCompaniesTotal: number;
  linkedCompaniesPageSize: number;
  currentPage: number;
  availableCompanies: Array<{
    id: string;
    name: string;
    industry: string | null;
  }>;
  searchQuery?: string;
};

export function CampaignLeadsSection({
  campaignId,
  linkedCompanies,
  linkedCompaniesTotal,
  linkedCompaniesPageSize,
  currentPage,
  availableCompanies,
  searchQuery
}: CampaignLeadsSectionProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const confirmClose = () => {
    if (hasUnsavedChanges) {
      return window.confirm("Save before closing?");
    }
    return true;
  };

  const handleToggleLead = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!selectedLead) return;

      const target = event.target as HTMLElement;
      
      // Check if click is inside the detail panel
      const isInsidePanel = target.closest('.crm-lead-panel');
      if (isInsidePanel) return;

      // Check if click is on another lead row (let the row's onClick handle it)
      const isLeadRow = target.closest('[data-lead-row]');
      if (isLeadRow) return;

      // Clicked outside and not on a lead row - close the panel
      if (confirmClose()) {
        setSelectedLead(null);
        setHasUnsavedChanges(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedLead, hasUnsavedChanges]);

  const handleSelectAll = (ids: string[]) => {
    if (ids.length === 0) {
      // If passing empty array, clear only the ones currently visible to avoid clearing everything across pages
      // Actually, standard behavior is to clear the current selection.
      setSelectedIds(new Set());
    } else {
      const newSelected = new Set(selectedIds);
      ids.forEach(id => newSelected.add(id));
      setSelectedIds(newSelected);
    }
  };

  const selectedLeads = linkedCompanies.filter(l => selectedIds.has(l.company_id));

  return (
    <div className="space-y-6 relative">
      <LeadInteractions 
        campaignId={campaignId}
        availableCompanies={availableCompanies}
        selectedLead={selectedLead}
        onClearLead={() => {
          if (confirmClose()) {
            setSelectedLead(null);
            setHasUnsavedChanges(false);
          }
        }}
        setHasUnsavedChanges={setHasUnsavedChanges}
      />

      <div className="flex items-center justify-between gap-4">
        <form className="w-full max-w-xs flex items-center gap-2">
          <div className="relative flex-1 group">
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search leads..."
              className="crm-input h-8 w-full pl-8 text-[13px] bg-white/[0.02] border-white/5 focus:bg-white/[0.04]"
            />
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#2383E2] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            {searchQuery && (
              <a 
                href={`/campaigns/${campaignId}`} 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                title="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </a>
            )}
          </div>
          <button type="submit" className="h-8 px-3 text-[12px] font-bold rounded-[4px] bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]">
            Search
          </button>
        </form>
      </div>

      <div className="overflow-visible">
        {linkedCompanies.length === 0 ? (
          <div className="py-12 text-center text-slate-500">No leads linked yet.</div>
        ) : (
          <div className="flex flex-col gap-4">
            <LeadsTable 
              leads={linkedCompanies} 
              campaignId={campaignId}
              onSelectLead={(lead) => {
                if (confirmClose()) {
                  setSelectedLead(lead);
                  setHasUnsavedChanges(false);
                }
              }}
              selectedIds={selectedIds}
              onToggleLead={handleToggleLead}
              onSelectAll={handleSelectAll}
            />
            <div className="mt-2">
              <PaginationControls
                basePath={`/campaigns/${campaignId}`}
                page={currentPage}
                pageSize={linkedCompaniesPageSize}
                totalCount={linkedCompaniesTotal}
                searchParams={{ search: searchQuery }}
              />
            </div>
          </div>
        )}
      </div>

      <BulkActionsBar 
        campaignId={campaignId}
        selectedLeads={selectedLeads}
        onClearSelection={() => setSelectedIds(new Set())}
      />
    </div>
  );
}
