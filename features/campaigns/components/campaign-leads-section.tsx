"use client";

import { useState, ReactNode } from "react";
import { LeadsTable } from "./leads-table";
import { LeadInteractions } from "./lead-interactions";
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

  return (
    <div className="space-y-6">
      <LeadInteractions 
        campaignId={campaignId}
        availableCompanies={availableCompanies}
        selectedLead={selectedLead}
        onClearLead={() => setSelectedLead(null)}
      />

      <div className="border border-slate-200 bg-white shadow-sm overflow-hidden">
        {linkedCompanies.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">No leads linked yet.</div>
        ) : (
          <>
            <LeadsTable leads={linkedCompanies} onSelectLead={setSelectedLead} />
            <PaginationControls
              basePath={`/campaigns/${campaignId}`}
              page={currentPage}
              pageSize={linkedCompaniesPageSize}
              totalCount={linkedCompaniesTotal}
            />
          </>
        )}
      </div>
    </div>
  );
}
