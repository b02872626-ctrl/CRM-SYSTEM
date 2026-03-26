import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

function hasAuthCookies(cookieEntries: Array<{ name: string }>) {
  return cookieEntries.some(
    ({ name }) => name.startsWith("sb-") && name.includes("-auth-token")
  );
}

export default async function ProtectedLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  if (!hasAuthCookies(cookieStore.getAll())) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
