-- =====================================================================
-- QR CURRICULUM - SETUP COMPLETO E IDEMPOTENTE (schema + tutte le fix)
-- =====================================================================
-- Esegui QUESTO SINGOLO FILE nel SQL editor di Supabase, sia su un
-- progetto nuovo sia su uno dove hai già eseguito (in tutto o in parte)
-- schema.sql e/o le migration precedenti. Rieseguibile senza rischio.
--
-- Non serve eseguire separatamente: schema.sql, migration_v16...v24.
-- migration_v15_consulting_worker_score.sql è superata da schema.sql.
-- =====================================================================

-- ============ 1) SCHEMA BASE (tabelle, funzioni, policy) ============

create extension if not exists "pgcrypto";

-- Core profile tables (safe if already present)
create table if not exists public.personal_info (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text default '', cognome text default '', data_nascita date,
  citta_residenza text default '', nazione text default '', telefono text default '', email_cv text default '',
  job_title text default '', summary text default '', photo_url text default '', video_url text default '',
  public_slug text unique not null, is_public boolean not null default true, show_contact_public boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id)
);
create table if not exists public.work_experiences (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, role_title text not null, company text default '', start_date date, end_date date, description text default '', links jsonb not null default '[]'::jsonb, linked_skills jsonb not null default '[]'::jsonb, hide_description boolean not null default false, is_hidden boolean not null default false, content_lang text not null default 'all', cv_visibility jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table if not exists public.educations (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null, institution text default '', field_of_study text default '', start_date date, end_date date, location text default '', grade text default '', description text default '', links jsonb not null default '[]'::jsonb, hide_description boolean not null default false, is_hidden boolean not null default false, content_lang text not null default 'all', cv_visibility jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table if not exists public.languages (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, lingua text not null, livello text not null default 'basic', acquired_date date, is_hidden boolean not null default false, content_lang text not null default 'all', cv_visibility jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table if not exists public.skills (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, name text not null, category text not null default 'Industry Expertise', rating int not null default 3 check (rating between 1 and 5), hide_score boolean not null default false, acquired_date date, description text default '', hide_description boolean not null default false, is_hidden boolean not null default false, content_lang text not null default 'all', cv_visibility jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table if not exists public.awards (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null, issuer text default '', date date, description text default '', links jsonb not null default '[]'::jsonb, hide_description boolean not null default false, is_hidden boolean not null default false, content_lang text not null default 'all', cv_visibility jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table if not exists public.projects (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null, role text default '', description text default '', start_date date, end_date date, links jsonb not null default '[]'::jsonb, linked_skills jsonb not null default '[]'::jsonb, hide_description boolean not null default false, is_hidden boolean not null default false, content_lang text not null default 'all', cv_visibility jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table if not exists public.case_studies (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null, context text default '', solution text default '', impact text default '', date date, links jsonb not null default '[]'::jsonb, hide_description boolean not null default false, is_hidden boolean not null default false, content_lang text not null default 'all', cv_visibility jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());

create table if not exists public.analytics_events (id uuid primary key default gen_random_uuid(), profile_user_id uuid references auth.users(id) on delete cascade, owner_id uuid references auth.users(id) on delete cascade, event_type text not null check (event_type in ('profile_view','qr_scan')), event_date timestamptz default now(), public_slug text not null, path text default '', referrer text default '', user_agent text default '', created_at timestamptz not null default now());
create table if not exists public.subscriptions (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade unique, plan text not null default 'free', status text not null default 'trialing', trial_started_at timestamptz not null default now(), trial_ends_at timestamptz not null default (now() + interval '30 days'), current_period_end timestamptz, stripe_customer_id text, stripe_subscription_id text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.professional_availability (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade unique, open_to_work boolean not null default false, consulting boolean not null default false, freelance boolean not null default false, networking boolean not null default false, teaching boolean not null default false, collaborations boolean not null default false, contact_message text default '', show_in_directory boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.review_requests (id uuid primary key default gen_random_uuid(), owner_user_id uuid not null references auth.users(id) on delete cascade, token text not null unique default encode(gen_random_bytes(16),'hex'), reviewer_email text default '', reviewer_name text default '', reviewer_role text default '', reviewer_company text default '', message text default '', status text not null default 'open', created_at timestamptz not null default now());
create table if not exists public.portfolio_reviews (id uuid primary key default gen_random_uuid(), owner_user_id uuid not null references auth.users(id) on delete cascade, reviewer_user_id uuid not null references auth.users(id) on delete cascade, request_id uuid references public.review_requests(id) on delete set null, reviewer_name text not null, reviewer_role text default '', reviewer_company text default '', relationship text default '', rating int not null default 5 check (rating between 1 and 5), review_text text not null, consent_publication boolean not null default false, status text not null default 'pending', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.cv_versions (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null, slug text not null unique, lang text not null default 'it', is_premium boolean not null default true, is_public boolean not null default true, enabled_sections jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.ai_generations (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, job_text text not null, match_score int not null default 0, matched_keywords text[] not null default '{}', missing_keywords text[] not null default '{}', created_at timestamptz not null default now());
create table if not exists public.app_admins (email text primary key, created_at timestamptz not null default now());

-- New consulting table
create table if not exists public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text default '', name text default '', phone text default '',
  source text default 'button_click', status text not null default 'clicked',
  message text default '', price_eur numeric not null default 25,
  admin_notes text default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table public.personal_info enable row level security;
alter table public.work_experiences enable row level security; alter table public.educations enable row level security; alter table public.languages enable row level security; alter table public.skills enable row level security; alter table public.awards enable row level security; alter table public.projects enable row level security; alter table public.case_studies enable row level security;
alter table public.analytics_events enable row level security; alter table public.subscriptions enable row level security; alter table public.professional_availability enable row level security; alter table public.review_requests enable row level security; alter table public.portfolio_reviews enable row level security; alter table public.cv_versions enable row level security; alter table public.ai_generations enable row level security; alter table public.app_admins enable row level security; alter table public.consultation_requests enable row level security;

create or replace function public.is_app_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.app_admins a where lower(a.email)=lower(coalesce(auth.jwt()->>'email',''))); $$;

-- Generic owner policies
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['work_experiences','educations','languages','skills','awards','projects','case_studies'] LOOP
    EXECUTE format('drop policy if exists "%s owner all" on public.%I', t, t);
    EXECUTE format('create policy "%s owner all" on public.%I for all using (auth.uid()=user_id or public.is_app_admin()) with check (auth.uid()=user_id or public.is_app_admin())', t, t);
  END LOOP;
END $$;

drop policy if exists "personal owner all" on public.personal_info; create policy "personal owner all" on public.personal_info for all using (auth.uid()=user_id or public.is_app_admin()) with check (auth.uid()=user_id or public.is_app_admin());
drop policy if exists "personal public select" on public.personal_info; create policy "personal public select" on public.personal_info for select using (is_public=true);
drop policy if exists "analytics insert public" on public.analytics_events; create policy "analytics insert public" on public.analytics_events for insert with check (true);
drop policy if exists "analytics owner select" on public.analytics_events; create policy "analytics owner select" on public.analytics_events for select using (auth.uid()=profile_user_id or public.is_app_admin());
drop policy if exists "subscriptions owner all" on public.subscriptions; create policy "subscriptions owner all" on public.subscriptions for all using (auth.uid()=user_id or public.is_app_admin()) with check (auth.uid()=user_id or public.is_app_admin());
drop policy if exists "availability owner all" on public.professional_availability; create policy "availability owner all" on public.professional_availability for all using (auth.uid()=user_id or public.is_app_admin()) with check (auth.uid()=user_id or public.is_app_admin());
drop policy if exists "availability public select" on public.professional_availability; create policy "availability public select" on public.professional_availability for select using (true);
drop policy if exists "review requests owner all" on public.review_requests; create policy "review requests owner all" on public.review_requests for all using (auth.uid()=owner_user_id or public.is_app_admin()) with check (auth.uid()=owner_user_id or public.is_app_admin());
drop policy if exists "review requests logged select" on public.review_requests; create policy "review requests logged select" on public.review_requests for select using (auth.uid() is not null and status='open');
drop policy if exists "reviews owner all" on public.portfolio_reviews; create policy "reviews owner all" on public.portfolio_reviews for all using (auth.uid()=owner_user_id or public.is_app_admin()) with check (auth.uid()=owner_user_id or public.is_app_admin());
drop policy if exists "reviews reviewer insert" on public.portfolio_reviews; create policy "reviews reviewer insert" on public.portfolio_reviews for insert with check (auth.uid()=reviewer_user_id);
drop policy if exists "reviews public approved select" on public.portfolio_reviews; create policy "reviews public approved select" on public.portfolio_reviews for select using (status='approved' and consent_publication=true);
drop policy if exists "cv versions owner all" on public.cv_versions; create policy "cv versions owner all" on public.cv_versions for all using (auth.uid()=user_id or public.is_app_admin()) with check (auth.uid()=user_id or public.is_app_admin());
drop policy if exists "ai owner all" on public.ai_generations; create policy "ai owner all" on public.ai_generations for all using (auth.uid()=user_id or public.is_app_admin()) with check (auth.uid()=user_id or public.is_app_admin());
drop policy if exists "app admins read own" on public.app_admins; create policy "app admins read own" on public.app_admins for select using (lower(email)=lower(coalesce(auth.jwt()->>'email','')) or public.is_app_admin());
drop policy if exists "consult public insert" on public.consultation_requests; create policy "consult public insert" on public.consultation_requests for insert with check (true);
drop policy if exists "consult owner select" on public.consultation_requests; create policy "consult owner select" on public.consultation_requests for select using (auth.uid()=user_id or public.is_app_admin());
drop policy if exists "consult admin all" on public.consultation_requests; create policy "consult admin all" on public.consultation_requests for all using (public.is_app_admin()) with check (public.is_app_admin());

-- Public CV section selects
drop policy if exists "work public select" on public.work_experiences; create policy "work public select" on public.work_experiences for select using (is_hidden=false and exists(select 1 from public.personal_info p where p.user_id=work_experiences.user_id and p.is_public=true));
drop policy if exists "education public select" on public.educations; create policy "education public select" on public.educations for select using (is_hidden=false and exists(select 1 from public.personal_info p where p.user_id=educations.user_id and p.is_public=true));
drop policy if exists "languages public select" on public.languages; create policy "languages public select" on public.languages for select using (is_hidden=false and exists(select 1 from public.personal_info p where p.user_id=languages.user_id and p.is_public=true));
drop policy if exists "skills public select" on public.skills; create policy "skills public select" on public.skills for select using (is_hidden=false and exists(select 1 from public.personal_info p where p.user_id=skills.user_id and p.is_public=true));
drop policy if exists "awards public select" on public.awards; create policy "awards public select" on public.awards for select using (is_hidden=false and exists(select 1 from public.personal_info p where p.user_id=awards.user_id and p.is_public=true));
drop policy if exists "projects public select" on public.projects; create policy "projects public select" on public.projects for select using (is_hidden=false and exists(select 1 from public.personal_info p where p.user_id=projects.user_id and p.is_public=true));
drop policy if exists "case studies public select" on public.case_studies; create policy "case studies public select" on public.case_studies for select using (is_hidden=false and exists(select 1 from public.personal_info p where p.user_id=case_studies.user_id and p.is_public=true));

create index if not exists idx_personal_info_slug on public.personal_info(public_slug);
create index if not exists idx_personal_info_user on public.personal_info(user_id);
create index if not exists idx_analytics_profile_created_v15 on public.analytics_events(profile_user_id, created_at desc);
create index if not exists idx_analytics_profile_type_created_v15 on public.analytics_events(profile_user_id, event_type, created_at desc);
create index if not exists idx_skills_user_category_v15 on public.skills(user_id, category);
create index if not exists idx_skills_user_name_v15 on public.skills(user_id, name);
create index if not exists idx_consultation_created_v15 on public.consultation_requests(created_at desc);
create index if not exists idx_consultation_user_v15 on public.consultation_requests(user_id, created_at desc);

-- V23 cookie settings managed from Admin
create table if not exists public.cookie_settings (
 id uuid primary key default gen_random_uuid(),
 banner_title text default 'Gestione cookie',
 banner_text text default 'Usiamo cookie essenziali per far funzionare il sito e, solo con consenso, cookie analytics per migliorare il servizio.',
 analytics_enabled boolean not null default true,
 marketing_enabled boolean not null default false,
 qr_tracking_enabled boolean not null default true,
 is_active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.cookie_settings enable row level security;
drop policy if exists "cookie settings public select" on public.cookie_settings;
create policy "cookie settings public select" on public.cookie_settings for select using (is_active=true);
drop policy if exists "cookie settings admin all" on public.cookie_settings;
create policy "cookie settings admin all" on public.cookie_settings for all using (public.is_app_admin()) with check (public.is_app_admin());
insert into public.cookie_settings(banner_title,banner_text,analytics_enabled,marketing_enabled,qr_tracking_enabled,is_active)
select 'Gestione cookie','Usiamo cookie essenziali per far funzionare il sito e, solo con consenso, cookie analytics per migliorare il servizio.',true,false,true,true
where not exists(select 1 from public.cookie_settings);

-- Job Match AI opzionale (gestito da admin)
create table if not exists public.ai_settings (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'anthropic',
  api_key text,
  model text not null default 'claude-haiku-4-5',
  is_active boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.ai_settings enable row level security;
drop policy if exists "ai_settings admin only" on public.ai_settings;
create policy "ai_settings admin only" on public.ai_settings
  for all using (public.is_app_admin()) with check (public.is_app_admin());

-- Slot sponsorizzati per l'area "Corsi consigliati" del Job Match
create table if not exists public.course_sponsors (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  provider_name text default '',
  url text not null,
  logo_url text default '',
  is_active boolean not null default true,
  priority int not null default 0,
  impressions int not null default 0,
  clicks int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.course_sponsors enable row level security;
drop policy if exists "course_sponsors public read active" on public.course_sponsors;
create policy "course_sponsors public read active" on public.course_sponsors
  for select using (is_active = true or public.is_app_admin());
drop policy if exists "course_sponsors admin write" on public.course_sponsors;
create policy "course_sponsors admin write" on public.course_sponsors
  for insert with check (public.is_app_admin());
drop policy if exists "course_sponsors admin update" on public.course_sponsors;
create policy "course_sponsors admin update" on public.course_sponsors
  for update using (public.is_app_admin());
drop policy if exists "course_sponsors admin delete" on public.course_sponsors;
create policy "course_sponsors admin delete" on public.course_sponsors
  for delete using (public.is_app_admin());

-- Suggerimenti degli utenti sulla piattaforma
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


-- ============ 3) FIX v16: video profilo ============

alter table public.personal_info add column if not exists video_url text default '';


-- ============ 4) FIX v17: contatti pubblici opzionali + analytics ============

alter table public.personal_info add column if not exists show_contact_public boolean not null default true;

-- 2) Fix difensivo per gli analytics: ricrea vincoli e policy nel caso in cui
--    la tabella analytics_events sia stata creata in precedenza con valori
--    diversi da quelli usati dall'applicazione (profile_view / qr_scan).
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='analytics_events') then
    alter table public.analytics_events drop constraint if exists analytics_events_event_type_check;
    alter table public.analytics_events add constraint analytics_events_event_type_check check (event_type in ('profile_view','qr_scan'));
  end if;
end $$;

alter table public.analytics_events enable row level security;
drop policy if exists "analytics insert public" on public.analytics_events;
create policy "analytics insert public" on public.analytics_events for insert with check (true);
drop policy if exists "analytics owner select" on public.analytics_events;
create policy "analytics owner select" on public.analytics_events for select using (auth.uid() = profile_user_id or public.is_app_admin());


-- ============ 5) FIX v18: colonna owner_id legacy ============

alter table public.analytics_events add column if not exists owner_id uuid references auth.users(id) on delete cascade;

-- 2) In ogni caso, rendiamola opzionale: il codice la valorizza sempre,
--    ma così eventuali inserimenti futuri non falliscono più per questo.
alter table public.analytics_events alter column owner_id drop not null;

-- 3) Le policy restano valide su profile_user_id (colonna sempre valorizzata).
alter table public.analytics_events enable row level security;
drop policy if exists "analytics insert public" on public.analytics_events;
create policy "analytics insert public" on public.analytics_events for insert with check (true);
drop policy if exists "analytics owner select" on public.analytics_events;
create policy "analytics owner select" on public.analytics_events for select using (auth.uid() = profile_user_id or auth.uid() = owner_id or public.is_app_admin());


-- ============ 6) FIX v19: Job Match AI opzionale ============

create table if not exists public.ai_settings (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'anthropic',
  api_key text,
  model text not null default 'claude-haiku-4-5',
  is_active boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.ai_settings enable row level security;

-- Solo l'admin può leggere/scrivere questa tabella dal frontend (contiene
-- la chiave API). La route server-side che effettua le chiamate all'AI usa
-- invece la Service Role Key di Supabase (mai esposta al browser) per
-- poter leggere questa riga anche se l'utente collegato non è admin.
drop policy if exists "ai_settings admin only" on public.ai_settings;
create policy "ai_settings admin only" on public.ai_settings
  for all using (public.is_app_admin()) with check (public.is_app_admin());


-- ============ 7) FIX v20: allegati/link nelle sezioni ============

alter table public.work_experiences add column if not exists links jsonb not null default '[]'::jsonb;
alter table public.educations add column if not exists links jsonb not null default '[]'::jsonb;
alter table public.awards add column if not exists links jsonb not null default '[]'::jsonb;
alter table public.projects add column if not exists links jsonb not null default '[]'::jsonb;
alter table public.case_studies add column if not exists links jsonb not null default '[]'::jsonb;


-- ============ 8) FIX v21: slot sponsorizzati corsi ============

create table if not exists public.course_sponsors (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  provider_name text default '',
  url text not null,
  logo_url text default '',
  is_active boolean not null default true,
  priority int not null default 0,
  impressions int not null default 0,
  clicks int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.course_sponsors enable row level security;

-- Lettura pubblica (deve poter essere mostrato nel Job Match a chiunque),
-- ma solo delle righe attive.
drop policy if exists "course_sponsors public read active" on public.course_sponsors;
create policy "course_sponsors public read active" on public.course_sponsors
  for select using (is_active = true or public.is_app_admin());

-- Scrittura riservata all'admin (creazione/modifica sponsor, prezzi, link).
drop policy if exists "course_sponsors admin write" on public.course_sponsors;
create policy "course_sponsors admin write" on public.course_sponsors
  for insert with check (public.is_app_admin());
drop policy if exists "course_sponsors admin update" on public.course_sponsors;
create policy "course_sponsors admin update" on public.course_sponsors
  for update using (public.is_app_admin());
drop policy if exists "course_sponsors admin delete" on public.course_sponsors;
create policy "course_sponsors admin delete" on public.course_sponsors
  for delete using (public.is_app_admin());


-- ============ 9) FIX v22: fix dinamico definitivo colonne legacy analytics ============

do $$
declare
  col record;
begin
  for col in
    select column_name from information_schema.columns
    where table_schema = 'public'
      and table_name = 'analytics_events'
      and is_nullable = 'NO'
      and column_default is null
      and column_name not in ('id','event_type','public_slug')
  loop
    execute format('alter table public.analytics_events alter column %I drop not null', col.column_name);
    raise notice 'Rimosso vincolo NOT NULL da analytics_events.%', col.column_name;
  end loop;
end $$;

-- In piu, per la colonna event_date nello specifico: se esiste, le diamo
-- anche un default automatico (ora corrente), cosi funziona anche se in
-- futuro un punto del codice dimenticasse di valorizzarla.
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='analytics_events' and column_name='event_date') then
    alter table public.analytics_events alter column event_date set default now();
  end if;
end $$;


-- ============ 10) FIX v23: competenze collegate a esperienze/progetti ============

alter table public.work_experiences add column if not exists linked_skills jsonb not null default '[]'::jsonb;
alter table public.projects add column if not exists linked_skills jsonb not null default '[]'::jsonb;


-- ============ 11) FIX v24: suggerimenti utenti sulla piattaforma ============

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


-- ============ FINE ============
-- Se questo script è andato in "Success. No rows returned" senza errori
-- rossi, il tuo database è allineato al 100% con l'applicazione.
