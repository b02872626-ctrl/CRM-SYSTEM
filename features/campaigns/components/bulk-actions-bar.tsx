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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900 text-white rounded-full px-6 py-3 shadow-2xl flex items-center gap-6 border border-slate-700/50 backdrop-blur-md">
        <div className="flex items-center gap-3 border-r border-slate-700 pr-6">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold">
            {selectedCount}
          </span>
          <span className="text-sm font-medium text-slate-300">Leads selected</span>
          <button 
            onClick={onClearSelection}
            className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkEmail}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors text-slate-300 hover:text-white"
            title={`Email ${emails.length} contacts`}
          >
            <Mail className="h-4 w-4" />
            Email
          </button>

          <div className="relative">
            <button
              onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors text-slate-300 hover:text-white"
            >
              <CheckCircle className="h-4 w-4" />
              Status
              <ChevronDown className={cn("h-3 w-3 transition-transform", isStatusMenuOpen && "rotate-180")} />
            </button>

            {isStatusMenuOpen && (
              <div className="absolute bottom-full mb-2 left-0 w-40 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                {["Target", "Researching", "Contacted", "Qualified", "Won", "Lost"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      handleBulkStatusUpdate(status);
                      setIsStatusMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors capitalize text-slate-300 hover:text-white"
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleBulkRemove}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-900/50 hover:text-red-400 rounded-lg text-sm font-medium transition-colors text-slate-500"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
