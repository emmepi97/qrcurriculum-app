-- Migration v20: allegati/link nelle sezioni del portfolio
-- Esegui questo script nel SQL editor di Supabase dopo le migration precedenti.

alter table public.work_experiences add column if not exists links jsonb not null default '[]'::jsonb;
alter table public.educations add column if not exists links jsonb not null default '[]'::jsonb;
alter table public.awards add column if not exists links jsonb not null default '[]'::jsonb;
alter table public.projects add column if not exists links jsonb not null default '[]'::jsonb;
alter table public.case_studies add column if not exists links jsonb not null default '[]'::jsonb;
