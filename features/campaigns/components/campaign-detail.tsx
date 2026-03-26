"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Plus, Download, Upload, FileText, LayoutDashboard, Users, Search, Mail, Phone, MapPin, X, Building2, ExternalLink } from "lucide-react";
import { addCompaniesToCampaignAction, importCampaignLeadsAction, createCampaignLeadAction } from "@/features/campaigns/actions";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { LeadsTable } from "./leads-table";
import { cn } from "@/lib/utils";

type CampaignDetailProps = {
  campaign: {
    id: string;
    name: string;
    description: string | null;
    campaign_type: string | null;
    target_audience: string | null;
    status: string;
    owner_id: string | null;
    owner: { id: string; full_name: string; email: string | null } | null;
    start_date: string | null;
    end_date: string | null;
    notes: string | null;
  };
  linkedCompanies: Array<{
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
  }>;
  linkedCompaniesTotal: number;
  linkedCompaniesPageSize: number;
  currentPage: number;
  availableCompanies: Array<{
    id: string;
    name: string;
    industry: string | null;
    country: string | null;
  }>;
  metrics: {
    linkedCompanyCount: number;
    qualifiedCompanyCount: number;
    dealsCreatedCount: number;
  };
};

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function CampaignDetail({
  campaign,
  linkedCompanies,
  linkedCompaniesTotal,
  linkedCompaniesPageSize,
  currentPage,
  availableCompanies,
  metrics
}: CampaignDetailProps) {
  const [activeTab, setActiveTab] = useState<"about" | "leads">("leads");
  const [showAddLeadForm, setShowAddLeadForm] = useState(false);
  const [addMode, setAddMode] = useState<"manual" | "csv" | "existing">("manual");
  const [selectedLead, setSelectedLead] = useState<(typeof linkedCompanies)[0] | null>(null);
  const csvFormRef = useRef<HTMLFormElement>(null);

  const handleCsvChange = () => {
    if (csvFormRef.current) {
      csvFormRef.current.requestSubmit();
    }
  };

  return (
    <section className="crm-page">
      <div className="crm-page-header">
        <div>
          <p className="crm-page-kicker">Campaigns</p>
          <h2 className="crm-page-title">{campaign.name}</h2>
          <p className="crm-page-copy">
            {campaign.campaign_type ?? "No type"} | {campaign.target_audience ?? "No audience"} |{" "}
            {campaign.status}
          </p>
        </div>

        <Link href={`/campaigns/${campaign.id}/edit`} className="crm-secondary-button">
          Edit campaign
        </Link>
      </div>

      <div className="crm-stat-grid mb-8">
        <div className="crm-stat-card border-l-4 border-l-blue-500">
          <p className="text-sm font-medium text-slate-500">Leads (Linked)</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{metrics.linkedCompanyCount}</p>
        </div>
        <div className="crm-stat-card border-l-4 border-l-emerald-500">
          <p className="text-sm font-medium text-slate-500">Qualified leads</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{metrics.qualifiedCompanyCount}</p>
        </div>
        <div className="crm-stat-card border-l-4 border-l-indigo-500">
          <p className="text-sm font-medium text-slate-500">Deals generated</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{metrics.dealsCreatedCount}</p>
        </div>
      </div>

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

      {activeTab === "about" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Overview & Strategy</h3>
            <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Owner</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{campaign.owner?.full_name ?? "Unassigned"}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</dt>
                <dd className="mt-1">
                  <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    {campaign.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Start Date</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{formatDate(campaign.start_date)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">End Date</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{formatDate(campaign.end_date)}</dd>
              </div>
            </dl>

            <div className="mt-8 grid gap-8 border-t border-slate-100 pt-8 lg:grid-cols-2">
              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <FileText className="h-4 w-4 text-slate-400" />
                  Description
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {campaign.description ?? "No description added yet."}
                </p>
              </div>
              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Plus className="h-4 w-4 text-slate-400" />
                  Notes
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {campaign.notes ?? "No notes added yet."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "leads" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-950">Campaign Leads</h3>
            <button
              onClick={() => setShowAddLeadForm(!showAddLeadForm)}
              className="crm-primary-button flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {showAddLeadForm ? "Cancel" : "Add New Lead"}
            </button>
          </div>

          {showAddLeadForm && (
            <div className="border border-slate-200 bg-slate-50 p-6 shadow-inner">
              <div className="mb-6 flex gap-2">
                <button
                  onClick={() => setAddMode("manual")}
                  className={cn(
                    "rounded-md px-4 py-2 text-sm font-medium transition-all",
                    addMode === "manual"
                      ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                  )}
                >
                  Create New Lead
                </button>
                <button
                  onClick={() => setAddMode("csv")}
                  className={cn(
                    "rounded-md px-4 py-2 text-sm font-medium transition-all",
                    addMode === "csv"
                      ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                  )}
                >
                  Import CSV
                </button>
                <button
                  onClick={() => setAddMode("existing")}
                  className={cn(
                    "rounded-md px-4 py-2 text-sm font-medium transition-all",
                    addMode === "existing"
                      ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                  )}
                >
                  Link Existing
                </button>
              </div>

              {addMode === "manual" && (
                <form action={createCampaignLeadAction} className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                  <input type="hidden" name="campaign_id" value={campaign.id} />
                  
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Company Information</h4>
                    <div className="crm-field">
                      <label htmlFor="company_name" className="crm-label">Company Name *</label>
                      <input id="company_name" name="company_name" required className="crm-input" placeholder="e.g. Acme Corp" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="crm-field">
                        <label htmlFor="industry" className="crm-label">Industry</label>
                        <input id="industry" name="industry" className="crm-input" placeholder="e.g. Technology" />
                      </div>
                      <div className="crm-field">
                        <label htmlFor="country" className="crm-label">Country</label>
                        <input id="country" name="country" className="crm-input" placeholder="e.g. Kenya" />
                      </div>
                    </div>
                    <div className="crm-field">
                      <label htmlFor="location" className="crm-label">Specific Location / City</label>
                      <input id="location" name="location" className="crm-input" placeholder="e.g. Nairobi, Kilimani" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Lead Contact (Optional)</h4>
                    <div className="crm-field">
                      <label htmlFor="contact_full_name" className="crm-label">Contact Name</label>
                      <input id="contact_full_name" name="contact_full_name" className="crm-input" placeholder="Full name" />
                    </div>
                    <div className="crm-field">
                      <label htmlFor="contact_email" className="crm-label">Contact Email</label>
                      <input id="contact_email" name="contact_email" type="email" className="crm-input" placeholder="email@example.com" />
                    </div>
                    
                    <div className="pt-2">
                      <div className="crm-field">
                        <label htmlFor="campaign_status" className="crm-label">Initial Lead Status</label>
                        <input id="campaign_status" name="campaign_status" defaultValue="Added" className="crm-input" />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 border-t border-slate-200 pt-4 flex items-center justify-between gap-4">
                    <p className="text-xs text-slate-500 italic">* Required fields</p>
                    <button type="submit" className="crm-primary-button px-8">
                      Create and Link Lead
                    </button>
                  </div>
                </form>
              )}

              {addMode === "csv" && (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                    <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                      <Upload className="h-6 w-6 text-blue-500" />
                    </div>
                    <h4 className="text-base font-semibold text-slate-950 mb-2">Upload CSV File</h4>
                    <p className="text-sm text-slate-600 mb-6">
                      Select a CSV file to bulk import companies and contacts.
                    </p>
                    
                    <form action={importCampaignLeadsAction} ref={csvFormRef} className="space-y-4">
                      <input type="hidden" name="campaign_id" value={campaign.id} />
                      <div className="relative group cursor-pointer">
                        <input
                          id="csv_file"
                          name="csv_file"
                          type="file"
                          accept=".csv,text/csv"
                          onChange={handleCsvChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="border-2 border-dashed border-slate-200 rounded-lg py-12 px-4 group-hover:border-blue-400 group-hover:bg-blue-50/30 transition-all text-center">
                          <p className="text-sm font-medium text-slate-700">Click to choose or drag & drop</p>
                          <p className="text-xs text-slate-400 mt-1">.csv files only</p>
                        </div>
                      </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                      <Link
                        href="/templates/campaign-leads-template.csv"
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
                      >
                        <Download className="h-3 w-3" />
                        Download Template
                      </Link>
                      <span className="text-slate-400">Quick and easy import</span>
                    </div>
                  </div>
                </div>
              )}

              {addMode === "existing" && (
                <form action={addCompaniesToCampaignAction} className="grid gap-6 sm:grid-cols-2">
                  <input type="hidden" name="campaign_id" value={campaign.id} />
                  <div className="space-y-4">
                    <div className="crm-field">
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="company_ids" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Select Companies
                        </label>
                        <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-bold">{availableCompanies.length} available</span>
                      </div>
                      <select
                        id="company_ids"
                        name="company_ids"
                        multiple
                        size={8}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                      >
                        {availableCompanies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.name}
                            {company.industry ? ` (${company.industry})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col justify-end space-y-4">
                    <div className="crm-field">
                      <label htmlFor="campaign_status" className="crm-label">Link Status</label>
                      <input id="campaign_status" name="campaign_status" defaultValue="Added" className="crm-input" />
                    </div>
                    <div className="crm-field">
                      <label htmlFor="notes" className="crm-label">Initial Notes</label>
                      <textarea id="notes" name="notes" rows={2} className="crm-input" placeholder="Context for these links" />
                    </div>
                    <button type="submit" className="crm-primary-button w-full">
                      Link Selected Companies
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h4 className="text-sm font-semibold text-slate-900">Total Leads: {metrics.linkedCompanyCount}</h4>
              <div className="flex items-center bg-white border border-slate-200 rounded-md px-3 py-1.5">
                <Search className="h-3.5 w-3.5 text-slate-400 mr-2" />
                <input placeholder="Search leads..." className="text-xs outline-none bg-transparent w-40" />
              </div>
            </div>

            {linkedCompanies.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm text-slate-500">No leads linked to this campaign yet.</p>
                <button 
                  onClick={() => setShowAddLeadForm(true)}
                  className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
                >
                  Create your first lead
                </button>
              </div>
            ) : (
              <LeadsTable leads={linkedCompanies} onSelectLead={setSelectedLead} />
            )}
            
            {linkedCompanies.length > 0 && (
              <PaginationControls
                basePath={`/campaigns/${campaign.id}`}
                page={currentPage}
                pageSize={linkedCompaniesPageSize}
                totalCount={linkedCompaniesTotal}
              />
            )}
          </div>
        </div>
      )}

      {/* Lead Detail Slide-Over */}
      {selectedLead && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setSelectedLead(null)}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <Building2 className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-950">
                    {selectedLead.company?.name ?? "Unknown Company"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedLead.company?.industry ?? "No industry"} · {selectedLead.company?.status}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/companies/${selectedLead.company?.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Full profile
                </a>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="ml-2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Company Details */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Company Details</p>
                <dl className="grid grid-cols-2 gap-3">
                  {selectedLead.company?.location && (
                    <div>
                      <dt className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> Location</dt>
                      <dd className="mt-0.5 text-sm font-medium text-slate-800">{selectedLead.company.location}</dd>
                    </div>
                  )}
                  {selectedLead.company?.company_size && (
                    <div>
                      <dt className="text-xs text-slate-400 flex items-center gap-1"><Users className="h-3 w-3" /> Size</dt>
                      <dd className="mt-0.5 text-sm font-medium text-slate-800">{selectedLead.company.company_size}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs text-slate-400">Campaign Status</dt>
                    <dd className="mt-0.5">
                      <span className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                        selectedLead.campaign_status === "Won" ? "bg-emerald-50 text-emerald-700" :
                        selectedLead.campaign_status === "Lost" ? "bg-rose-50 text-rose-700" :
                        "bg-slate-100 text-slate-700"
                      )}>
                        {selectedLead.campaign_status ?? "Added"}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">Deals</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-slate-800">{selectedLead.deal_count}</dd>
                  </div>
                </dl>
                {selectedLead.notes && (
                  <div className="mt-4 rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400 mb-1">Notes</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{selectedLead.notes}</p>
                  </div>
                )}
              </div>

              {/* Primary Contact */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Primary Contact</p>
                {selectedLead.primary_contact ? (
                  <div className="rounded-lg border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-900">{selectedLead.primary_contact.full_name}</p>
                    {selectedLead.primary_contact.job_title && (
                      <p className="text-xs text-slate-500 uppercase tracking-tight mt-0.5">
                        {selectedLead.primary_contact.job_title}
                      </p>
                    )}
                    <div className="mt-3 space-y-2">
                      {selectedLead.primary_contact.email && (
                        <a
                          href={`mailto:${selectedLead.primary_contact.email}`}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        >
                          <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                          {selectedLead.primary_contact.email}
                        </a>
                      )}
                      {selectedLead.primary_contact.phone && (
                        <a
                          href={`tel:${selectedLead.primary_contact.phone}`}
                          className="flex items-center gap-2 text-sm text-slate-700 hover:underline"
                        >
                          <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                          {selectedLead.primary_contact.phone}
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No contact information available.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
