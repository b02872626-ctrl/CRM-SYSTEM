"use client";

import { X } from "lucide-react";
import { CampaignForm } from "./campaign-form";

type OwnerOption = {
  id: string;
  full_name: string;
};

type CreateCampaignModalProps = {
  isOpen: boolean;
  onClose: () => void;
  owners: OwnerOption[];
};

export function CreateCampaignModal({ isOpen, onClose, owners }: CreateCampaignModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="w-full max-w-2xl bg-[#1e1e1e] rounded-md shadow-2xl pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 flex flex-col max-h-[90vh] border border-white/5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Create Campaign</h3>
              <p className="text-xs text-white/30 mt-0.5 font-medium">Define your target and focus for the new outreach effort.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-sm transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Area with scroll if needed */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10">
            <CampaignForm 
              mode="create" 
              owners={owners} 
              onCancel={onClose} 
            />
          </div>
        </div>
      </div>
    </>
  );
}
