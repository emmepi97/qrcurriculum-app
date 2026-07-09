create extension if not exists "pgcrypto";

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  plan text not null default 'free' check (plan in ('free','premium','pro')),
  status text not null default 'trialing' check (status in ('trialing','active','past_due','canceled','expired')),
  trial_started_at timestamptz not null default now(),
  trial_ends_at timestamptz not null default (now() + interval '30 days'),
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.professional_availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  open_to_work boolean not null default false,
  consulting boolean not null default false,
  freelance boolean not null default false,
  networking boolean not null default false,
  teaching boolean not null default false,
  collaborations boolean not null default false,
  contact_message text default '',
  show_in_directory boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.review_requests (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(16),'hex'),
  reviewer_email text default '',
  reviewer_name text default '',
  reviewer_role text default '',
  reviewer_company text default '',
  message text default '',
  status text not null default 'open' check (status in ('open','completed','closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_reviews (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  reviewer_user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid references public.review_requests(id) on delete set null,
  reviewer_name text not null,
  reviewer_role text default '',
  reviewer_company text default '',
  relationship text default '',
  rating int not null default 5 check (rating between 1 and 5),
  review_text text not null,
  consent_publication boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','hidden','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(request_id, reviewer_user_id)
);

create table if not exists public.cv_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  slug text not null unique,
  lang text not null default 'it' check (lang in ('it','en')),
  is_premium boolean not null default true,
  is_public boolean not null default true,
  enabled_sections jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_text text not null,
  match_score int not null default 0,
  matched_keywords text[] not null default '{}',
  missing_keywords text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
alter table public.professional_availability enable row level security;
alter table public.review_requests enable row level security;
alter table public.portfolio_reviews enable row level security;
alter table public.cv_versions enable row level security;
alter table public.ai_generations enable row level security;

drop policy if exists "subscriptions owner all" on public.subscriptions;
create policy "subscriptions owner all" on public.subscriptions for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

drop policy if exists "availability owner all" on public.professional_availability;
drop policy if exists "availability public select" on public.professional_availability;
create policy "availability owner all" on public.professional_availability for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "availability public select" on public.professional_availability for select using (true);

drop policy if exists "review requests owner all" on public.review_requests;
drop policy if exists "review requests logged select" on public.review_requests;
create policy "review requests owner all" on public.review_requests for all using (auth.uid()=owner_user_id) with check (auth.uid()=owner_user_id);
create policy "review requests logged select" on public.review_requests for select using (auth.uid() is not null and status='open');

drop policy if exists "reviews owner all" on public.portfolio_reviews;
drop policy if exists "reviews reviewer insert" on public.portfolio_reviews;
drop policy if exists "reviews public approved select" on public.portfolio_reviews;
drop policy if exists "reviews reviewer select" on public.portfolio_reviews;
create policy "reviews owner all" on public.portfolio_reviews for all using (auth.uid()=owner_user_id) with check (auth.uid()=owner_user_id);
create policy "reviews reviewer insert" on public.portfolio_reviews for insert with check (auth.uid()=reviewer_user_id);
create policy "reviews public approved select" on public.portfolio_reviews for select using (status='approved' and consent_publication=true);
create policy "reviews reviewer select" on public.portfolio_reviews for select using (auth.uid()=reviewer_user_id);

drop policy if exists "cv versions owner all" on public.cv_versions;
drop policy if exists "cv versions public select" on public.cv_versions;
create policy "cv versions owner all" on public.cv_versions for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "cv versions public select" on public.cv_versions for select using (is_public=true);

drop policy if exists "ai owner all" on public.ai_generations;
create policy "ai owner all" on public.ai_generations for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

create index if not exists idx_subscriptions_user on public.subscriptions(user_id);
create index if not exists idx_availability_user on public.professional_availability(user_id);
create index if not exists idx_review_requests_owner on public.review_requests(owner_user_id, created_at desc);
create index if not exists idx_review_requests_token on public.review_requests(token);
create index if not exists idx_reviews_owner_status on public.portfolio_reviews(owner_user_id, status, created_at desc);
create index if not exists idx_reviews_reviewer on public.portfolio_reviews(reviewer_user_id, created_at desc);
create index if not exists idx_cv_versions_user on public.cv_versions(user_id, created_at desc);
create index if not exists idx_ai_generations_user on public.ai_generations(user_id, created_at desc);