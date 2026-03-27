"use client";

import { Mail, Phone, MapPin, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotionSelect } from "@/components/ui/notion-select";
import { SALES_STATUS_OPTIONS, INTEREST_LEVEL_OPTIONS } from "@/features/campaigns/constants";
import { useTransition } from "react";
import { updateLeadStatusAction } from "@/features/campaigns/actions";
import { useRouter } from "next/navigation";

type Lead = {
  id: string;
  company_id: string;
  campaign_status: string | null;
  interest_level: string | null;
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

type LeadsTableProps = {
  leads: Lead[];
  campaignId: string;
  onSelectLead: (lead: Lead) => void;
  selectedIds: Set<string>;
  onToggleLead: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
};

export function LeadsTable({ 
  leads, 
  campaignId,
  onSelectLead, 
  selectedIds, 
  onToggleLead, 
  onSelectAll 
}: LeadsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const allIds = leads.map(l => l.company_id);
  const isAllSelected = leads.length > 0 && leads.every(l => selectedIds.has(l.company_id));

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelectAll(allIds);
    } else {
      onSelectAll([]);
    }
  };

  const handleStatusChange = async (lead: Lead, field: "status" | "interest", value: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("campaign_id", campaignId);
      formData.append("company_id", lead.company_id);
      
      if (field === "status") {
        formData.append("status", value);
        formData.append("interest_level", lead.interest_level ?? "ICE Cold");
      } else {
        formData.append("status", lead.campaign_status ?? "Added");
        formData.append("interest_level", value);
      }

      await updateLeadStatusAction(formData);
      router.refresh();
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-white/[0.02]">
            <th className="px-4 py-3 text-left border-b border-r border-white/10 w-10">
              <input 
                type="checkbox" 
                className="crm-checkbox align-middle" 
                checked={isAllSelected}
                onChange={handleSelectAllChange}
              />
            </th>
            <th className="px-4 py-3 text-left border-b border-r border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Lead / Company</th>
            <th className="px-4 py-3 text-left border-b border-r border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 text-left">Primary Contact</th>
            <th className="px-4 py-3 text-left border-b border-r border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Status</th>
            <th className="px-4 py-3 text-left border-b border-r border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Interest</th>
            <th className="px-4 py-3 text-center border-b border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Deals</th>
          </tr>
        </thead>
        <tbody className="bg-transparent">
          {leads.map((item) => (
            <tr 
              key={item.id} 
              data-lead-row="true"
              className={cn(
                "group cursor-pointer hover:bg-white/[0.02] transition-colors",
                "border-b border-white/5",
                selectedIds.has(item.company_id) ? "bg-[#2383E2]/10" : ""
              )}
              onClick={() => onSelectLead(item)}
            >
              <td className="px-4 py-2.5 align-top border-b border-r border-white/10" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="checkbox" 
                  className="crm-checkbox mt-0.5" 
                  checked={selectedIds.has(item.company_id)}
                  onChange={() => onToggleLead(item.company_id)}
                />
              </td>
              <td className="px-4 py-2.5 align-top border-b border-r border-white/10 max-w-[200px]">
                {item.company ? (
                  <div className="text-left overflow-hidden">
                    <div className="text-[13px] font-medium text-white/90 group-hover:text-[#2383E2] transition-colors uppercase tracking-tight truncate whitespace-nowrap" title={item.company.name}>
                      {item.company.name}
                    </div>
                    <p className="text-[10px] font-medium text-white/20 uppercase tracking-[0.1em] truncate whitespace-nowrap">{item.company.industry ?? "No industry"}</p>
                  </div>
                ) : (
                  <span className="text-sm text-white/50">Unknown</span>
                )}
              </td>
              <td className="px-4 py-2.5 align-top border-b border-r border-white/10 max-w-[180px]">
                {item.primary_contact ? (
                  <div className="text-left overflow-hidden">
                    <p className="text-[13px] font-medium text-white/90 truncate whitespace-nowrap" title={item.primary_contact.full_name}>
                      {item.primary_contact.full_name}
                    </p>
                    <p className="text-[10px] font-medium text-white/20 uppercase tracking-wider truncate whitespace-nowrap">{item.primary_contact.role_title ?? "Decision Maker"}</p>
                  </div>
                ) : (
                  <span className="text-[13px] text-white/20 italic">Not set</span>
                )}
              </td>
              <td className="px-4 py-2.5 align-top border-b border-r border-white/10 min-w-[140px]" onClick={(e) => e.stopPropagation()}>
                <NotionSelect
                  options={SALES_STATUS_OPTIONS}
                  value={item.campaign_status ?? "Added"}
                  onChange={(val) => handleStatusChange(item, "status", val)}
                  disabled={isPending}
                />
              </td>
              <td className="px-4 py-2.5 align-top border-b border-r border-white/10 min-w-[140px]" onClick={(e) => e.stopPropagation()}>
                <NotionSelect
                  options={INTEREST_LEVEL_OPTIONS}
                  value={item.interest_level ?? "ICE Cold"}
                  onChange={(val) => handleStatusChange(item, "interest", val)}
                  disabled={isPending}
                />
              </td>
              <td className="px-4 py-2.5 align-top border-b text-center border-white/10 text-[13px] font-medium text-white/40">
                {item.deal_count > 0 ? (
                  <span className="text-[#2383E2]">{item.deal_count}</span>
                ) : (
                  "0"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
