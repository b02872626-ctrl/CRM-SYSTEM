"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { deleteCampaignAction } from "@/features/campaigns/actions";

type CampaignRow = {
  id: string;
  name: string;
  campaign_type: string | null;
  target_audience: string | null;
  status: string;
  owner: { id: string; full_name: string; email: string | null } | null;
  start_date: string | null;
  end_date: string | null;
  linked_company_count: number;
};

// ... (formatDate function remains if needed, but it wasn't used in the main render shown)
function formatDate(value: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric", month: "short", day: "numeric"
  }).format(new Date(value));
}

export function CampaignsTable({ campaigns }: { campaigns: CampaignRow[] }) {
  if (campaigns.length === 0) {
    return (
      <div className="crm-empty-state">
        <h3 className="text-base font-semibold text-white">No campaigns match these filters</h3>
        <p className="mt-1 text-sm text-white/50">
          Try another filter set or create a new campaign.
        </p>
      </div>
    );
  }

  return (
    <div className="crm-table-shell">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="crm-table-head">
            <tr>
              <th className="crm-table-th text-white/40">Campaign</th>
              <th className="crm-table-th text-white/40">Status</th>
              <th className="crm-table-th text-white/40">Owner</th>
              <th className="crm-table-th text-white/40">Companies</th>
              <th className="crm-table-th w-10"></th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="crm-table-row group relative">
                <td className="crm-table-td">
                  <Link 
                     href={`/campaigns/${campaign.id}`} 
                     className="font-medium text-white hover:text-white/60 after:absolute after:inset-0 after:z-10"
                   >
                     {campaign.name}
                   </Link>
                </td>
                <td className="crm-table-td relative z-20 pointer-events-none text-white/70">{campaign.status}</td>
                <td className="crm-table-td relative z-20 pointer-events-none text-white/50">{campaign.owner?.full_name ?? "Unassigned"}</td>
                <td className="crm-table-td relative z-20 pointer-events-none font-medium text-white/70">{campaign.linked_company_count}</td>
                <td className="crm-table-td relative z-30 text-right">
                  <form 
                    action={deleteCampaignAction} 
                    onSubmit={(e) => {
                      if (!confirm(`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`)) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="id" value={campaign.id} />
                    <button 
                      type="submit" 
                      className="p-1.5 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                      title="Delete Campaign"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
