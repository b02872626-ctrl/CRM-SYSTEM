"use client";

import { useState, useRef, ReactNode } from "react";
import Link from "next/link";
import { Plus, Download, Upload, X, MapPin, Users, Mail, Phone, Building2, ExternalLink } from "lucide-react";
import { addCompaniesToCampaignAction, importCampaignLeadsAction, createCampaignLeadAction } from "@/features/campaigns/actions";
import { cn } from "@/lib/utils";

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

type LeadInteractionsProps = {
  campaignId: string;
  availableCompanies: Array<{
    id: string;
    name: string;
    industry: string | null;
  }>;
  selectedLead: Lead | null;
  onClearLead: () => void;
};

export function LeadInteractions({ 
  campaignId, 
  availableCompanies, 
  selectedLead, 
  onClearLead 
}: LeadInteractionsProps) {
  const [showAddLeadForm, setShowAddLeadForm] = useState(false);
  const [addMode, setAddMode] = useState<"manual" | "csv" | "existing">("manual");
  const csvFormRef = useRef<HTMLFormElement>(null);

  const handleCsvChange = () => {
    if (csvFormRef.current) {
      csvFormRef.current.requestSubmit();
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
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
        <div className="border border-slate-200 bg-slate-50 p-6 shadow-inner mb-6">
          <div className="mb-6 flex gap-2">
            {["manual", "csv", "existing"].map((mode) => (
              <button
                key={mode}
                onClick={() => setAddMode(mode as any)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition-all capitalize",
                  addMode === mode
                    ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                )}
              >
                {mode === "manual" ? "Create New" : mode === "csv" ? "Import CSV" : "Link Existing"}
              </button>
            ))}
          </div>

          {addMode === "manual" && (
            <form action={createCampaignLeadAction} className="grid gap-x-8 gap-y-6 md:grid-cols-2">
              <input type="hidden" name="campaign_id" value={campaignId} />
              
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
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Lead Contact</h4>
                <div className="crm-field">
                  <label htmlFor="contact_full_name" className="crm-label">Contact Name</label>
                  <input id="contact_full_name" name="contact_full_name" className="crm-input" placeholder="Full name" />
                </div>
                <div className="crm-field">
                  <label htmlFor="contact_email" className="crm-label">Contact Email</label>
                  <input id="contact_email" name="contact_email" type="email" className="crm-input" placeholder="email@example.com" />
                </div>
              </div>

              <div className="md:col-span-2 border-t border-slate-200 pt-4 flex items-center justify-end">
                <button type="submit" className="crm-primary-button px-8">Create and Link Lead</button>
              </div>
            </form>
          )}

          {addMode === "csv" && (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <form action={importCampaignLeadsAction} ref={csvFormRef} className="space-y-4 w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <input type="hidden" name="campaign_id" value={campaignId} />
                <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-blue-500" />
                </div>
                <h4 className="text-base font-semibold text-slate-950 mb-2">Upload CSV File</h4>
                <div className="relative group cursor-pointer">
                  <input
                    type="file"
                    name="csv_file"
                    accept=".csv,text/csv"
                    onChange={handleCsvChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-slate-200 rounded-lg py-10 px-4 group-hover:border-blue-400 group-hover:bg-blue-50/30 transition-all text-center">
                    <p className="text-sm font-medium text-slate-700">Click to choose or drag & drop</p>
                  </div>
                </div>
              </form>
            </div>
          )}

          {addMode === "existing" && (
            <form action={addCompaniesToCampaignAction} className="grid gap-6 sm:grid-cols-2">
              <input type="hidden" name="campaign_id" value={campaignId} />
              <div className="crm-field">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  Select Companies ({availableCompanies.length} available)
                </label>
                <select id="company_ids" name="company_ids" multiple size={6} className="crm-input h-auto">
                  {availableCompanies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} {c.industry ? `(${c.industry})` : ""}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col justify-end space-y-4">
                <button type="submit" className="crm-primary-button w-full">Link Selected</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Lead Detail Slide-Over */}
      {selectedLead && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClearLead} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100"><Building2 className="h-5 w-5 text-slate-600" /></div>
                <div>
                  <h3 className="text-base font-semibold text-slate-950">{selectedLead.company?.name ?? "Unknown"}</h3>
                  <p className="text-xs text-slate-500">{selectedLead.company?.industry ?? "No industry"}</p>
                </div>
              </div>
              <button onClick={onClearLead} className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-md"><X className="h-4 w-4" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{selectedLead.campaign_status ?? "Added"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Deals</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{selectedLead.deal_count}</p>
                  </div>
               </div>
               
               {selectedLead.primary_contact && (
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Primary Contact</p>
                   <div className="border border-slate-200 rounded-lg p-4 space-y-2">
                     <p className="text-sm font-bold text-slate-900">{selectedLead.primary_contact.full_name}</p>
                     <p className="text-xs text-slate-500">{selectedLead.primary_contact.email}</p>
                     <p className="text-xs text-slate-500">{selectedLead.primary_contact.phone}</p>
                   </div>
                 </div>
               )}

               <div className="pt-4">
                 <Link href={`/companies/${selectedLead.company?.id}`} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-2">
                   <ExternalLink className="h-4 w-4" />
                   View Full Company Profile
                 </Link>
               </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
