"use client";

import { useState, ReactNode } from "react";
import { LeadsTable } from "./leads-table";
import { LeadInteractions } from "./lead-interactions";
import { BulkActionsBar } from "./bulk-actions-bar";
import { PaginationControls } from "@/components/shared/pagination-controls";

type Lead = {
  id: string;
  company_id: string;
  campaign_status: string | null;
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
  } | null;
  primary_contact: {
    full_name: string;
    job_title: string | null;
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
};

export function CampaignLeadsSection({
  campaignId,
  linkedCompanies,
  linkedCompaniesTotal,
  linkedCompaniesPageSize,
  currentPage,
  availableCompanies
}: CampaignLeadsSectionProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleToggleLead = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

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
        onClearLead={() => setSelectedLead(null)}
      />

      <div className="overflow-visible">
        {linkedCompanies.length === 0 ? (
          <div className="py-12 text-center text-slate-500">No leads linked yet.</div>
        ) : (
          <div className="flex flex-col gap-4">
            <LeadsTable 
              leads={linkedCompanies} 
              onSelectLead={setSelectedLead}
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
