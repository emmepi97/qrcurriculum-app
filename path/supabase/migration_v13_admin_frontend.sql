-- QR Curriculum V13 - frontend admin table management
-- 1) Run this migration.
-- 2) Add your admin email:
-- insert into public.app_admins(email) values ('your@email.com') on conflict do nothing;

create table if not exists public.app_admins (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

drop policy if exists "app admins can read own email" on public.app_admins;
create policy "app admins can read own email" on public.app_admins
for select using (lower(email)=lower(coalesce(auth.jwt()->>'email','')));

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_admins a
    where lower(a.email)=lower(coalesce(auth.jwt()->>'email',''))
  );
$$;

drop policy if exists "admin all subscriptions" on public.subscriptions;
create policy "admin all subscriptions" on public.subscriptions for all using (public.is_app_admin()) with check (public.is_app_admin());

drop policy if exists "admin all professional availability" on public.professional_availability;
create policy "admin all professional availability" on public.professional_availability for all using (public.is_app_admin()) with check (public.is_app_admin());

drop policy if exists "admin all review requests" on public.review_requests;
create policy "admin all review requests" on public.review_requests for all using (public.is_app_admin()) with check (public.is_app_admin());

drop policy if exists "admin all portfolio reviews" on public.portfolio_reviews;
create policy "admin all portfolio reviews" on public.portfolio_reviews for all using (public.is_app_admin()) with check (public.is_app_admin());

drop policy if exists "admin all cv versions" on public.cv_versions;
create policy "admin all cv versions" on public.cv_versions for all using (public.is_app_admin()) with check (public.is_app_admin());

drop policy if exists "admin all ai generations" on public.ai_generations;
create policy "admin all ai generations" on public.ai_generations for all using (public.is_app_admin()) with check (public.is_app_admin());

drop policy if exists "admin all personal info" on public.personal_info;
create policy "admin all personal info" on public.personal_info for all using (public.is_app_admin()) with check (public.is_app_admin());
