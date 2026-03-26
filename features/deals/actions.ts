"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Database, DealSeniority, DealStage, DealUrgency } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { dealSeniorityOptions, dealStageOptions, dealUrgencyOptions } from "@/features/deals/constants";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function normalizeOptionalString(value: string) {
  return value ? value : null;
}

function normalizeNumber(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function ensureStage(value: string): DealStage {
  return dealStageOptions.includes(value as DealStage) ? (value as DealStage) : "new";
}

function ensureUrgency(value: string): DealUrgency {
  return dealUrgencyOptions.includes(value as DealUrgency)
    ? (value as DealUrgency)
    : "medium";
}

function ensureSeniority(value: string): DealSeniority {
  return dealSeniorityOptions.includes(value as DealSeniority)
    ? (value as DealSeniority)
    : "mid";
}

function getDealPayload(formData: FormData): Database["public"]["Tables"]["deals"]["Insert"] {
  const companyId = getString(formData, "company_id");
  const title = getString(formData, "title");
  const hires = Number(getString(formData, "number_of_hires"));

  if (!companyId || !title || !Number.isFinite(hires) || hires < 1) {
    throw new Error("Company, role title, and a valid hire count are required.");
  }

  return {
    company_id: companyId,
    assigned_profile_id: normalizeOptionalString(getString(formData, "assigned_profile_id")),
    title,
    number_of_hires: hires,
    seniority: ensureSeniority(getString(formData, "seniority")),
    urgency: ensureUrgency(getString(formData, "urgency")),
    stage: ensureStage(getString(formData, "stage")),
    value: normalizeNumber(getString(formData, "value")),
    currency: getString(formData, "currency").toUpperCase() || "USD",
    expected_close_date: normalizeOptionalString(getString(formData, "expected_close_date")),
    notes: normalizeOptionalString(getString(formData, "notes"))
  };
}

export async function createDealAction(formData: FormData) {
  const supabase = await createClient();
  const payload = getDealPayload(formData);

  const dealsTable = supabase.from("deals") as unknown as {
    insert: (values: Database["public"]["Tables"]["deals"]["Insert"]) => {
      select: (columns: string) => { single: () => Promise<{ data: { id: string }; error: { message: string } | null }> };
    };
  };

  const { data, error } = await dealsTable
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/deals");
  redirect(`/deals/${data.id}`);
}

export async function updateDealAction(formData: FormData) {
  const supabase = await createClient();
  const id = getString(formData, "id");

  if (!id) {
    throw new Error("Deal id is required.");
  }

  const payload = getDealPayload(formData);
  const dealsTable = supabase.from("deals") as unknown as {
    update: (values: Database["public"]["Tables"]["deals"]["Update"]) => {
      eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
    };
  };
  const { error } = await dealsTable.update(payload).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/deals");
  revalidatePath(`/deals/${id}`);
  redirect(`/deals/${id}`);
}

export async function updateDealStatusAction(formData: FormData) {
  const supabase = await createClient();
  const id = getString(formData, "id");
  const stage = ensureStage(getString(formData, "stage"));
  const returnPath = getString(formData, "return_path") || "/deals";

  if (!id) {
    throw new Error("Deal id is required.");
  }

  const dealsTable = supabase.from("deals") as unknown as {
    update: (values: Pick<Database["public"]["Tables"]["deals"]["Update"], "stage">) => {
      eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
    };
  };
  const { error } = await dealsTable.update({ stage }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/deals");
  revalidatePath(`/deals/${id}`);
  redirect(returnPath);
}
