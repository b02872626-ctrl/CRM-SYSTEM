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
    role_title: string | null;
    email: string | null;
    phone: string | null;
    status: string;
  }>;
  const owner = getSingleRelation(company.owner);

  return (
    <section className="space-y-6">
      <div className="crm-stat-card">
        <p className="crm-label">
          Company
        </p>
        <h2 className="crm-page-title mt-2">{company.name}</h2>
        <p className="crm-page-copy mt-1">
          {company.industry ?? "No industry"} | {company.country ?? "No country"} | Owner:{" "}
          <span className="text-white/90">{owner?.full_name ?? "Unassigned"}</span>
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="crm-stat-card h-auto">
            <h3 className="text-lg font-bold text-white tracking-tight">Company details</h3>
            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="crm-field">
                <dt className="crm-label">Status</dt>
                <dd className="mt-1 text-sm font-semibold text-white/70">{company.status}</dd>
              </div>
              <div className="crm-field">
                <dt className="crm-label">Company size</dt>
                <dd className="mt-1 text-sm font-semibold text-white/70">{company.company_size ?? "Not set"}</dd>
              </div>
              <div className="crm-field">
                <dt className="crm-label">Website</dt>
                <dd className="mt-1 text-sm font-semibold text-white/70">
                  {company.website ? (
                    <a href={company.website} target="_blank" rel="noreferrer" className="text-[#2383E2] hover:underline transition-all">
                      {company.website}
                    </a>
                  ) : (
                    "Not set"
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-8 border-t border-white/5 pt-6">
              <p className="crm-label">Notes</p>
              <p className="mt-3 text-sm leading-relaxed text-white/40">
                {company.notes ?? "No notes added yet."}
              </p>
            </div>
          </div>

          <div className="crm-stat-card h-auto">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-white tracking-tight">Contacts</h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20 bg-white/5 px-2 py-0.5 rounded-lg">{contacts.length}</span>
            </div>
            <div className="mt-6 space-y-4">
              {contacts.length === 0 ? (
                <div className="crm-empty-state py-8">
                  <p className="text-sm text-white/40">No contacts linked to this company yet.</p>
                </div>
              ) : (
                contacts.map((contact) => (
                  <div key={contact.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 transition-colors">
                    <p className="font-bold text-white">{contact.full_name}</p>
                    {contact.role_title && (
                      <p className="crm-label mt-1 lowercase first-letter:uppercase tracking-normal font-medium">{contact.role_title}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-4">
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="text-xs text-[#2383E2] hover:underline flex items-center gap-1.5 font-medium transition-all">
                          <span className="text-[10px]">✉</span> {contact.email}
                        </a>
                      )}
                      {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="text-xs text-white/40 hover:text-white flex items-center gap-1.5 transition-colors font-medium">
                          <span className="text-[10px]">📞</span> {contact.phone}
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="crm-stat-card h-auto">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-white tracking-tight">Linked deals</h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20 bg-white/5 px-2 py-0.5 rounded-lg">{deals.length}</span>
            </div>
            <div className="mt-6 space-y-4">
              {deals.length === 0 ? (
                <div className="crm-empty-state py-8">
                  <p className="text-sm text-white/40">No deals linked to this company yet.</p>
                </div>
              ) : (
                deals.map((deal) => (
                  <div key={deal.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 transition-colors">
                    <Link href={`/deals/${deal.id}`} className="font-bold text-white hover:text-[#2383E2] transition-all">
                      {deal.title}
                    </Link>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.15em] text-white/20 flex items-center gap-2">
                       <span className="text-white/40">{deal.stage}</span> 
                       <span className="w-1 h-1 rounded-full bg-white/10"></span>
                       <span>{deal.urgency} urgency</span>
                       <span className="w-1 h-1 rounded-full bg-white/10"></span>
                       <span>{deal.number_of_hires} hires</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="crm-stat-card h-auto">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-white tracking-tight">Linked campaigns</h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20 bg-white/5 px-2 py-0.5 rounded-lg">{campaigns.length}</span>
            </div>

            <div className="mt-6 space-y-4">
              {campaigns.length === 0 ? (
                <div className="crm-empty-state py-8">
                  <p className="text-sm text-white/40">This company is not linked to a campaign yet.</p>
                </div>
              ) : (
                campaigns.map((item) => (
                  <div key={item.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 transition-colors">
                    {item.campaign ? (
                      <Link href={`/campaigns/${item.campaign.id}`} className="font-bold text-white hover:text-[#2383E2] transition-colors">
                        {item.campaign.name}
                      </Link>
                    ) : (
                      <p className="font-bold text-white">Unknown campaign</p>
                    )}
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.15em] text-white/20 flex items-center gap-2">
                      <span className="text-white/40">{item.campaign?.campaign_type ?? "No type"}</span>
                      <span className="w-1 h-1 rounded-full bg-white/10"></span>
                      <span>{item.campaign?.status ?? "Unknown"}</span>
                      <span className="w-1 h-1 rounded-full bg-white/10"></span>
                      <span>{item.campaign_status ?? "Added"}</span>
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

        <div className="space-y-6">
          <div className="crm-stat-card h-auto">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-white tracking-tight">Add to campaign</h3>
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{availableCampaigns.length} available</span>
            </div>

            {availableCampaigns.length === 0 ? (
              <div className="mt-6 crm-empty-state py-8">
                <p className="text-sm text-white/40">This company is already linked to every available campaign.</p>
              </div>
            ) : (
              <form action={linkCompanyToCampaignAction} className="mt-6 space-y-5">
                <input type="hidden" name="company_id" value={company.id} />

                <div className="crm-field">
                  <label htmlFor="campaign_id" className="crm-label">
                    Campaign
                  </label>
                  <select
                    id="campaign_id"
                    name="campaign_id"
                    defaultValue=""
                    className="crm-select"
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

                <div className="crm-field">
                  <label htmlFor="campaign_status" className="crm-label">
                    Link status
                  </label>
                  <input
                    id="campaign_status"
                    name="campaign_status"
                    defaultValue="Added"
                    className="crm-input"
                  />
                </div>

                <div className="crm-field">
                  <label htmlFor="notes" className="crm-label">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="crm-input h-auto py-2"
                    placeholder="Optional note for this campaign link"
                  />
                </div>

                <button
                  type="submit"
                  className="crm-primary-button w-full justify-center"
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
