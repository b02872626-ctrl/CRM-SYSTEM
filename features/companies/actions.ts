"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CompanyStatus, Database } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

const companyStatusOptions: CompanyStatus[] = [
  "target",
  "researching",
  "contacted",
  "qualified",
  "inactive"
];

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function normalizeOptionalString(value: string) {
  return value ? value : null;
}

function ensureCompanyStatus(value: string): CompanyStatus {
  return companyStatusOptions.includes(value as CompanyStatus)
    ? (value as CompanyStatus)
    : "target";
}

function getCompanyPayload(formData: FormData): Database["public"]["Tables"]["companies"]["Insert"] {
  const companyName = getString(formData, "company_name");

  if (!companyName) {
    throw new Error("Company name is required.");
  }

  const location = normalizeOptionalString(getString(formData, "location"));

  return {
    company_name: companyName,
    industry: normalizeOptionalString(getString(formData, "industry")),
    company_size: normalizeOptionalString(getString(formData, "company_size")),
    location,
    country: location,
    source: normalizeOptionalString(getString(formData, "source")),
    hiring_signal: normalizeOptionalString(getString(formData, "hiring_signal")),
    status: ensureCompanyStatus(getString(formData, "status")),
    priority: normalizeOptionalString(getString(formData, "priority")),
    owner_id: normalizeOptionalString(getString(formData, "owner_id")),
    notes: normalizeOptionalString(getString(formData, "notes"))
  };
}

export async function createCompanyAction(formData: FormData) {
  const supabase = await createClient();
  const payload = getCompanyPayload(formData);
  const companiesTable = supabase.from("companies") as unknown as {
    insert: (values: Database["public"]["Tables"]["companies"]["Insert"]) => {
      select: (columns: string) => {
        single: () => Promise<{ data: { id: string }; error: { message: string } | null }>;
      };
    };
  };

  const { data, error } = await companiesTable.insert(payload).select("id").single();

  if (error) {
    throw new Error(error.message);
  }

  const companyId = data.id;
  const contactName = normalizeOptionalString(getString(formData, "contact_full_name"));
  const contactRole = normalizeOptionalString(getString(formData, "contact_role_title"));
  const contactPhone = normalizeOptionalString(getString(formData, "contact_phone"));
  const contactEmail = normalizeOptionalString(getString(formData, "contact_email"));

  if (contactName || contactRole || contactPhone || contactEmail) {
    const contactsTable = supabase.from("contacts") as unknown as {
      insert: (values: Database["public"]["Tables"]["contacts"]["Insert"]) => Promise<{ error: { message: string } | null }>;
    };

    const { error: contactError } = await contactsTable.insert({
      company_id: companyId,
      full_name: contactName ?? "Primary Contact",
      job_title: contactRole,
      phone: contactPhone,
      email: contactEmail
    });

    if (contactError) {
      throw new Error(contactError.message);
    }
  }

  const nextStep = normalizeOptionalString(getString(formData, "next_step"));
  const nextStepDate = normalizeOptionalString(getString(formData, "next_step_date"));

  if (nextStep) {
    const profile = (await getCurrentProfile()) as { id?: string } | null;
    const activitiesTable = supabase.from("activities") as unknown as {
      insert: (values: Database["public"]["Tables"]["activities"]["Insert"]) => Promise<{ error: { message: string } | null }>;
    };

    const { error: activityError } = await activitiesTable.insert({
      company_id: companyId,
      profile_id: profile?.id ?? null,
      activity_type: "task",
      summary: nextStep,
      due_at: nextStepDate
    });

    if (activityError) {
      throw new Error(activityError.message);
    }
  }

  revalidatePath("/companies");
  redirect(`/companies/${companyId}`);
}
