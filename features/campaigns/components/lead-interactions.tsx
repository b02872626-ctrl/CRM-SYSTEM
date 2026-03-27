"use client";

import { useState, useRef, ReactNode, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Download, 
  Upload, 
  X, 
  Users, 
  Mail, 
  Phone, 
  Building2, 
  ExternalLink, 
  Loader2, 
  Check, 
  Copy,
  Pencil, 
  PlusCircle, 
  Save, 
  Globe, 
  Briefcase, 
  ChevronRight, 
  UserPlus 
} from "lucide-react";
import { 
  addCompaniesToCampaignAction, 
  importCampaignLeadsAction, 
  createCampaignLeadAction, 
  importLeadBatchAction,
  updateLeadStatusAction 
} from "@/features/campaigns/actions";
import { 
  updateCompanyAction, 
  createContactAction, 
  updateContactAction 
} from "@/features/companies/actions";
import { parseCsv } from "@/features/campaigns/utils";
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
  const router = useRouter();
  const [showAddLeadForm, setShowAddLeadForm] = useState(false);
  const [addMode, setAddMode] = useState<"manual" | "csv" | "existing">("manual");
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<"idle" | "reading" | "processing" | "done" | "error">("idle");
  const csvFormRef = useRef<HTMLFormElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(key);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleCsvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus("reading");
    setImportProgress(0);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCsv(text);
        
        if (rows.length === 0) {
          setImportStatus("error");
          setIsImporting(false);
          return;
        }

        setImportStatus("processing");
        const BATCH_SIZE = 100;
        const CONCURRENCY = 3;
        
        for (let i = 0; i < rows.length; i += BATCH_SIZE * CONCURRENCY) {
          const chunk = [];
          for (let j = 0; j < CONCURRENCY; j++) {
            const start = i + (j * BATCH_SIZE);
            if (start < rows.length) {
              const batch = rows.slice(start, start + BATCH_SIZE);
              chunk.push(importLeadBatchAction(campaignId, batch));
            }
          }
          
          await Promise.all(chunk);
          
          const processedCount = Math.min(i + (BATCH_SIZE * CONCURRENCY), rows.length);
          const progress = Math.min(Math.round((processedCount / rows.length) * 100), 100);
          setImportProgress(progress);
        }

        setImportStatus("done");
        router.refresh(); // Ensure the leads list updates
        setTimeout(() => {
          setShowAddLeadForm(false);
          setIsImporting(false);
          setImportStatus("idle");
        }, 1500);
      } catch (error) {
        console.error("Import failed:", error);
        setImportStatus("error");
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white tracking-tight">Campaign Leads</h3>
        <button
          onClick={() => setShowAddLeadForm(!showAddLeadForm)}
          className={cn(
            "flex items-center gap-2",
            showAddLeadForm ? "crm-secondary-button" : "crm-primary-button"
          )}
        >
          {showAddLeadForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddLeadForm ? "Cancel" : "Add New Lead"}
        </button>
      </div>

      {showAddLeadForm && (
        <div className="border border-white/5 bg-white/[0.01] p-6 shadow-inner mb-6 rounded-xl backdrop-blur-sm">
          <div className="mb-6 flex gap-2">
            {["manual", "csv", "existing"].map((mode) => (
              <button
                key={mode}
                onClick={() => setAddMode(mode as any)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-semibold transition-all capitalize",
                  addMode === mode
                    ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                    : "text-white/40 hover:text-white/60 hover:bg-white/5"
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
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Company Information</h4>
                <div className="crm-field">
                  <label htmlFor="company_name" className="crm-label">Company Name *</label>
                  <input id="company_name" name="company_name" required className="crm-input" placeholder="e.g. Acme Corp" />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="crm-field">
                    <label htmlFor="industry" className="crm-label">Industry</label>
                    <input id="industry" name="industry" className="crm-input" placeholder="e.g. Tech" />
                  </div>
                  <div className="crm-field">
                    <label htmlFor="company_size" className="crm-label">Size</label>
                    <input id="company_size" name="company_size" className="crm-input" placeholder="e.g. 1-10" />
                  </div>
                  <div className="crm-field">
                    <label htmlFor="location" className="crm-label">Location</label>
                    <input id="location" name="location" className="crm-input" placeholder="e.g. San Mateo" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Lead Contact</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="crm-field">
                    <label htmlFor="contact_full_name" className="crm-label">Contact Name</label>
                    <input id="contact_full_name" name="contact_full_name" className="crm-input" placeholder="Full name" />
                  </div>
                  <div className="crm-field">
                    <label htmlFor="contact_job_title" className="crm-label">Role</label>
                    <input id="contact_job_title" name="contact_job_title" className="crm-input" placeholder="e.g. Sales Engineer" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="crm-field">
                    <label htmlFor="contact_email" className="crm-label">Contact Email</label>
                    <input id="contact_email" name="contact_email" type="email" className="crm-input" placeholder="email@example.com" />
                  </div>
                  <div className="crm-field">
                    <label htmlFor="contact_phone" className="crm-label">Contact Phone</label>
                    <input id="contact_phone" name="contact_phone" type="tel" className="crm-input" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 border-t border-white/5 pt-4 flex items-center justify-end">
                <button type="submit" className="crm-primary-button px-8">Create and Link Lead</button>
              </div>
            </form>
          )}

          {addMode === "csv" && (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="space-y-4 w-full max-w-md bg-white/[0.02] p-8 rounded-xl shadow-sm border border-white/5">
                {!isImporting && importStatus !== "done" ? (
                  <>
                    <div className="mx-auto w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                      <Upload className="h-6 w-6 text-[#2383E2]" />
                    </div>
                    <h4 className="text-base font-bold text-white mb-2 tracking-tight">Upload CSV File</h4>
                    <div className="relative group cursor-pointer">
                      <input
                        type="file"
                        name="csv_file"
                        accept=".csv,text/csv"
                        onChange={handleCsvChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="border-2 border-dashed border-white/10 rounded-xl py-10 px-4 group-hover:border-[#2383E2]/50 group-hover:bg-[#2383E2]/5 transition-all text-center">
                        <p className="text-sm font-semibold text-white/60">Click to choose or drag & drop</p>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-col items-center gap-3">
                      <a 
                        href="/templates/campaign-leads-template.csv" 
                        download 
                        className="flex items-center gap-2 text-xs font-bold text-[#2383E2] hover:text-[#3291f0] transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download CSV Template
                      </a>
                      <p className="text-[10px] text-white/20 italic">Supports both commas and tabs (copy-pasted from Excel)</p>
                    </div>
                  </>
                ) : (
                  <div className="py-6 space-y-6">
                    <div className="flex flex-col items-center gap-2">
                       {importStatus === "done" ? (
                         <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center animate-in zoom-in duration-300">
                           <Check className="h-6 w-6 text-emerald-400" />
                         </div>
                       ) : (
                         <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                           <Loader2 className="h-6 w-6 text-[#2383E2] animate-spin" />
                         </div>
                       )}
                       <p className="text-sm font-bold text-white">
                         {importStatus === "reading" ? "Reading file..." : 
                          importStatus === "processing" ? `Importing leads (${importProgress}%)` : 
                          importStatus === "done" ? "Import complete!" : 
                          "An error occurred."}
                       </p>
                    </div>

                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-300 ease-out",
                          importStatus === "done" ? "bg-emerald-500" : "bg-[#2383E2]"
                        )}
                        style={{ width: `${importProgress}%` }}
                      />
                    </div>
                    
                    {importStatus === "processing" && (
                      <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Please do not close this window</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {addMode === "existing" && (
            <form action={addCompaniesToCampaignAction} className="grid gap-6 sm:grid-cols-2">
              <input type="hidden" name="campaign_id" value={campaignId} />
              <div className="crm-field">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-3 block">
                  Select Companies ({availableCompanies.length} available)
                </label>
                <select id="company_ids" name="company_ids" multiple size={6} className="crm-input h-auto bg-[#1a1a1a] scrollbar-thin scrollbar-thumb-white/10">
                  {availableCompanies.map((c) => (
                    <option key={c.id} value={c.id} className="py-1 px-2 hover:bg-white/5 rounded transition-colors">{c.name} {c.industry ? `(${c.industry})` : ""}</option>
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
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClearLead} />
          <div className="fixed inset-y-6 right-6 z-50 flex w-full max-w-md flex-col bg-[#111111]/95 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] animate-in slide-in-from-right duration-300 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/5 px-6 py-5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                  <Building2 className="h-5 w-5 text-white/40" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <input
                        name="company_name"
                        defaultValue={selectedLead.company?.name ?? ""}
                        form="edit-lead-form"
                        className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white font-bold outline-none focus:border-[#2383E2]"
                      />
                    ) : (
                      <h3 className="text-base font-bold text-white tracking-tight">{selectedLead.company?.name ?? "Unknown"}</h3>
                    )}
                  </div>
                  {isEditing ? (
                    <input
                      name="industry"
                      defaultValue={selectedLead.company?.industry ?? ""}
                      form="edit-lead-form"
                      placeholder="Industry"
                      className="mt-1 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-[10px] text-white/30 font-bold outline-none focus:border-[#2383E2]"
                    />
                  ) : (
                    <p className="text-xs text-white/30 font-semibold">{selectedLead.company?.industry ?? "No industry"}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 text-white/20 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                    title="Edit Lead"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button 
                      form="edit-lead-form"
                      type="submit"
                      disabled={isPending}
                      className="p-1.5 text-[#2383E2] hover:bg-[#2383E2]/10 rounded-lg transition-colors"
                      title="Save Changes"
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="p-1.5 text-white/20 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <button onClick={onClearLead} className="p-1.5 text-white/20 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-hide">
               <form 
                id="edit-lead-form" 
                action={async (formData: FormData) => {
                  formData.append("id", selectedLead.company_id);
                  startTransition(async () => {
                    await updateCompanyAction(formData);
                    
                    // Also update status if changed
                    const statusFormData = new FormData();
                    statusFormData.append("campaign_id", campaignId);
                    statusFormData.append("company_id", selectedLead.company_id);
                    statusFormData.append("status", formData.get("campaign_status") as string);
                    await updateLeadStatusAction(statusFormData);
                    
                    setIsEditing(false);
                    router.refresh();
                  });
                }}
              />

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Status</p>
                    {isEditing ? (
                      <select
                        name="campaign_status"
                        defaultValue={selectedLead.campaign_status ?? "Added"}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-[#2383E2] font-black outline-none focus:border-[#2383E2]"
                        form="edit-lead-form"
                      >
                        <option value="Added">Added</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Interested">Interested</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                      </select>
                    ) : (
                      <p className="text-sm font-black text-[#2383E2] uppercase italic">{selectedLead.campaign_status ?? "Added"}</p>
                    )}
                  </div>
                  <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Deals</p>
                    <p className="text-sm font-black text-white italic">{selectedLead.deal_count}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Company Details</h4>
                  
                  <div className="grid gap-3">
                    {[
                      { icon: Users, label: "Size", name: "company_size", value: selectedLead.company?.company_size },
                      { icon: Globe, label: "Website", name: "website", value: selectedLead.company?.website }
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-3 text-sm text-white/60 bg-white/[0.03] p-3 rounded-xl border border-white/5 group">
                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-white/5 shrink-0">
                            <item.icon className="h-4 w-4 text-white/20" />
                          </div>
                          {isEditing ? (
                            <input
                              name={item.name}
                              defaultValue={item.value ?? ""}
                              placeholder={item.label}
                              form="edit-lead-form"
                              className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/70 outline-none focus:border-[#2383E2] w-full"
                            />
                          ) : (
                            <span className="truncate font-bold text-white/60" title={item.value ?? ""}>{item.value ?? `No ${item.label}`}</span>
                          )}
                        </div>
                        {!isEditing && item.value && (
                          <button 
                            type="button"
                            onClick={() => handleCopy(item.value!, item.label)}
                            className="p-1.5 rounded-md hover:bg-white/10 text-white/20 hover:text-white transition-all opacity-0 group-hover:opacity-100 shrink-0"
                          >
                            {copyFeedback === item.label ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
               </div>
               
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Contact Persons</h4>
                    <button 
                      onClick={() => setIsAddingContact(!isAddingContact)}
                      className="text-[10px] font-black text-[#2383E2] uppercase tracking-[0.1em] flex items-center gap-1 hover:text-[#2383E2]/80 transition-colors"
                    >
                      <UserPlus className="h-3 w-3" />
                      Add Contact
                    </button>
                  </div>

                  {isAddingContact && (
                    <div className="bg-[#2383E2]/5 border border-[#2383E2]/20 p-4 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                      <input
                        placeholder="Full Name"
                        name="full_name"
                        form="add-contact-form"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-[#2383E2]"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          placeholder="Role"
                          name="role_title"
                          form="add-contact-form"
                          className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-[#2383E2]"
                        />
                        <input
                          placeholder="Phone"
                          name="phone"
                          form="add-contact-form"
                          className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-[#2383E2]"
                        />
                      </div>
                      <input
                        placeholder="Email"
                        name="email"
                        form="add-contact-form"
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-[#2383E2]"
                      />
                      <div className="flex justify-end gap-2 pt-1">
                        <button type="button" onClick={() => setIsAddingContact(false)} className="text-[10px] font-black text-white/30 uppercase p-2">Cancel</button>
                        <button 
                          form="add-contact-form"
                          className="bg-[#2383E2] text-white text-[10px] font-black uppercase px-4 py-2 rounded-lg hover:bg-[#2383E2]/90 transition-colors"
                        >
                          Save Contact
                        </button>
                      </div>
                      <form 
                        id="add-contact-form" 
                        action={async (formData: FormData) => {
                          formData.append("company_id", selectedLead.company_id);
                          startTransition(async () => {
                            await createContactAction(formData);
                            setIsAddingContact(false);
                            router.refresh();
                          });
                        }} 
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    {(selectedLead.company?.contacts ?? []).map((contact, idx) => (
                      <div key={contact.id && contact.id !== 'undefined' ? contact.id : `contact-${idx}`} className="border border-white/5 bg-white/[0.01] rounded-xl p-4 space-y-4 group/contact relative">
                         <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="text-sm font-black text-white/90 tracking-tight italic uppercase">{contact.full_name}</h3>
                              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.1em] flex items-center gap-1.5">
                                <Briefcase className="h-3 w-3" />
                                {contact.role_title ?? "Decision Maker"}
                              </p>
                            </div>
                            {idx === 0 && (
                              <span className="text-[8px] font-black bg-[#2383E2]/20 text-[#2383E2] border border-[#2383E2]/20 px-1.5 py-0.5 rounded uppercase">Primary</span>
                            )}
                          </div>
                         <div className="space-y-2">
                           {[
                             { icon: Mail, value: contact.email, key: `email-${idx}` },
                             { icon: Phone, value: contact.phone, key: `phone-${idx}` }
                           ].map((ci) => ci.value && (
                             <div key={ci.key} className="flex items-center justify-between group/row">
                               <div className="flex items-center gap-2 overflow-hidden flex-1">
                                 <ci.icon className="h-3.5 w-3.5 text-white/10 shrink-0" />
                                 <span className="text-[11px] text-white/50 font-bold truncate">{ci.value}</span>
                               </div>
                               <button 
                                 type="button"
                                 onClick={() => handleCopy(ci.value!, ci.key)}
                                 className="p-1 rounded hover:bg-white/10 text-white/10 hover:text-white transition-all opacity-0 group-hover/contact:opacity-100 shrink-0"
                               >
                                 {copyFeedback === ci.key ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                </button>
                             </div>
                           ))}
                         </div>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Intelligence</h4>
                 <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#2383E2]/60 mb-2">Notes & Context</p>
                    {isEditing ? (
                      <textarea
                        name="notes"
                        defaultValue={selectedLead.company?.notes ?? ""}
                        form="edit-lead-form"
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-[11px] text-white/50 font-bold outline-none focus:border-[#2383E2] resize-none"
                      />
                    ) : (
                      <p className="text-xs text-white/50 font-medium leading-relaxed italic">
                        {selectedLead.company?.notes || "No intelligence notes available."}
                      </p>
                    )}
                 </div>
               </div>

               <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Priority</p>
                 {isEditing ? (
                    <select
                      name="priority"
                      defaultValue={selectedLead.company?.priority ?? "Medium"}
                      form="edit-lead-form"
                      className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/90 font-black outline-none focus:border-[#2383E2]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  ) : (
                    <p className="text-sm font-black text-white uppercase italic">{selectedLead.company?.priority ?? "Medium"}</p>
                  )}
               </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
