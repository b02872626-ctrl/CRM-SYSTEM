import { type NextRequest, NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

const protectedPrefixes = ["/", "/dashboard", "/companies", "/deals", "/candidates"];

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some((prefix) => {
    if (prefix === "/") {
      return pathname === "/";
    }

    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

function hasAuthCookies(cookieEntries: Array<{ name: string }>) {
  return cookieEntries.some(
    ({ name }) => name.startsWith("sb-") && name.includes("-auth-token")
  );
}

export async function updateSession(request: NextRequest) {
  // Only use request cloning if we actually need to proxy headers/cookies
  // For basic auth checks and redirects, NextResponse.next() is sufficient.
  let response = NextResponse.next();

  if (!hasSupabaseEnv()) {
    if (request.nextUrl.pathname === "/login") {
      return response;
    }

    if (isProtectedPath(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  }

  const pathname = request.nextUrl.pathname;
  const requestCookies = request.cookies.getAll();

  if (!hasAuthCookies(requestCookies)) {
    if (isProtectedPath(pathname)) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    return response;
  }

  return response;
}
