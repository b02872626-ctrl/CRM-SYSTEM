"use client";

import { Mail, Phone, MapPin, Users } from "lucide-react";
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

type LeadsTableProps = {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  selectedIds: Set<string>;
  onToggleLead: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
};

export function LeadsTable({ 
  leads, 
  onSelectLead, 
  selectedIds, 
  onToggleLead, 
  onSelectAll 
}: LeadsTableProps) {
  const allIds = leads.map(l => l.company_id);
  const isAllSelected = leads.length > 0 && leads.every(l => selectedIds.has(l.company_id));

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelectAll(allIds);
    } else {
      onSelectAll([]);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-white/5">
            <th className="px-4 py-3 text-left">
              <input 
                type="checkbox" 
                className="crm-checkbox" 
                checked={isAllSelected}
                onChange={handleSelectAllChange}
              />
            </th>
            <th className="px-4 py-2 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Lead / Company</th>
            <th className="px-4 py-2 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Primary Contact</th>
            <th className="px-4 py-2 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Contact Info</th>
            <th className="px-4 py-2 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Company Details</th>
            <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Status</th>
            <th className="px-4 py-2 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Deals</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 bg-transparent">
          {leads.map((item) => (
            <tr 
              key={item.id} 
              className={cn(
                "hover:bg-white/[0.03] transition-colors cursor-pointer group",
                selectedIds.has(item.company_id) ? "bg-[#2383E2]/10" : ""
              )}
              onClick={() => onSelectLead(item)}
            >
              <td className="px-4 py-1.5 align-middle" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="checkbox" 
                  className="crm-checkbox" 
                  checked={selectedIds.has(item.company_id)}
                  onChange={() => onToggleLead(item.company_id)}
                />
              </td>
              <td className="px-4 py-1.5 align-middle">
                {item.company ? (
                  <div className="text-left">
                    <span className="text-sm font-semibold text-white/90 group-hover:text-[#2383E2] transition-colors uppercase tracking-tight">
                      {item.company.name}
                    </span>
                    <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.1em]">{item.company.industry ?? "No industry"}</p>
                  </div>
                ) : (
                  <span className="text-sm text-white/50">Unknown</span>
                )}
              </td>
              <td className="px-4 py-1.5 align-middle">
                {item.primary_contact ? (
                  <div className="text-left">
                    <p className="text-sm font-bold text-white/90">{item.primary_contact.full_name}</p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-wider">{item.primary_contact.role_title ?? "Decision Maker"}</p>
                  </div>
                ) : (
                  <span className="text-sm text-white/20 italic">Not set</span>
                )}
              </td>
              <td className="px-4 py-1.5 align-middle">
                {item.primary_contact && (item.primary_contact.email || item.primary_contact.phone) ? (
                  <div className="space-y-1.5 min-w-[140px] text-left">
                    {item.primary_contact.email && (
                      <p className="text-xs text-white/40 flex items-center gap-1.5 truncate">
                        <Mail className="h-3.5 w-3.5 text-white/10 shrink-0" />
                        <span className="truncate">{item.primary_contact.email}</span>
                      </p>
                    )}
                    {item.primary_contact.phone && (
                      <p className="text-xs text-white/40 flex items-center gap-1.5 truncate">
                        <Phone className="h-3.5 w-3.5 text-white/10 shrink-0" />
                        <span className="truncate">{item.primary_contact.phone}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-white/20 italic">No contact info</span>
                )}
              </td>
              <td className="px-4 py-1.5 align-middle">
                <div className="space-y-1.5 text-left">
                  {item.company?.location ? (
                    <p className="text-xs text-white/40 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-white/10 shrink-0" />
                      <span className="truncate max-w-[120px]" title={item.company.location}>{item.company.location}</span>
                    </p>
                  ) : null}
                  {item.company?.company_size ? (
                    <p className="text-xs text-white/40 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-white/10 shrink-0" />
                      <span>{item.company.company_size}</span>
                    </p>
                  ) : null}
                  {!item.company?.location && !item.company?.company_size && (
                    <span className="text-xs text-white/20 italic">No details</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-1.5 align-middle">
                <span className={cn(
                  "inline-flex rounded-sm px-2 py-0.5 text-[11px] font-bold border shadow-sm",
                  item.campaign_status === "Won" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  item.campaign_status === "Lost" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                  "bg-white/5 text-white/60 border-white/10"
                )}>
                  {item.campaign_status ?? "Active"}
                </span>
              </td>
              <td className="px-4 py-1.5 align-middle text-center text-sm font-bold text-white/40">
                {item.deal_count > 0 ? (
                  <span className="text-[#2383E2] font-black">{item.deal_count}</span>
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
