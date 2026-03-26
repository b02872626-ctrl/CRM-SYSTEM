import "server-only";

import { createClient } from "@/lib/supabase/server";

const CAMPAIGNS_PAGE_SIZE = 25;
const CAMPAIGN_COMPANIES_PAGE_SIZE = 50;

export type CampaignFilters = {
  search?: string;
  status?: string;
  owner?: string;
};

type CampaignRow = Record<string, unknown>;
type ProfileRow = Record<string, unknown>;
type CompanyRow = Record<string, unknown>;
type CampaignCompanyRow = Record<string, unknown>;
type DealRow = Record<string, unknown>;
type ContactRow = Record<string, unknown>;

function getString(value: unknown) {
  return typeof value === "string" ? value : null;
}

async function getProfilesByIds(ids: string[]) {
  if (ids.length === 0) {
    return new Map<string, { id: string; full_name: string; email: string | null }>();
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").in("id", ids);

  if (error) {
    console.error("Failed to load campaign owners:", error.message);
    return new Map<string, { id: string; full_name: string; email: string | null }>();
  }

  return new Map(
    ((data ?? []) as ProfileRow[]).map((profile) => [
      String(profile.id ?? ""),
      {
        id: String(profile.id ?? ""),
        full_name: String(profile.full_name ?? profile.email ?? "Unknown user"),
        email: getString(profile.email)
      }
    ])
  );
}

export async function getCampaignFilterOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Failed to load campaign filter options:", error.message);
    return { owners: [] };
  }

  return {
    owners: ((data ?? []) as ProfileRow[]).map((profile) => ({
      id: String(profile.id ?? ""),
      full_name: String(profile.full_name ?? profile.email ?? "Unknown user")
    }))
  };
}

export async function getCampaigns(filters: CampaignFilters = {}, page = 1) {
  const supabase = await createClient();
  const from = (page - 1) * CAMPAIGNS_PAGE_SIZE;
  const to = from + CAMPAIGNS_PAGE_SIZE - 1;
  const search = (filters.search ?? "").trim();

  let campaignsQuery = supabase
    .from("campaigns")
    .select(
      "id, name, description, campaign_type, target_audience, status, owner_id, start_date, end_date, updated_at",
      { count: "exact" }
    )
    .order("updated_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    campaignsQuery = campaignsQuery.eq("status", filters.status);
  }

  if (filters.owner && filters.owner !== "all") {
    campaignsQuery = campaignsQuery.eq("owner_id", filters.owner);
  }

  if (search) {
    campaignsQuery = campaignsQuery.or(
      `name.ilike.%${search}%,description.ilike.%${search}%,target_audience.ilike.%${search}%`
    );
  }

  const campaignsResult = await campaignsQuery.range(from, to);

  if (campaignsResult.error) {
    console.error("Failed to load campaigns:", campaignsResult.error.message);
    return { items: [], totalCount: 0, pageSize: CAMPAIGNS_PAGE_SIZE };
  }

  const campaigns = (campaignsResult.data ?? []) as CampaignRow[];
  const campaignIds = campaigns.map((campaign) => String(campaign.id ?? ""));

  const ownerIds = Array.from(
    new Set(
      campaigns
        .map((campaign) => getString(campaign.owner_id))
        .filter((value): value is string => Boolean(value))
    )
  );
  const ownersById = await getProfilesByIds(ownerIds);

  const companyCounts = new Map<string, number>();

  if (campaignIds.length > 0) {
    const countPromises = campaignIds.map(async (id) => {
      const { count } = await supabase
        .from("campaign_companies")
        .select("id", { count: "exact", head: true })
        .eq("campaign_id", id);
      return { id, count: count ?? 0 };
    });
    const counts = await Promise.all(countPromises);
    for (const { id, count } of counts) {
      companyCounts.set(id, count);
    }
  }

  return {
    items: campaigns.map((campaign) => {
    const id = String(campaign.id ?? "");
    const ownerId = getString(campaign.owner_id);

    return {
      id,
      name: String(campaign.name ?? "Untitled campaign"),
      description: getString(campaign.description),
      campaign_type: getString(campaign.campaign_type),
      target_audience: getString(campaign.target_audience),
      status: String(campaign.status ?? "Draft"),
      owner: ownerId ? ownersById.get(ownerId) ?? null : null,
      start_date: getString(campaign.start_date),
      end_date: getString(campaign.end_date),
      linked_company_count: companyCounts.get(id) ?? 0
    };
    }),
    totalCount: campaignsResult.count ?? 0,
    pageSize: CAMPAIGNS_PAGE_SIZE
  };
}

