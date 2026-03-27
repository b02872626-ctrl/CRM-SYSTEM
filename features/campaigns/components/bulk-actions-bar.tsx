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
      <div className="bg-[#1e1e1e] text-white/90 rounded-xl px-4 py-2 flex items-center gap-4 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <div className="flex items-center gap-3 border-r border-white/5 pr-4">
          <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[#2383E2] text-[10px] font-black text-white uppercase tracking-tight">
            {selectedCount}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold text-white whitespace-nowrap">Selected</span>
            <button 
              onClick={onClearSelection}
              className="p-1 hover:bg-white/5 rounded-sm transition-colors text-white/20 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleBulkEmail}
            className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg text-[13px] font-bold transition-all text-white/40 hover:text-[#2383E2] group whitespace-nowrap"
            title={`Email ${emails.length} contacts`}
          >
            <Mail className="h-4 w-4 text-white/20 group-hover:text-[#2383E2] transition-colors" />
            Email
          </button>

          <div className="relative">
            <button
              onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg text-[13px] font-bold transition-all text-white/40 hover:text-white group"
            >
              <CheckCircle className="h-4 w-4 text-white/20 group-hover:text-emerald-400 transition-colors" />
              Status
              <ChevronDown className={cn("h-3.5 w-3.5 text-white/10 transition-transform duration-300", isStatusMenuOpen && "rotate-180")} />
            </button>

            {isStatusMenuOpen && (
              <div className="absolute bottom-full mb-3 left-0 w-44 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 backdrop-blur-md">
                <div className="p-1.5 space-y-0.5">
                  {["Target", "Researching", "Contacted", "Qualified", "Won", "Lost"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        handleBulkStatusUpdate(status);
                        setIsStatusMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-[13px] font-semibold rounded-lg hover:bg-white/5 transition-all capitalize text-white/40 hover:text-white"
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
            className="flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 rounded-lg text-[13px] font-bold transition-all text-white/20 hover:text-red-400 group"
          >
            <Trash2 className="h-4 w-4 text-white/10 group-hover:text-red-400 transition-colors" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
