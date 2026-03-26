import Link from "next/link";
import { DealStageBadge, DealUrgencyBadge } from "@/features/deals/components/deal-badges";
import { DealStatusForm } from "@/features/deals/components/deal-status-form";
import { formatEnumLabel } from "@/features/deals/constants";

type DealRow = {
  id: string;
  title: string;
  number_of_hires: number;
  seniority: string;
  urgency: string;
  stage: string;
  value: number | null;
  currency: string;
  expected_close_date: string | null;
  company: { id: string; name: string } | { id: string; name: string }[] | null;
  recruiter:
    | { id: string; full_name: string | null }
    | { id: string; full_name: string | null }[]
    | null;
};

function getSingleRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function formatCurrency(value: number | null, currency: string) {
  if (value === null) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(value);
}

export function DealsTable({ deals }: { deals: DealRow[] }) {
  if (deals.length === 0) {
    return (
      <div className="crm-empty-state">
        <h3 className="text-base font-semibold text-slate-950">No deals match these filters</h3>
        <p className="mt-1 text-sm text-slate-600">
          Try a different filter set or create a new hiring request.
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
              <th className="crm-table-th">Role</th>
              <th className="crm-table-th">Company</th>
              <th className="crm-table-th">Hires</th>
              <th className="crm-table-th">Seniority</th>
              <th className="crm-table-th">Urgency</th>
              <th className="crm-table-th">Status</th>
              <th className="crm-table-th">Recruiter</th>
              <th className="crm-table-th">Revenue</th>
              <th className="crm-table-th">Expected Close</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => {
              const company = getSingleRelation(deal.company);
              const recruiter = getSingleRelation(deal.recruiter);

              return (
                <tr key={deal.id} className="crm-table-row">
                  <td className="crm-table-td">
                    <Link href={`/deals/${deal.id}`} className="font-medium text-slate-950 hover:underline">
                      {deal.title}
                    </Link>
                  </td>
                  <td className="crm-table-td">
                    {company?.name ?? "Unlinked company"}
                  </td>
                  <td className="crm-table-td">{deal.number_of_hires}</td>
                  <td className="crm-table-td">
                    {formatEnumLabel(deal.seniority)}
                  </td>
                  <td className="crm-table-td">
                    <DealUrgencyBadge urgency={deal.urgency} />
                  </td>
                  <td className="crm-table-td">
                    <div className="space-y-1">
                      <DealStageBadge stage={deal.stage} />
                      <DealStatusForm
                        dealId={deal.id}
                        currentStage={deal.stage}
                        returnPath="/deals"
                      />
                    </div>
                  </td>
                  <td className="crm-table-td">
                    {recruiter?.full_name ?? "Unassigned"}
                  </td>
                  <td className="crm-table-td">
                    {formatCurrency(deal.value, deal.currency)}
                  </td>
                  <td className="crm-table-td">
                    {deal.expected_close_date ?? "Not set"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
