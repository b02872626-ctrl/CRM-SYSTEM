"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

function getErrorRedirect(message: string, nextPath?: string | null) {
  const params = new URLSearchParams({
    error: message
  });

  if (nextPath) {
    params.set("next", nextPath);
  }

  return `/login?${params.toString()}`;
}

function getSafeNextPath(value: string) {
  return value.startsWith("/") ? value : "/dashboard";
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = getSafeNextPath(String(formData.get("next") ?? "/dashboard"));

  if (!hasSupabaseEnv()) {
    redirect(getErrorRedirect("Supabase environment variables are missing.", nextPath));
  }

  if (!email || !password) {
    redirect(getErrorRedirect("Email and password are required.", nextPath));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(getErrorRedirect(error.message, nextPath));
  }

  revalidatePath("/", "layout");
  redirect(nextPath);
}

export async function signOutAction() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
