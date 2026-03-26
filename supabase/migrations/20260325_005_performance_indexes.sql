-- Add index to speed up dashboard activity counts (due today and overdue)
create index if not exists activities_due_at_completed_at_idx on public.activities (due_at, completed_at) where completed_at is null;

-- Add index to speed up candidate source filtering and distinct source fetching
create index if not exists candidates_source_idx on public.candidates (source);

-- Add index on profiles for faster auth_user_id lookups (already exists, but ensuring another one for email combination)
create index if not exists profiles_auth_user_id_email_idx on public.profiles (auth_user_id, email);
