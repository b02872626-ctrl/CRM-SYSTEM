import "server-only";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

const COMPANIES_PAGE_SIZE = 25;

export const getCompanies = cache(async (page = 1, profile?: { id: string; role: string | null } | null) => {
  const supabase = await createClient();
  const from = (page - 1) * COMPANIES_PAGE_SIZE;
  const to = from + COMPANIES_PAGE_SIZE - 1;
  
  let query = supabase.from("companies").select("*", { count: "exact" });

  // RBAC: If not admin, only show companies owned by user or in their campaigns
  if (profile && profile.role !== "admin") {
    // This is a bit complex for a single query if we want to check both owner_id and campaign link
    // For now, let's filter by owner_id or those linked to user's campaigns
    // Note: Supabase .or() with nested filters can be tricky.
    // A simpler approach for MVP: filter by owner_id. 
    // If they need to see all campaign leads, we might need a join or a view.
    query = query.eq("owner_id", profile.id);
  }

  const { data, error, count } = await query
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
});

export const getCompanyById = cache(async (id: string) => {
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
});

export const getCompanyFormOptions = cache(async () => {
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
});

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
        deal:deals(id, title, role_title)
      `
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.message.includes("column deals_1.title does not exist")) {
      // Fallback for missing title column
      const { data: retryData, error: retryError } = await supabase
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
            deal:deals(id, role_title)
          `
        )
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      
      if (!retryError && retryData) {
        return (retryData as any[]).map(act => ({
          ...act,
          deal: act.deal ? {
            id: act.deal.id,
            title: act.deal.role_title ?? "Untitled deal"
          } : null
        }));
      }
    }
    console.error(`Failed to load company activities for ${companyId}:`, error.message);
    return [];
  }

  return (data as any[]).map(act => ({
    ...act,
    deal: act.deal ? {
      id: act.deal.id,
      title: act.deal.title ?? act.deal.role_title ?? "Untitled deal"
    } : null
  }));
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
    role_title: typeof contact.role_title === "string" ? contact.role_title : null,
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

export async function getAvailableCampaignsForCompany(companyId: string, profile?: { id: string; role: string | null } | null) {
  const supabase = await createClient();
  
  let campaignsQuery = supabase.from("campaigns").select("*").order("updated_at", { ascending: false });
  
  // RBAC: If not admin, only show campaigns owned by the user
  if (profile && profile.role !== "admin") {
    campaignsQuery = campaignsQuery.eq("owner_id", profile.id);
  }

  const [{ data: campaigns, error: campaignsError }, { data: links, error: linksError }] =
    await Promise.all([
      campaignsQuery,
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
