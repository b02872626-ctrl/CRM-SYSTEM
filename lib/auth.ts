import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

function hasAuthCookies(cookieEntries: Array<{ name: string }>) {
  return cookieEntries.some(
    ({ name }) => name.startsWith("sb-") && name.includes("-auth-token")
  );
}

const getCachedCurrentUser = cache(async () => {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const cookieStore = await cookies();

  if (!hasAuthCookies(cookieStore.getAll())) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
});

export async function getCurrentUser() {
  return getCachedCurrentUser();
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getCurrentProfile() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (user?.id || user?.email) {
    const filters = [];
    if (user?.id) filters.push(`auth_user_id.eq.${user.id}`);
    if (user?.email) filters.push(`email.ilike.${user.email.toLowerCase()}`);

    const { data: profileByOr, error: orError } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .or(filters.join(","))
      .maybeSingle();

    if (profileByOr) return profileByOr;

    // Direct email fallback if combined search failed
    if (user?.email) {
      const { data: profileByEmail } = await supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .ilike("email", user.email.toLowerCase())
        .maybeSingle();
      
      if (profileByEmail) return profileByEmail;
    }

    console.log("No profile found for:", { id: user.id, email: user.email }, "using filters:", filters.join(","));

    // Fallback: If we have an Auth User but no DB Profile, return basic Auth data
    if (user) {
      return {
        id: user.id,
        email: user.email ?? "",
        full_name: user.email?.split("@")[0] ?? "User",
        role: "sales" // Default role for new/unmapped users
      };
    }
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data ?? null;
}
