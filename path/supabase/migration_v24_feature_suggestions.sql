-- Migration v24: suggerimenti degli utenti sulla piattaforma
-- Esegui questo script nel SQL editor di Supabase dopo le migration precedenti.

create table if not exists public.feature_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text default '',
  status text not null default 'new' check (status in ('new','planned','in_progress','done','rejected')),
  admin_notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.feature_suggestions enable row level security;

drop policy if exists "feature_suggestions owner select" on public.feature_suggestions;
create policy "feature_suggestions owner select" on public.feature_suggestions
  for select using (auth.uid() = user_id or public.is_app_admin());
drop policy if exists "feature_suggestions owner insert" on public.feature_suggestions;
create policy "feature_suggestions owner insert" on public.feature_suggestions
  for insert with check (auth.uid() = user_id);
drop policy if exists "feature_suggestions admin update" on public.feature_suggestions;
create policy "feature_suggestions admin update" on public.feature_suggestions
  for update using (public.is_app_admin());
