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
      role_title: contactRole,
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
    const activitiesTable = (supabase.from("activities") as any);

    const { error: activityError } = await activitiesTable.insert({
      company_id: companyId,
      profile_id: profile?.id ?? null,
      activity_type: "task",
      summary: nextStep,
      due_at: nextStepDate
    } as any);

    if (activityError) {
      throw new Error(activityError.message);
    }
  }

  revalidatePath("/companies");
  redirect(`/companies/${companyId}`);
}

export async function updateCompanyAction(formData: FormData) {
  const profile = (await getCurrentProfile()) as { id: string; role: string | null } | null;
  const supabase = await createClient();
  const id = getString(formData, "id");
  if (!id) throw new Error("Company ID is required.");

  // RBAC: Admin or (Owner / Campaign-linked)
  if (profile?.role !== "admin") {
    const { data: company } = await (supabase
      .from("companies")
      .select("owner_id")
      .eq("id", id)
      .maybeSingle() as any);

    if (company?.owner_id !== profile?.id) {
      // Check if user owns any campaign this company belongs to
      const { data: campaignLink } = await (supabase
        .from("campaign_companies")
        .select("campaign_id, campaigns!inner(owner_id)")
        .eq("company_id", id)
        .eq("campaigns.owner_id", profile?.id ?? "")
        .maybeSingle() as any);

      if (!campaignLink) {
        throw new Error("Unauthorized: You do not have permission to update this company.");
      }
    }
  }

  const payload = getCompanyPayload(formData);
  // Also include website if present in payload
  const website = normalizeOptionalString(getString(formData, "website"));
  
  const { error } = await (supabase
    .from("companies")
    .update({ ...payload, website } as any)
    .eq("id", id) as any);

  if (error) throw new Error(error.message);

  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
  // If it's linked to campaigns, we might need to revalidate those too,
  // but usually revalidatePath with the specific ID is enough for the slide-over.
}

export async function createContactAction(formData: FormData) {
  const profile = (await getCurrentProfile()) as { id: string; role: string | null } | null;
  const supabase = await createClient();
  const companyId = getString(formData, "company_id");
  if (!companyId) throw new Error("Company ID is required.");

  // RBAC: Same as company update
  if (profile?.role !== "admin") {
    const { data: company } = await (supabase
      .from("companies")
      .select("owner_id")
      .eq("id", companyId)
      .maybeSingle() as any);

    if (company?.owner_id !== profile?.id) {
      const { data: campaignLink } = await (supabase
        .from("campaign_companies")
        .select("campaign_id, campaigns!inner(owner_id)")
        .eq("company_id", companyId)
        .eq("campaigns.owner_id", profile?.id ?? "")
        .maybeSingle() as any);

      if (!campaignLink) {
        throw new Error("Unauthorized: You do not have permission to add contacts to this company.");
      }
    }
  }

  const fullName = getString(formData, "full_name");
  if (!fullName) throw new Error("Contact name is required.");

  const { error } = await (supabase.from("contacts") as any).insert({
    company_id: companyId,
    full_name: fullName,
    role_title: normalizeOptionalString(getString(formData, "role_title")),
    email: normalizeOptionalString(getString(formData, "email")),
    phone: normalizeOptionalString(getString(formData, "phone")),
    linkedin_url: normalizeOptionalString(getString(formData, "linkedin_url")),
    notes: normalizeOptionalString(getString(formData, "notes")),
    status: (getString(formData, "status") as any) || "active"
  });

  if (error) throw new Error(error.message);

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
}

export async function updateContactAction(formData: FormData) {
  const profile = (await getCurrentProfile()) as { id: string; role: string | null } | null;
  const supabase = await createClient();
  const contactId = getString(formData, "id");
  const companyId = getString(formData, "company_id");
  if (!contactId) throw new Error("Contact ID is required.");

  // RBAC: Same as company update
  if (profile?.role !== "admin") {
    // We check if the user has permission for the COMPANY this contact belongs to
    // If companyId is not provided, we might need to look it up, but usually it is.
    if (companyId) {
      const { data: company } = await (supabase
        .from("companies")
        .select("owner_id")
        .eq("id", companyId)
        .maybeSingle() as any);

      if (company?.owner_id !== profile?.id) {
        const { data: campaignLink } = await (supabase
          .from("campaign_companies")
          .select("campaign_id, campaigns!inner(owner_id)")
          .eq("company_id", companyId)
          .eq("campaigns.owner_id", profile?.id ?? "")
          .maybeSingle() as any);

        if (!campaignLink) {
          throw new Error("Unauthorized: You do not have permission to update contacts for this company.");
        }
      }
    }
  }

  const { error } = await (supabase
    .from("contacts")
    .update({
      full_name: getString(formData, "full_name"),
      role_title: normalizeOptionalString(getString(formData, "role_title")),
      email: normalizeOptionalString(getString(formData, "email")),
      phone: normalizeOptionalString(getString(formData, "phone")),
      linkedin_url: normalizeOptionalString(getString(formData, "linkedin_url")),
      notes: normalizeOptionalString(getString(formData, "notes")),
      status: getString(formData, "status") as any
    } as any)
    .eq("id", contactId) as any);

  if (error) throw new Error(error.message);

  revalidatePath("/companies");
  if (companyId) revalidatePath(`/companies/${companyId}`);
}
