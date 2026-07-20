-- Migration v23: competenze collegate a esperienze lavorative e progetti
-- Esegui questo script nel SQL editor di Supabase dopo le migration precedenti.

alter table public.work_experiences add column if not exists linked_skills jsonb not null default '[]'::jsonb;
alter table public.projects add column if not exists linked_skills jsonb not null default '[]'::jsonb;
