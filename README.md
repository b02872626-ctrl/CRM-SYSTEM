# Afriwork BPO CRM

Initial scaffold for a simple internal CRM built with Next.js App Router, TypeScript, Tailwind CSS, Supabase, and shadcn/ui conventions.

## What is included

- Route groups for auth and protected app pages
- Protected app shell with sidebar, top bar, and main content area
- Working login page, logout, and protected routes for login, dashboard, companies, deals, and candidates
- Shared folders for `components`, `features`, `lib`, and `types`
- Supabase SSR helpers for browser, server, and proxy auth flows

## Project structure

```text
app/
  (auth)/
    login/
  (protected)/
    candidates/
    companies/
    dashboard/
    deals/
components/
  layout/
  shared/
  ui/
features/
  auth/
  candidates/
  companies/
  deals/
lib/
  supabase/
types/
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` and add your Supabase values:

```env
# Supabase project credentials
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key

# Optional fallback if you still use the legacy anon key format
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Notes

- `proxy.ts` refreshes Supabase auth state and redirects users between `/login` and protected routes.
- Login uses Supabase email/password auth only. Signup is intentionally not included.
- Admin users should be created manually or invited through Supabase Auth.
- `components.json` is included so shadcn/ui components can be added incrementally when needed.
