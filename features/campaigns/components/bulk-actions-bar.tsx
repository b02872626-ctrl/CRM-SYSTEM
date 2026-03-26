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
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
      <div className="bg-slate-950/90 text-white rounded-full px-5 py-2.5 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] flex items-center gap-6 border border-white/5 backdrop-blur-2xl">
        <div className="flex items-center gap-3.5 border-r border-white/10 pr-6">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            {selectedCount}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium text-white/90 whitespace-nowrap">Leads selected</span>
            <button 
              onClick={onClearSelection}
              className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkEmail}
            className="flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-white/10 rounded-full text-[14px] font-semibold transition-all text-white/80 hover:text-white group"
            title={`Email ${emails.length} contacts`}
          >
            <Mail className="h-4 w-4 text-white/40 group-hover:text-blue-400 transition-colors" />
            Email
          </button>

          <div className="relative">
            <button
              onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
              className="flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-white/10 rounded-full text-[14px] font-semibold transition-all text-white/80 hover:text-white group"
            >
              <CheckCircle className="h-4 w-4 text-white/40 group-hover:text-emerald-400 transition-colors" />
              Status
              <ChevronDown className={cn("h-4 w-4 text-white/30 transition-transform duration-300", isStatusMenuOpen && "rotate-180")} />
            </button>

            {isStatusMenuOpen && (
              <div className="absolute bottom-full mb-4 left-0 w-48 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 backdrop-blur-xl">
                <div className="p-1.5">
                  {["Target", "Researching", "Contacted", "Qualified", "Won", "Lost"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        handleBulkStatusUpdate(status);
                        setIsStatusMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-[14px] font-medium rounded-xl hover:bg-white/10 transition-colors capitalize text-white/60 hover:text-white"
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
            className="flex items-center gap-2.5 px-4 py-1.5 hover:bg-red-500/20 rounded-full text-[14px] font-semibold transition-all text-white/30 hover:text-red-400 group"
          >
            <Trash2 className="h-4 w-4 text-white/20 group-hover:text-red-500 transition-colors" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
