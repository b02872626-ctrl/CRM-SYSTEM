"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { ProfileRole } from "@/types/database";

export async function updateUserRoleAction(userId: string, newRole: ProfileRole) {
  const adminProfile = (await getCurrentProfile()) as { id: string; role: string | null } | null;
  
  if (!adminProfile || adminProfile.role !== "admin") {
    throw new Error("Unauthorized: Only admins can update user roles.");
  }

  const supabase = await createClient();
  
  const { error } = await (supabase
    .from("profiles")
    .update({ role: newRole } as any)
    .eq("id", userId) as any);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/users");
  return { success: true };
}
