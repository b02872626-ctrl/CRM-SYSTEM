"use client";

import { useState } from "react";
import { X, Mail, Trash2, CheckCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { bulkUpdateLeadStatusAction, bulkRemoveLeadsAction } from "@/features/campaigns/actions";

type Lead = {
  id: string;
  company_id: string;
  primary_contact: {
    full_name: string;
    email: string | null;
  } | null;
  company: {
    name: string;
  } | null;
};

type BulkActionsBarProps = {
  campaignId: string;
  selectedLeads: Lead[];
  onClearSelection: () => void;
};

export function BulkActionsBar({ campaignId, selectedLeads, onClearSelection }: BulkActionsBarProps) {
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const selectedCount = selectedLeads.length;
  
  if (selectedCount === 0) return null;

  const emails = selectedLeads
    .map(l => l.primary_contact?.email)
    .filter((email): email is string => Boolean(email));

  const handleBulkEmail = () => {
    if (emails.length === 0) {
      alert("No email addresses found for selected leads.");
      return;
    }
    // Using BCC to keep privacy
    const mailtoUrl = `mailto:?bcc=${emails.join(",")}&subject=Following up`;
    window.location.href = mailtoUrl;
  };

  const handleBulkStatusUpdate = async (status: string) => {
    const formData = new FormData();
    formData.append("campaign_id", campaignId);
    formData.append("status", status);
    selectedLeads.forEach(l => formData.append("company_ids", l.company_id));
    
    try {
      await bulkUpdateLeadStatusAction(formData);
      onClearSelection();
    } catch (error: any) {
      alert("Failed to update status: " + error.message);
    }
  };

  const handleBulkRemove = async () => {
    if (!confirm(`Are you sure you want to remove ${selectedCount} leads from this campaign?`)) return;
    
    const formData = new FormData();
    formData.append("campaign_id", campaignId);
    selectedLeads.forEach(l => formData.append("company_ids", l.company_id));
    
    try {
      await bulkRemoveLeadsAction(formData);
      onClearSelection();
    } catch (error: any) {
      alert("Failed to remove leads: " + error.message);
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-6 duration-500 ease-out">
      <div className="bg-slate-950/95 text-white rounded-full px-5 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-5 border border-slate-800/60 backdrop-blur-xl">
        <div className="flex items-center gap-3.5 border-r border-slate-800 pr-5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
            {selectedCount}
          </span>
          <span className="text-[13px] font-medium text-slate-100 whitespace-nowrap">Leads selected</span>
          <button 
            onClick={onClearSelection}
            className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-slate-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleBulkEmail}
            className="flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-slate-800/80 rounded-full text-[13px] font-semibold transition-all text-slate-200 hover:text-white group"
            title={`Email ${emails.length} contacts`}
          >
            <Mail className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
            Email
          </button>

          <div className="relative">
            <button
              onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
              className="flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-slate-800/80 rounded-full text-[13px] font-semibold transition-all text-slate-200 hover:text-white group"
            >
              <CheckCircle className="h-4 w-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              Status
              <ChevronDown className={cn("h-3.5 w-3.5 text-slate-500 transition-transform duration-300", isStatusMenuOpen && "rotate-180")} />
            </button>

            {isStatusMenuOpen && (
              <div className="absolute bottom-full mb-3 left-0 w-44 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="p-1.5">
                  {["Target", "Researching", "Contacted", "Qualified", "Won", "Lost"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        handleBulkStatusUpdate(status);
                        setIsStatusMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-[13px] font-medium rounded-lg hover:bg-slate-800 transition-colors capitalize text-slate-400 hover:text-white"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleBulkRemove}
            className="flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-red-500/10 rounded-full text-[13px] font-semibold transition-all text-slate-500 hover:text-red-400 group"
          >
            <Trash2 className="h-4 w-4 text-slate-600 group-hover:text-red-500 transition-colors" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
