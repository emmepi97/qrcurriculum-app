-- Migration v16: supporto video profilo (portfolio online)
-- Esegui questo script nel SQL editor di Supabase dopo aver applicato
-- schema.sql e migration_v15_consulting_worker_score.sql.

alter table public.personal_info add column if not exists video_url text default '';
