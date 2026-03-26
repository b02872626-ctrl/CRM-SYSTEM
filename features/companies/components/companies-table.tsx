import Link from "next/link";

type CompanyRow = {
  id: string;
  name: string;
  industry: string | null;
  country: string | null;
  status: string;
  owner?: { id: string; full_name: string } | null;
};

export function CompaniesTable({ companies }: { companies: CompanyRow[] }) {
  if (companies.length === 0) {
    return (
      <div className="crm-empty-state">
        <h3 className="text-base font-semibold text-slate-950">No companies found</h3>
        <p className="mt-1 text-sm text-slate-600">
          Try creating a new company to get started.
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
              <th className="crm-table-th">Company</th>
              <th className="crm-table-th">Industry</th>
              <th className="crm-table-th">Country</th>
              <th className="crm-table-th">Status</th>
              <th className="crm-table-th">Owner</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="crm-table-row group relative">
                <td className="crm-table-td">
                  <Link 
                    href={`/companies/${company.id}`} 
                    className="font-medium text-slate-950 hover:underline text-sm after:absolute after:inset-0 after:z-10"
                  >
                    {company.name}
                  </Link>
                </td>
                <td className="crm-table-td text-sm">{company.industry ?? "Not set"}</td>
                <td className="crm-table-td text-sm text-slate-600">{company.country ?? "Not set"}</td>
                <td className="crm-table-td">
                    <span className="inline-flex items-center rounded-sm bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200 uppercase tracking-wider">
                        {company.status}
                    </span>
                </td>
                <td className="crm-table-td text-sm text-slate-600">
                  {company.owner?.full_name ?? "Unassigned"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
