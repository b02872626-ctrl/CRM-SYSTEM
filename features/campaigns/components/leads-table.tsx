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
  } | null;
  primary_contact: {
    full_name: string;
    job_title: string | null;
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
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left">
              <input 
                type="checkbox" 
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                checked={isAllSelected}
                onChange={handleSelectAllChange}
              />
            </th>
            <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Lead / Company</th>
            <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Contact</th>
            <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Info</th>
            <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Company Details</th>
            <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
            <th className="px-4 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">Deals</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {leads.map((item) => (
            <tr 
              key={item.id} 
              className={cn(
                "hover:bg-slate-50 transition-colors cursor-pointer group",
                selectedIds.has(item.company_id) ? "bg-blue-50/40" : ""
              )}
              onClick={() => onSelectLead(item)}
            >
              <td className="px-4 py-2 align-middle" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                  checked={selectedIds.has(item.company_id)}
                  onChange={() => onToggleLead(item.company_id)}
                />
              </td>
              <td className="px-4 py-2 align-middle">
                {item.company ? (
                  <div>
                    <span className="text-sm font-semibold text-slate-950 group-hover:text-blue-600 transition-colors text-left">
                      {item.company.name}
                    </span>
                    <p className="text-xs text-slate-500">{item.company.industry ?? "No industry"}</p>
                  </div>
                ) : (
                  <span className="text-sm text-slate-700">Unknown</span>
                )}
              </td>
              <td className="px-4 py-2 align-middle">
                {item.primary_contact ? (
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.primary_contact.full_name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-tight">{item.primary_contact.job_title ?? "Decision Maker"}</p>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400 italic">Not set</span>
                )}
              </td>
              <td className="px-4 py-2 align-middle">
                {item.primary_contact && (item.primary_contact.email || item.primary_contact.phone) ? (
                  <div className="space-y-1.5 min-w-[140px]">
                    {item.primary_contact.email && (
                      <p className="text-xs text-slate-600 flex items-center gap-1.5 truncate">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.primary_contact.email}</span>
                      </p>
                    )}
                    {item.primary_contact.phone && (
                      <p className="text-xs text-slate-600 flex items-center gap-1.5 truncate">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.primary_contact.phone}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">No contact info</span>
                )}
              </td>
              <td className="px-4 py-2 align-middle">
                <div className="space-y-1.5">
                  {item.company?.location ? (
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[120px]" title={item.company.location}>{item.company.location}</span>
                    </p>
                  ) : null}
                  {item.company?.company_size ? (
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{item.company.company_size}</span>
                    </p>
                  ) : null}
                  {!item.company?.location && !item.company?.company_size && (
                    <span className="text-xs text-slate-400 italic">No details</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-2 align-middle">
                <span className={cn(
                  "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm",
                  item.campaign_status === "Won" ? "bg-emerald-50 text-emerald-700" :
                  item.campaign_status === "Lost" ? "bg-rose-50 text-rose-700" :
                  "bg-slate-100 text-slate-700"
                )}>
                  {item.campaign_status ?? "Active"}
                </span>
              </td>
              <td className="px-4 py-2 align-middle text-center text-sm font-semibold text-slate-700">
                {item.deal_count > 0 ? (
                  <span className="text-indigo-600 font-bold">{item.deal_count}</span>
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
