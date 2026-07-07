create extension if not exists "pgcrypto";

alter table public.skills add column if not exists category text not null default 'Altro / Settoriale';
alter table public.skills add column if not exists rating int not null default 3;
alter table public.skills add column if not exists hide_description boolean not null default false;
alter table public.work_experiences add column if not exists hide_description boolean not null default false;
alter table public.educations add column if not exists hide_description boolean not null default false;
alter table public.awards add column if not exists hide_description boolean not null default false;
alter table public.projects add column if not exists hide_description boolean not null default false;
alter table public.case_studies add column if not exists hide_description boolean not null default false;

update public.skills set category = case
  when category in ('Digital & Data','Digital') then 'Digital, AI & Automazione'
  when category in ('Gestione Progetti','Project Management') then 'Project & Process Management'
  when category in ('Comunicazione') then 'Comunicazione & Public Speaking'
  when category in ('Leadership') then 'Leadership & People Management'
  when category in ('Tecniche di Settore') then 'Fashion, Product & Manufacturing'
  when category in ('Analisi & Problem Solving') then 'Problem Solving & Continuous Improvement'
  when category in ('Creatività & Design') then 'Creatività, Design & UX'
  when category is null or trim(category)='' or category='Altro' then 'Altro / Settoriale'
  else category
end;
update public.skills set rating=3 where rating is null or rating<1 or rating>5;

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  profile_user_id uuid references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('profile_view','qr_scan')),
  public_slug text not null,
  path text default '',
  referrer text default '',
  user_agent text default '',
  created_at timestamptz not null default now()
);

alter table public.analytics_events add column if not exists profile_user_id uuid references auth.users(id) on delete cascade;
alter table public.analytics_events add column if not exists event_type text default 'profile_view';
alter table public.analytics_events add column if not exists public_slug text default '';
alter table public.analytics_events add column if not exists path text default '';
alter table public.analytics_events add column if not exists referrer text default '';
alter table public.analytics_events add column if not exists user_agent text default '';
alter table public.analytics_events add column if not exists created_at timestamptz not null default now();

-- Se in una versione precedente avevi una colonna user_id, riallinea profile_user_id.
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='analytics_events' and column_name='user_id') then
    execute 'update public.analytics_events set profile_user_id = user_id where profile_user_id is null';
  end if;
end $$;

alter table public.analytics_events enable row level security;
drop policy if exists "analytics insert public" on public.analytics_events;
drop policy if exists "analytics owner select" on public.analytics_events;
create policy "analytics insert public" on public.analytics_events for insert with check (true);
create policy "analytics owner select" on public.analytics_events for select using (auth.uid()=profile_user_id);

create index if not exists idx_analytics_profile_created on public.analytics_events(profile_user_id, created_at desc);
create index if not exists idx_skills_category_user on public.skills(user_id, category);
create index if not exists idx_skills_name on public.skills(name);
