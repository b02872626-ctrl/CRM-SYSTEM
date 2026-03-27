import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getUsers = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .order("full_name");

  if (error) {
    throw new Error(error.message);
  }

  return data;
});

export const getUserById = cache(async (id: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
});
