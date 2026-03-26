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
      "id, name, description, campaign_type, target_audience, status, owner_id, start_date, end_date, updated_at, owner:profiles(id, full_name, email)",
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

  const campaigns = (campaignsResult.data ?? []) as any[];
  const campaignIds = campaigns.map((campaign) => String(campaign.id ?? ""));

  const companyCounts = new Map<string, number>();

  if (campaignIds.length > 0) {
    const { data: countsResult, error: countsError } = await (supabase as any)
      .from("view_campaign_stats")
      .select("campaign_id, lead_count")
      .in("campaign_id", campaignIds);

    if (countsError) {
      console.error("Failed to load aggregated campaign counts via view:", countsError.message);
    } else {
      for (const row of (countsResult ?? []) as Array<{
        campaign_id: string;
        lead_count: number;
      }>) {
        companyCounts.set(row.campaign_id, row.lead_count);
      }
    }
  }

  return {
    items: campaigns.map((campaign) => {
      const id = String(campaign.id ?? "");
      return {
        id,
        name: String(campaign.name ?? "Untitled campaign"),
        description: getString(campaign.description),
        campaign_type: getString(campaign.campaign_type),
        target_audience: getString(campaign.target_audience),
        status: String(campaign.status ?? "Draft"),
        owner: campaign.owner ?? null,
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
  const { data, error } = await supabase
    .from("campaigns")
    .select("*, owner:profiles(id, full_name, email)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`Failed to load campaign ${id}:`, error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  const campaign = data as any;
  const ownerId = getString(campaign.owner_id);

  return {
    id: String(campaign.id ?? id),
    name: String(campaign.name ?? "Untitled campaign"),
    description: getString(campaign.description),
    campaign_type: getString(campaign.campaign_type),
    target_audience: getString(campaign.target_audience),
    status: String(campaign.status ?? "Draft"),
    owner_id: ownerId,
    owner: campaign.owner ?? null,
    start_date: getString(campaign.start_date),
    end_date: getString(campaign.end_date),
    notes: getString(campaign.notes)
  };
}

export async function getCampaignCompanies(campaignId: string, page = 1) {
  const supabase = await createClient();
  const from = (page - 1) * CAMPAIGN_COMPANIES_PAGE_SIZE;
  const to = from + CAMPAIGN_COMPANIES_PAGE_SIZE - 1;

  // Use a JOIN to get everything in one go - more efficient and avoids mapping errors
  const { data: links, error: linksError, count } = await supabase
    .from("campaign_companies")
    .select(`
      *,
      company:companies(*),
      contacts:contacts(*)
    `, { count: "exact" })
    .eq("campaign_id", campaignId)
    .order("added_at", { ascending: false })
    .range(from, to);

  if (linksError) {
    console.error(`Failed to load campaign companies for ${campaignId}:`, linksError.message);
    return { items: [], totalCount: 0, pageSize: CAMPAIGN_COMPANIES_PAGE_SIZE };
  }

  if (!links || links.length === 0) {
    return { items: [], totalCount: count ?? 0, pageSize: CAMPAIGN_COMPANIES_PAGE_SIZE };
  }

  // Get deals count for these companies in one batch
  const companyIds = (links as any[]).map(l => String(l.company_id)).filter(Boolean);
  const { data: deals } = await supabase
    .from("deals")
    .select("company_id")
    .in("company_id", companyIds);

  const dealsCountByCompany = new Map<string, number>();
  for (const deal of (deals ?? []) as DealRow[]) {
    const cid = String(deal.company_id ?? "");
    dealsCountByCompany.set(cid, (dealsCountByCompany.get(cid) ?? 0) + 1);
  }

  const items = (links as any[]).map((link) => {
    const company = link.company;
    const companyId = String(link.company_id ?? "");
    
    // Pick first contact as primary
    const contactList = link.contacts as any[];
    const primaryContact = contactList && contactList.length > 0 
      ? {
          full_name: String(contactList[0].full_name ?? "Primary Contact"),
          job_title: getString(contactList[0].job_title),
          email: getString(contactList[0].email),
          phone: getString(contactList[0].phone)
        }
      : null;

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
      primary_contact: primaryContact,
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

  // Use the RPC for hardware-accelerated counts
  const { data, error } = await (supabase as any).rpc("get_campaign_metrics_v2", {
    p_campaign_id: campaignId
  });

  if (error || !data || data.length === 0) {
    console.error(`Failed to load campaign metrics via RPC for ${campaignId}:`, error?.message);
    return {
      linkedCompanyCount: 0,
      qualifiedCompanyCount: 0,
      dealsCreatedCount: 0
    };
  }

  const metrics = data[0] as {
    linked_company_count: number;
    qualified_company_count: number;
    deals_created_count: number;
  };

  return {
    linkedCompanyCount: metrics.linked_company_count,
    qualifiedCompanyCount: metrics.qualified_company_count,
    dealsCreatedCount: metrics.deals_created_count
  };
}

export async function getAvailableCompaniesForCampaign(campaignId: string) {
  const supabase = await createClient();
  const [{ data: companies, error: companiesError }, { data: links, error: linksError }] =
    await Promise.all([
      supabase.from("companies").select("*").order("updated_at", { ascending: false }).limit(100),
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