export async function getCampaignById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("campaigns").select("*").eq("id", id).maybeSingle();

  if (error) {
    console.error(`Failed to load campaign ${id}:`, error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  const campaign = data as CampaignRow;
  const ownerId = getString(campaign.owner_id);
  const ownersById = await getProfilesByIds(ownerId ? [ownerId] : []);

  return {
    id: String(campaign.id ?? id),
    name: String(campaign.name ?? "Untitled campaign"),
    description: getString(campaign.description),
    campaign_type: getString(campaign.campaign_type),
    target_audience: getString(campaign.target_audience),
    status: String(campaign.status ?? "Draft"),
    owner_id: ownerId,
    owner: ownerId ? ownersById.get(ownerId) ?? null : null,
    start_date: getString(campaign.start_date),
    end_date: getString(campaign.end_date),
    notes: getString(campaign.notes)
  };
}

export async function getCampaignCompanies(campaignId: string, page = 1) {
  const supabase = await createClient();
  const from = (page - 1) * CAMPAIGN_COMPANIES_PAGE_SIZE;
  const to = from + CAMPAIGN_COMPANIES_PAGE_SIZE - 1;

  const { data: links, error: linksError, count } = await supabase
    .from("campaign_companies")
    .select("*", { count: "exact" })
    .eq("campaign_id", campaignId)
    .order("added_at", { ascending: false })
    .range(from, to);

  if (linksError) {
    console.error(`Failed to load campaign companies for ${campaignId}:`, linksError.message);
    return { items: [], totalCount: 0, pageSize: CAMPAIGN_COMPANIES_PAGE_SIZE };
  }

  const companyIds = Array.from(
    new Set(
      ((links ?? []) as CampaignCompanyRow[])
        .map((link) => getString(link.company_id))
        .filter((value): value is string => Boolean(value))
    )
  );

  if (companyIds.length === 0) {
    return { items: [], totalCount: count ?? 0, pageSize: CAMPAIGN_COMPANIES_PAGE_SIZE };
  }

  const [
    { data: companies, error: companiesError },
    { data: deals, error: dealsError },
    { data: contacts, error: contactsError }
  ] =
    await Promise.all([
      supabase.from("companies").select("*").in("id", companyIds),
      supabase.from("deals").select("company_id").in("company_id", companyIds),
      supabase.from("contacts").select("*").in("company_id", companyIds).order("created_at", { ascending: true })
    ]);

  if (companiesError) {
    console.error(`Failed to load linked companies for campaign ${campaignId}:`, companiesError.message);
    return { items: [], totalCount: 0, pageSize: CAMPAIGN_COMPANIES_PAGE_SIZE };
  }

  if (dealsError) {
    console.error(`Failed to load linked deals for campaign ${campaignId}:`, dealsError.message);
  }

  if (contactsError) {
    console.error(`Failed to load linked contacts for campaign ${campaignId}:`, contactsError.message);
  }

  const companiesById = new Map(
    ((companies ?? []) as CompanyRow[]).map((company) => [String(company.id ?? ""), company])
  );
  const dealsCountByCompany = new Map<string, number>();
  const primaryContactByCompany = new Map<
    string,
    { full_name: string; job_title: string | null; email: string | null; phone: string | null }
  >();

  for (const deal of (deals ?? []) as DealRow[]) {
    const companyId = String(deal.company_id ?? "");
    dealsCountByCompany.set(companyId, (dealsCountByCompany.get(companyId) ?? 0) + 1);
  }

  for (const contact of (contacts ?? []) as ContactRow[]) {
    const companyId = String(contact.company_id ?? "");

    if (!primaryContactByCompany.has(companyId)) {
      primaryContactByCompany.set(companyId, {
        full_name: String(contact.full_name ?? "Primary Contact"),
        job_title: getString(contact.job_title),
        email: getString(contact.email),
        phone: getString(contact.phone)
      });
    }
  }

  const items = ((links ?? []) as CampaignCompanyRow[]).map((link) => {
    const companyId = String(link.company_id ?? "");
    const company = companiesById.get(companyId);

    return {
      id: String(link.id ?? ""),
      company_id: companyId,
      campaign_status: getString(link.campaign_status),
      added_at: getString(link.added_at),
      notes: getString(link.notes),
      company: company
        ? {
            id: String(company.id ?? companyId),
            name: String(company.company_name ?? company.domain ?? "Untitled company"),
            industry: getString(company.industry),
            company_size: getString(company.company_size),
            location: getString(company.location),
            source: getString(company.source),
            priority: getString(company.priority),
            status: String(company.status ?? "Unknown")
          }
        : null,
      primary_contact: primaryContactByCompany.get(companyId) ?? null,
      deal_count: dealsCountByCompany.get(companyId) ?? 0
    };
  });

  return {
    items,
    totalCount: count ?? 0,
    pageSize: CAMPAIGN_COMPANIES_PAGE_SIZE
  };
}

export async function getCampaignMetrics(campaignId: string) {
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("campaign_companies")
    .select("company_id, campaign_status, companies(status)")
    .eq("campaign_id", campaignId);

  const validLinks = (links ?? []) as Array<{
    company_id: string;
    campaign_status: string | null;
    companies: { status: string } | null;
  }>;

  const linkedCompanyCount = validLinks.length;
  const qualifiedCompanyCount = validLinks.filter((item) => {
    const companyStatus = item.companies?.status?.toLowerCase();
    const campaignStatus = item.campaign_status?.toLowerCase();
    return companyStatus === "qualified" || campaignStatus === "qualified";
  }).length;

  const companyIds = Array.from(new Set(validLinks.map((l) => l.company_id)));

  let dealsCreatedCount = 0;
  if (companyIds.length > 0) {
    const chunkSize = 500;
    for (let i = 0; i < companyIds.length; i += chunkSize) {
      const chunk = companyIds.slice(i, i + chunkSize);
      const { count } = await supabase
        .from("deals")
        .select("id", { count: "exact", head: true })
        .in("company_id", chunk);
      dealsCreatedCount += count ?? 0;
    }
  }

  return {
    linkedCompanyCount,
    qualifiedCompanyCount,
    dealsCreatedCount
  };
}

export async function getAvailableCompaniesForCampaign(campaignId: string) {
  const supabase = await createClient();
  const [{ data: companies, error: companiesError }, { data: links, error: linksError }] =
    await Promise.all([
      supabase.from("companies").select("*").order("updated_at", { ascending: false }),
      supabase.from("campaign_companies").select("*").eq("campaign_id", campaignId)
    ]);

  if (companiesError) {
    console.error(`Failed to load available companies for campaign ${campaignId}:`, companiesError.message);
    return [];
  }

  if (linksError) {
    console.error(`Failed to load existing campaign links for ${campaignId}:`, linksError.message);
  }

  const linkedCompanyIds = new Set(
    ((links ?? []) as CampaignCompanyRow[])
      .map((link) => getString(link.company_id))
      .filter((value): value is string => Boolean(value))
  );

  return ((companies ?? []) as CompanyRow[])
    .filter((company) => !linkedCompanyIds.has(String(company.id ?? "")))
    .map((company) => ({
      id: String(company.id ?? ""),
      name: String(company.name ?? company.domain ?? "Untitled company"),
      industry: getString(company.industry),
      country: getString(company.country)
    }));
}

export async function getCampaignFormData(id?: string) {
  const [owners, campaign] = await Promise.all([
    getCampaignFilterOptions(),
    id ? getCampaignById(id) : Promise.resolve(null)
  ]);

  return {
    owners: owners.owners,
    campaign
  };
}

export async function getCompanyCampaigns(companyId: string) {
  const supabase = await createClient();
  const { data: links, error: linksError } = await supabase
    .from("campaign_companies")
    .select("*")
    .eq("company_id", companyId)
    .order("added_at", { ascending: false });

  if (linksError) {
    console.error(`Failed to load campaigns for company ${companyId}:`, linksError.message);
    return [];
  }

  const campaignIds = Array.from(
    new Set(
      ((links ?? []) as CampaignCompanyRow[])
        .map((link) => getString(link.campaign_id))
        .filter((value): value is string => Boolean(value))
    )
  );

  if (campaignIds.length === 0) {
    return [];
  }

  const { data: campaigns, error: campaignsError } = await supabase
    .from("campaigns")
    .select("*")
    .in("id", campaignIds);

  if (campaignsError) {
    console.error(`Failed to load campaign records for company ${companyId}:`, campaignsError.message);
    return [];
  }

  const campaignsById = new Map(
    ((campaigns ?? []) as CampaignRow[]).map((campaign) => [String(campaign.id ?? ""), campaign])
  );

  return ((links ?? []) as CampaignCompanyRow[]).map((link) => {
    const campaign = campaignsById.get(String(link.campaign_id ?? ""));

    return {
      id: String(link.id ?? ""),
      campaign_id: String(link.campaign_id ?? ""),
      campaign_status: getString(link.campaign_status),
      added_at: getString(link.added_at),
      notes: getString(link.notes),
      campaign: campaign
        ? {
            id: String(campaign.id ?? ""),
            name: String(campaign.name ?? "Untitled campaign"),
            status: String(campaign.status ?? "Draft"),
            campaign_type: getString(campaign.campaign_type)
          }
        : null
    };
  });
}

export async function getAvailableCampaignsForCompany(companyId: string) {
  const supabase = await createClient();
  const [{ data: campaigns, error: campaignsError }, { data: links, error: linksError }] =
    await Promise.all([
      supabase.from("campaigns").select("*").order("updated_at", { ascending: false }),
      supabase.from("campaign_companies").select("*").eq("company_id", companyId)
    ]);

  if (campaignsError) {
    console.error(`Failed to load available campaigns for company ${companyId}:`, campaignsError.message);
    return [];
  }

  if (linksError) {
    console.error(`Failed to load company campaign links for ${companyId}:`, linksError.message);
  }

  const linkedCampaignIds = new Set(
    ((links ?? []) as CampaignCompanyRow[])
      .map((link) => getString(link.campaign_id))
      .filter((value): value is string => Boolean(value))
  );

  return ((campaigns ?? []) as CampaignRow[])
    .filter((campaign) => !linkedCampaignIds.has(String(campaign.id ?? "")))
    .map((campaign) => ({
      id: String(campaign.id ?? ""),
      name: String(campaign.name ?? "Untitled campaign"),
      status: String(campaign.status ?? "Draft")
    }));
}
