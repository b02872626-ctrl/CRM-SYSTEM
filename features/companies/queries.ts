import "server-only";

import { createClient } from "@/lib/supabase/server";

const COMPANIES_PAGE_SIZE = 25;

export async function getCompanies(page = 1) {
  const supabase = await createClient();
  const from = (page - 1) * COMPANIES_PAGE_SIZE;
  const to = from + COMPANIES_PAGE_SIZE - 1;
  const { data, error, count } = await supabase
    .from("companies")
    .select("*", {
      count: "exact"
    })
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) {
    return { items: [], totalCount: 0, pageSize: COMPANIES_PAGE_SIZE };
  }

  return {
    items: ((data ?? []) as Array<Record<string, unknown>>).map((company) => ({
      id: String(company.id ?? ""),
      name: String(company.company_name ?? company.name ?? company.domain ?? "Untitled company"),
      industry: typeof company.industry === "string" ? company.industry : null,
      country:
        typeof company.country === "string"
          ? company.country
          : typeof company.location === "string"
            ? company.location
            : null,
      status: String(company.status ?? "Unknown"),
      owner: null
    })),
    totalCount: count ?? 0,
    pageSize: COMPANIES_PAGE_SIZE
  };
}

export async function getCompanyById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("companies").select("*").eq("id", id).maybeSingle();

  if (error) {
    console.error(`Failed to load company ${id}:`, error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  const company = data as Record<string, unknown>;

  return {
    id: String(company.id ?? id),
    name: String(company.company_name ?? company.name ?? company.domain ?? "Untitled company"),
    website:
      typeof company.website === "string"
        ? company.website
        : typeof company.domain === "string"
          ? company.domain
          : null,
    industry: typeof company.industry === "string" ? company.industry : null,
    country:
      typeof company.country === "string"
        ? company.country
        : typeof company.location === "string"
          ? company.location
          : null,
    company_size:
      typeof company.company_size === "string"
        ? company.company_size
        : typeof company.size === "string"
          ? company.size
          : null,
    status: String(company.status ?? "Unknown"),
    notes: typeof company.notes === "string" ? company.notes : null,
    owner: null
  };
}

export async function getCompanyFormOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Failed to load company form options:", error.message);
    return { owners: [] };
  }

  return {
    owners: ((data ?? []) as Array<Record<string, unknown>>).map((profile) => ({
      id: String(profile.id ?? ""),
      full_name: String(profile.full_name ?? profile.email ?? "Unknown user")
    }))
  };
}

export async function getCompanyDeals(companyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("deals").select("*").eq("company_id", companyId).order("updated_at", { ascending: false });

  if (error) {
    console.error(`Failed to load company deals for ${companyId}:`, error.message);
    return [];
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((deal) => ({
    id: String(deal.id ?? ""),
    title: String(deal.title ?? deal.role_title ?? "Untitled deal"),
    stage: String(deal.stage ?? deal.status ?? "Unknown"),
    urgency: String(deal.urgency ?? "Unknown"),
    number_of_hires:
      typeof deal.number_of_hires === "number" ? deal.number_of_hires : 0
  }));
}

export async function getCompanyActivities(companyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select(
      `
        id,
        activity_type,
        summary,
        details,
        created_at,
        due_at,
        profile:profiles(id, full_name),
        deal:deals(id, title)
      `
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Failed to load company activities for ${companyId}:`, error.message);
    return [];
  }

  return data ?? [];
}

export async function getCompanyContacts(companyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(`Failed to load company contacts for ${companyId}:`, error.message);
    return [];
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((contact) => ({
    id: String(contact.id ?? ""),
    full_name: String(contact.full_name ?? "Unknown"),
    job_title: typeof contact.job_title === "string" ? contact.job_title : null,
    email: typeof contact.email === "string" ? contact.email : null,
    phone: typeof contact.phone === "string" ? contact.phone : null,
    status: String(contact.status ?? "active")
  }));
}

export async function getCompanyCampaigns(companyId: string) {
  const supabase = await createClient();
  const { data: links, error: linksError } = await supabase
    .from("campaign_companies")
    .select("*")
    .eq("company_id", companyId)
    .order("added_at", { ascending: false });

  if (linksError) {
    console.error(`Failed to load company campaigns for ${companyId}:`, linksError.message);
    return [];
  }

  const campaignIds = Array.from(
    new Set(
      ((links ?? []) as Array<Record<string, unknown>>)
        .map((link) => (typeof link.campaign_id === "string" ? link.campaign_id : null))
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
    ((campaigns ?? []) as Array<Record<string, unknown>>).map((campaign) => [
      String(campaign.id ?? ""),
      campaign
    ])
  );

  return ((links ?? []) as Array<Record<string, unknown>>).map((link) => {
    const campaign = campaignsById.get(String(link.campaign_id ?? ""));

    return {
      id: String(link.id ?? ""),
      campaign_status: typeof link.campaign_status === "string" ? link.campaign_status : null,
      added_at: typeof link.added_at === "string" ? link.added_at : null,
      notes: typeof link.notes === "string" ? link.notes : null,
      campaign: campaign
        ? {
            id: String(campaign.id ?? ""),
            name: String(campaign.name ?? "Untitled campaign"),
            status: String(campaign.status ?? "Draft"),
            campaign_type:
              typeof campaign.campaign_type === "string" ? campaign.campaign_type : null
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
    console.error(`Failed to load existing campaign links for company ${companyId}:`, linksError.message);
  }

  const linkedCampaignIds = new Set(
    ((links ?? []) as Array<Record<string, unknown>>)
      .map((link) => (typeof link.campaign_id === "string" ? link.campaign_id : null))
      .filter((value): value is string => Boolean(value))
  );

  return ((campaigns ?? []) as Array<Record<string, unknown>>)
    .filter((campaign) => !linkedCampaignIds.has(String(campaign.id ?? "")))
    .map((campaign) => ({
      id: String(campaign.id ?? ""),
      name: String(campaign.name ?? "Untitled campaign"),
      status: String(campaign.status ?? "Draft")
    }));
}
