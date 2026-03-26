import Link from "next/link";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { getCompanies } from "@/features/companies/queries";

function getSingleRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

type CompaniesPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const companiesResult = await getCompanies(page);
  const companies = companiesResult.items as Array<{
    id: string;
    name: string;
    industry: string | null;
    country: string | null;
    status: string;
    owner:
      | { id: string; full_name: string | null }
      | { id: string; full_name: string | null }[]
      | null;
  }>;

  return (
    <section className="crm-page">
      <div className="crm-page-header">
        <div>
          <p className="crm-page-kicker">Target Companies</p>
          <h2 className="crm-page-title">Companies</h2>
          <p className="crm-page-copy">
            Review target accounts and open each company to log follow-ups and see activity.
          </p>
        </div>

        <Link href="/companies/new" className="crm-primary-button">
          Add Company
        </Link>
      </div>

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
              {companies.map((company) => {
                const owner = getSingleRelation(company.owner);

                return (
                  <tr key={company.id} className="crm-table-row">
                    <td className="crm-table-td">
                      <Link href={`/companies/${company.id}`} className="font-medium text-slate-950 hover:underline">
                        {company.name}
                      </Link>
                    </td>
                    <td className="crm-table-td">{company.industry ?? "Not set"}</td>
                    <td className="crm-table-td">{company.country ?? "Not set"}</td>
                    <td className="crm-table-td">{company.status}</td>
                    <td className="crm-table-td">{owner?.full_name ?? "Unassigned"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationControls
        basePath="/companies"
        page={page}
        pageSize={companiesResult.pageSize}
        totalCount={companiesResult.totalCount}
      />
    </section>
  );
}
