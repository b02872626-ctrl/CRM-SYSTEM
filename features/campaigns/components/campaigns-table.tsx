import Link from "next/link";

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

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function CampaignsTable({ campaigns }: { campaigns: CampaignRow[] }) {
  if (campaigns.length === 0) {
    return (
      <div className="crm-empty-state">
        <h3 className="text-base font-semibold text-slate-950">No campaigns match these filters</h3>
        <p className="mt-1 text-sm text-slate-600">
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
              <th className="crm-table-th">Campaign</th>
              <th className="crm-table-th">Status</th>
              <th className="crm-table-th">Owner</th>
              <th className="crm-table-th">Companies</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="crm-table-row group relative">
                <td className="crm-table-td">
                  <Link 
                    href={`/campaigns/${campaign.id}`} 
                    className="font-medium text-slate-950 hover:underline after:absolute after:inset-0 after:z-10"
                  >
                    {campaign.name}
                  </Link>
                </td>
                <td className="crm-table-td relative z-20 pointer-events-none">{campaign.status}</td>
                <td className="crm-table-td relative z-20 pointer-events-none">{campaign.owner?.full_name ?? "Unassigned"}</td>
                <td className="crm-table-td relative z-20 pointer-events-none">{campaign.linked_company_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
