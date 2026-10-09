-- ============================================================
-- V19 Business features: applications tracker, prompt export,
-- profile benchmark support and premium gating helpers
-- ============================================================

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null default '',
  role_title text not null default '',
  job_url text default '',
  source text default '',
  status text not null default 'saved' check (status in ('saved','applied','screening','interview','offer','rejected','withdrawn')),
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  job_text text default '',
  match_score int default null,
  notes text default '',
  next_action text default '',
  next_action_date date,
  applied_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.job_applications enable row level security;

drop trigger if exists trg_job_applications_updated_at on public.job_applications;
create trigger trg_job_applications_updated_at
before update on public.job_applications
for each row execute function public.set_updated_at();

drop policy if exists "applications owner all" on public.job_applications;
create policy "applications owner all" on public.job_applications
for all
using (auth.uid() = user_id or public.is_app_admin())
with check (auth.uid() = user_id or public.is_app_admin());

create index if not exists idx_job_applications_user_id on public.job_applications(user_id);
create index if not exists idx_job_applications_status on public.job_applications(status);
create index if not exists idx_job_applications_next_action_date on public.job_applications(next_action_date);

-- Non obbligatorio, ma utile per amministrazione e futuri piani.
alter table public.subscriptions add column if not exists premium_features jsonb not null default '{}'::jsonb;

-- Storico analisi match più ricco. Le colonne sono additive e sicure su DB già esistenti.
alter table public.ai_generations add column if not exists is_premium_detail boolean not null default false;
alter table public.ai_generations add column if not exists job_family text default '';
alter table public.ai_generations add column if not exists result_json jsonb not null default '{}'::jsonb;
