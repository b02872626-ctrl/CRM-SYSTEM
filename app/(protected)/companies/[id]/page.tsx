import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityForm } from "@/features/activities/components/activity-form";
import { ActivityTimeline } from "@/features/activities/components/activity-timeline";
import { linkCompanyToCampaignAction } from "@/features/campaigns/actions";
import {
  getAvailableCampaignsForCompany,
  getCompanyActivities,
  getCompanyById,
  getCompanyCampaigns,
  getCompanyContacts,
  getCompanyDeals
} from "@/features/companies/queries";

function getSingleRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

type CompanyDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { id } = await params;
  const data = await Promise.all([
    getCompanyById(id),
    getCompanyDeals(id),
    getCompanyActivities(id),
    getCompanyCampaigns(id),
    getAvailableCampaignsForCompany(id),
    getCompanyContacts(id)
  ]).catch(() => null);

  if (!data) {
    notFound();
  }

  const company = data[0] as {
    id: string;
    name: string;
    industry: string | null;
    country: string | null;
    company_size: string | null;
    status: string;
    website: string | null;
    notes: string | null;
    owner:
      | { id: string; full_name: string | null; email: string | null }
      | { id: string; full_name: string | null; email: string | null }[]
      | null;
  };

  if (!company) {
    notFound();
  }

  const deals = data[1] as Array<{
    id: string;
    title: string;
    stage: string;
    urgency: string;
    number_of_hires: number;
  }>;
  const activities = data[2] as Array<{
    id: string;
    activity_type: string;
    summary: string;
    details: string | null;
    created_at: string;
    due_at?: string | null;
    profile:
      | { id: string; full_name: string }
      | { id: string; full_name: string }[]
      | null;
    deal?: { id: string; title: string } | { id: string; title: string }[] | null;
  }>;
  const campaigns = data[3] as Array<{
    id: string;
    campaign_status: string | null;
    added_at: string | null;
    notes: string | null;
    campaign: {
      id: string;
      name: string;
      status: string;
      campaign_type: string | null;
    } | null;
  }>;
  const availableCampaigns = data[4] as Array<{
    id: string;
    name: string;
    status: string;
  }>;
  const contacts = data[5] as Array<{
    id: string;
    full_name: string;
    job_title: string | null;
    email: string | null;
    phone: string | null;
    status: string;
  }>;
  const owner = getSingleRelation(company.owner);

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Company
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">{company.name}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {company.industry ?? "No industry"} | {company.country ?? "No country"} | Owner:{" "}
          {owner?.full_name ?? "Unassigned"}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Company details</h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status</dt>
                <dd className="mt-1 text-sm text-slate-800">{company.status}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Company size</dt>
                <dd className="mt-1 text-sm text-slate-800">{company.company_size ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Website</dt>
                <dd className="mt-1 text-sm text-slate-800">
                  {company.website ? (
                    <a href={company.website} target="_blank" rel="noreferrer" className="hover:underline">
                      {company.website}
                    </a>
                  ) : (
                    "Not set"
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-6 border-t border-slate-200 pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Notes</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {company.notes ?? "No notes added yet."}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-950">Contacts</h3>
              <span className="text-sm text-slate-500">{contacts.length}</span>
            </div>
            <div className="mt-4 space-y-3">
              {contacts.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-600">
                  No contacts linked to this company yet.
                </div>
              ) : (
                contacts.map((contact) => (
                  <div key={contact.id} className="rounded-md border border-slate-200 p-4">
                    <p className="font-medium text-slate-950">{contact.full_name}</p>
                    {contact.job_title && (
                      <p className="text-xs text-slate-500 uppercase tracking-tight mt-0.5">{contact.job_title}</p>
                    )}
                    <div className="mt-2 space-y-1">
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          ✉ {contact.email}
                        </a>
                      )}
                      {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="text-xs text-slate-600 flex items-center gap-1">
                          📞 {contact.phone}
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-950">Linked deals</h3>
              <span className="text-sm text-slate-500">{deals.length}</span>
            </div>
            <div className="mt-4 space-y-3">
              {deals.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-600">
                  No deals linked to this company yet.
                </div>
              ) : (
                deals.map((deal) => (
                  <div key={deal.id} className="rounded-md border border-slate-200 p-4">
                    <Link href={`/deals/${deal.id}`} className="font-medium text-slate-950 hover:underline">
                      {deal.title}
                    </Link>
                    <p className="mt-1 text-sm text-slate-600">
                      {deal.stage} | {deal.urgency} urgency | {deal.number_of_hires} hires
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-950">Linked campaigns</h3>
              <span className="text-sm text-slate-500">{campaigns.length}</span>
            </div>

            <div className="mt-4 space-y-3">
              {campaigns.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-600">
                  This company is not linked to a campaign yet.
                </div>
              ) : (
                campaigns.map((item) => (
                  <div key={item.id} className="rounded-md border border-slate-200 p-4">
                    {item.campaign ? (
                      <Link href={`/campaigns/${item.campaign.id}`} className="font-medium text-slate-950 hover:underline">
                        {item.campaign.name}
                      </Link>
                    ) : (
                      <p className="font-medium text-slate-950">Unknown campaign</p>
                    )}
                    <p className="mt-1 text-sm text-slate-600">
                      {item.campaign?.campaign_type ?? "No type"} | {item.campaign?.status ?? "Unknown"} | Link status:{" "}
                      {item.campaign_status ?? "Added"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <ActivityTimeline
            title="Activity timeline"
            items={activities}
            emptyMessage="No activity logged for this company yet."
          />
        </div>

        <div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-950">Add to campaign</h3>
              <span className="text-sm text-slate-500">{availableCampaigns.length} available</span>
            </div>

            {availableCampaigns.length === 0 ? (
              <div className="mt-4 rounded-md border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-600">
                This company is already linked to every available campaign.
              </div>
            ) : (
              <form action={linkCompanyToCampaignAction} className="mt-4 space-y-3">
                <input type="hidden" name="company_id" value={company.id} />

                <div className="space-y-1">
                  <label htmlFor="campaign_id" className="text-sm font-medium text-slate-700">
                    Campaign
                  </label>
                  <select
                    id="campaign_id"
                    name="campaign_id"
                    defaultValue=""
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                    required
                  >
                    <option value="" disabled>
                      Select a campaign
                    </option>
                    {availableCampaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name} ({campaign.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="campaign_status" className="text-sm font-medium text-slate-700">
                    Link status
                  </label>
                  <input
                    id="campaign_status"
                    name="campaign_status"
                    defaultValue="Added"
                    className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="notes" className="text-sm font-medium text-slate-700">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Optional note for this campaign link"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-10 items-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white"
                >
                  Link company
                </button>
              </form>
            )}
          </div>

          <ActivityForm target={{ companyId: company.id }} returnPath={`/companies/${company.id}`} />
        </div>
      </div>
    </section>
  );
}
