import "server-only";

import type { DealSeniority, DealStage, DealUrgency } from "@/types/database";
import { createClient } from "@/lib/supabase/server";

const DEALS_PAGE_SIZE = 25;

export type DealFilters = {
  status?: DealStage | "all";
  recruiter?: string | "all";
  urgency?: DealUrgency | "all";
};

export async function getDealListFilterOptions() {
  const supabase = await createClient();
  const { data: recruiters, error: recruitersError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (recruitersError) {
    return { recruiters: [] };
  }

  return {
    recruiters: ((recruitersError ? [] : recruiters) ?? []).map((recruiter) => {
      const row = recruiter as Record<string, unknown>;
      return {
        id: String(row.id ?? ""),
        full_name: String(row.full_name ?? row.email ?? "Unknown user")
      };
    })
  };
}

export async function getDealFormOptions() {
  const supabase = await createClient();
  const [{ data: companies }, { data: recruiters }] = await Promise.all([
    supabase.from("companies").select("*").order("updated_at", { ascending: false }).limit(100),
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .order("updated_at", { ascending: false })
      .limit(100)
  ]);

  return {
    companies: ((companies ?? []) as Array<Record<string, unknown>>).map((company) => ({
      id: String(company.id ?? ""),
      name: String(company.name ?? company.domain ?? "Untitled company")
    })),
    recruiters: ((recruiters ?? []) as Array<Record<string, unknown>>).map((recruiter) => ({
      id: String(recruiter.id ?? ""),
      full_name: String(recruiter.full_name ?? recruiter.email ?? "Unknown user")
    }))
  };
}

export async function getDeals(filters: DealFilters = {}, page = 1) {
  const supabase = await createClient();
  const from = (page - 1) * DEALS_PAGE_SIZE;
  const to = from + DEALS_PAGE_SIZE - 1;

  let query = supabase
    .from("deals")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("stage", filters.status);
  }

  if (filters.recruiter && filters.recruiter !== "all") {
    query = query.eq("assigned_profile_id", filters.recruiter);
  }

  if (filters.urgency && filters.urgency !== "all") {
    query = query.eq("urgency", filters.urgency);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return { items: [], totalCount: 0, pageSize: DEALS_PAGE_SIZE };
  }

  return {
    items: ((data ?? []) as Array<Record<string, unknown>>).map((deal) => ({
      id: String(deal.id ?? ""),
      title: String(deal.title ?? deal.role_title ?? "Untitled deal"),
      number_of_hires:
        typeof deal.number_of_hires === "number" ? deal.number_of_hires : 0,
      seniority: String(deal.seniority ?? "unknown"),
      urgency: String(deal.urgency ?? "unknown"),
      stage: String(deal.stage ?? deal.status ?? "unknown"),
      value: typeof deal.value === "number" ? deal.value : null,
      currency: String(deal.currency ?? "USD"),
      expected_close_date:
        typeof deal.expected_close_date === "string" ? deal.expected_close_date : null,
      company: null,
      recruiter: null
    })),
    totalCount: count ?? 0,
    pageSize: DEALS_PAGE_SIZE
  };
}

export async function getDealById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`Failed to load deal ${id}:`, error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  const deal = data as Record<string, unknown>;

  return {
    id: String(deal.id ?? id),
    title: String(deal.title ?? deal.role_title ?? "Untitled deal"),
    number_of_hires:
      typeof deal.number_of_hires === "number" ? deal.number_of_hires : 0,
    seniority: String(deal.seniority ?? "unknown"),
    urgency: String(deal.urgency ?? "unknown"),
    stage: String(deal.stage ?? deal.status ?? "unknown"),
    value: typeof deal.value === "number" ? deal.value : null,
    currency: String(deal.currency ?? "USD"),
    expected_close_date:
      typeof deal.expected_close_date === "string" ? deal.expected_close_date : null,
    notes: typeof deal.notes === "string" ? deal.notes : null,
    company_id: typeof deal.company_id === "string" ? deal.company_id : null,
    assigned_profile_id:
      typeof deal.assigned_profile_id === "string" ? deal.assigned_profile_id : null,
    company: null,
    recruiter: null
  };
}

export async function getDealCandidates(dealId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidate_applications")
    .select(
      `
        id,
        status,
        applied_at,
        last_stage_at,
        notes,
        candidate:candidates(
          id,
          first_name,
          last_name,
          email,
          phone,
          stage,
          current_title
        )
      `
    )
    .eq("deal_id", dealId)
    .order("last_stage_at", { ascending: false });

  if (error) {
    console.error(`Failed to load deal candidates for ${dealId}:`, error.message);
    return [];
  }

  return data ?? [];
}

export async function getDealActivities(dealId: string) {
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
        completed_at,
        profile:profiles(id, full_name)
      `
    )
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Failed to load deal activities for ${dealId}:`, error.message);
    return [];
  }

  return data ?? [];
}

export async function getDealFormData(id?: string) {
  const [options, deal] = await Promise.all([
    getDealFormOptions(),
    id ? getDealById(id) : Promise.resolve(null)
  ]);

  return {
    ...options,
    deal
  };
}

export type DealFormValues = {
  company_id: string;
  assigned_profile_id: string | null;
  title: string;
  number_of_hires: number;
  seniority: DealSeniority;
  urgency: DealUrgency;
  stage: DealStage;
  value: number | null;
  currency: string;
  expected_close_date: string | null;
  notes: string | null;
};
