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
      <div className="bg-white text-slate-900 rounded-xl px-4 py-2 flex items-center gap-4 border border-slate-200">
        <div className="flex items-center gap-3 border-r border-slate-100 pr-4">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white uppercase tracking-tight">
            {selectedCount}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold text-slate-950 whitespace-nowrap">Selected</span>
            <button 
              onClick={onClearSelection}
              className="p-0.5 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleBulkEmail}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded-lg text-[13px] font-medium transition-all text-slate-600 hover:text-blue-600 group"
            title={`Email ${emails.length} contacts`}
          >
            <Mail className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            Email
          </button>

          <div className="relative">
            <button
              onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded-lg text-[13px] font-medium transition-all text-slate-600 hover:text-slate-900 group"
            >
              <CheckCircle className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              Status
              <ChevronDown className={cn("h-3.5 w-3.5 text-slate-300 transition-transform duration-300", isStatusMenuOpen && "rotate-180")} />
            </button>

            {isStatusMenuOpen && (
              <div className="absolute bottom-full mb-3 left-0 w-44 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-1">
                  {["Target", "Researching", "Contacted", "Qualified", "Won", "Lost"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        handleBulkStatusUpdate(status);
                        setIsStatusMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-[13px] font-medium rounded-lg hover:bg-slate-50 transition-colors capitalize text-slate-600 hover:text-slate-900"
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
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 rounded-lg text-[13px] font-medium transition-all text-slate-400 hover:text-red-600 group"
          >
            <Trash2 className="h-4 w-4 text-slate-300 group-hover:text-red-500 transition-colors" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
